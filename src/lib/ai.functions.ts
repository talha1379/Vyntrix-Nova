import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getEnv } from "@/lib/env";

export const generateProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { leadId: string }) => {
    if (!data?.leadId) throw new Error("Missing lead");
    return data;
  })
  .handler(async ({ context, data }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw new Error("Admins only");

    const { data: lead, error } = await context.supabase
      .from("leads")
      .select(
        "full_name, email, company, project_type, budget_range, timeline, message, currency, estimated_total, selected_items",
      )
      .eq("id", data.leadId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!lead) throw new Error("Lead not found");

    const { data: services } = await context.supabase
      .from("services")
      .select("title, tagline, starting_price_usd")
      .eq("is_published", true)
      .order("sort_order");

    // Provider-independent AI gateway configuration.
    const gatewayUrl = getEnv("AI_GATEWAY_URL");
    const apiKey = getEnv("AI_API_KEY");
    if (!gatewayUrl || !apiKey)
      throw new Error("AI is not configured. Set AI_GATEWAY_URL and AI_API_KEY.");

    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getEnv("AI_MODEL") ?? "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You write client proposals for VyntrixNova, a web/mobile/AI product studio. Output clean markdown with these sections: Overview, Scope of Work, Deliverables, Timeline, Investment, Next Steps. Keep it under 450 words, specific and free of filler. Use only the budget/estimate provided; never invent new numbers or promises.",
          },
          {
            role: "user",
            content: `Lead brief:
Name: ${lead.full_name}
Company: ${lead.company ?? "—"}
Project type: ${lead.project_type ?? "—"}
Budget range: ${lead.budget_range ?? "—"}
Timeline: ${lead.timeline ?? "—"}
Estimate: ${lead.estimated_total ? `${lead.currency} ${lead.estimated_total}` : "not calculated"}
Selected items: ${JSON.stringify(lead.selected_items ?? [])}
Message: ${lead.message ?? "—"}

Studio services: ${(services ?? [])
              .map(
                (s) =>
                  `${s.title} (${s.tagline ?? ""}${s.starting_price_usd ? `, from $${s.starting_price_usd}` : ""})`,
              )
              .join("; ")}`,
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      throw new Error("Could not generate the proposal.");
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const proposal = json.choices?.[0]?.message?.content ?? "";
    if (!proposal) throw new Error("Empty proposal returned.");
    return { proposal };
  });
