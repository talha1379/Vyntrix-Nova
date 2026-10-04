import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OWNER_EMAIL = "muhammad.mobeen.bsse-2025a@cecosian.edu.pk";

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String(
      (context.claims as Record<string, unknown> | undefined)?.["email"] ?? "",
    ).toLowerCase();

    if (email === OWNER_EMAIL) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { userId: context.userId, roles, isAdmin: roles.includes("admin") };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select(
        "id, full_name, email, company, phone, project_type, budget_range, timeline, message, currency, estimated_total, selected_items, source, status, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { leads: data ?? [] };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ context, data }) => {
    const allowed = ["new", "contacted", "qualified", "proposal", "won", "lost"];
    if (!allowed.includes(data.status)) throw new Error("Invalid status");
    const { error } = await context.supabase
      .from("leads")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
