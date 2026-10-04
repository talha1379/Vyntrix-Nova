import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { Database } from "@/integrations/supabase/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

function publicClient() {
  const key = getEnv("SUPABASE_PUBLISHABLE_KEY");
  if (!key) throw new Error("Missing SUPABASE_PUBLISHABLE_KEY");
  return createClient<Database>(getEnv("SUPABASE_URL")!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function buildContext() {
  const supabase = publicClient();
  const [services, pricing, faqs, projects] = await Promise.all([
    supabase
      .from("services")
      .select("title, tagline, description, starting_price_usd")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("pricing_items")
      .select("name, category, description, base_price_usd, unit, is_addon")
      .eq("is_published", true)
      .order("sort_order"),
    supabase.from("faqs").select("question, answer").eq("is_published", true).order("sort_order"),
    supabase
      .from("portfolio_projects")
      .select("name, category, description, technologies")
      .eq("is_published", true)
      .order("sort_order")
      .limit(8),
  ]);

  return [
    "SERVICES:",
    (services.data ?? [])
      .map(
        (s) =>
          `- ${s.title}: ${s.tagline ?? ""} ${s.description ?? ""}${
            s.starting_price_usd ? ` (from $${s.starting_price_usd})` : ""
          }`,
      )
      .join("\n"),
    "\nPRICING ITEMS (USD base):",
    (pricing.data ?? [])
      .map(
        (p) =>
          `- ${p.name} [${p.category}${p.is_addon ? ", add-on" : ""}]: $${p.base_price_usd} ${p.unit}`,
      )
      .join("\n"),
    "\nWORK:",
    (projects.data ?? [])
      .map(
        (p) =>
          `- ${p.name} (${p.category}): ${p.description ?? ""} — ${(p.technologies ?? []).join(", ")}`,
      )
      .join("\n"),
    "\nFAQ:",
    (faqs.data ?? []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n"),
  ].join("\n");
}

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { messages?: ChatMessage[] };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const messages = (body.messages ?? [])
          .filter(
            (m): m is ChatMessage =>
              !!m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string" &&
              m.content.length > 0,
          )
          .slice(-12)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

        if (messages.length === 0) return new Response("No messages", { status: 400 });

        const apiKey = getEnv("AI_API_KEY");
        const gateway = getEnv("AI_GATEWAY_URL");
        if (!apiKey || !gateway) return new Response("AI is not configured", { status: 503 });
        const context = await buildContext();
        const isGeminiGateway = gateway.includes("generativelanguage.googleapis.com");
        const upstream = await fetch(gateway, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: isGeminiGateway ? "gemini-3.6-flash" : "google/gemini-2.5-flash",
            stream: true,
            messages: [
              {
                role: "system",
                content: `You are Nova, the assistant for VyntrixNova, a product studio building web platforms, mobile apps and AI systems.\nAnswer only from the studio information below. Be concise (max 4 short sentences or a tight bullet list), friendly and confident.\nQuote prices in USD as a starting range and note PKR is available on the pricing page. Never invent prices, clients, or guarantees.\nIf asked something you cannot answer, invite them to submit a brief at /contact.\n\nSTUDIO INFORMATION:\n${context}`,
              },
              ...messages,
            ],
          }),
        });

        if (upstream.status === 429) {
          return new Response("Too many requests, please try again shortly.", { status: 429 });
        }
        if (upstream.status === 402) {
          return new Response("AI credits exhausted.", { status: 402 });
        }
        if (!upstream.ok || !upstream.body) {
          console.error("AI gateway error", upstream.status, await upstream.text());
          return new Response("Assistant unavailable", { status: 502 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
