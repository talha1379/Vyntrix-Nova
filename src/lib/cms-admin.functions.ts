import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TABLES = [
  "services",
  "portfolio_projects",
  "testimonials",
  "faqs",
  "team_members",
  "pricing_items",
] as const;

export type CmsTable = (typeof TABLES)[number];
export type CmsValue = string | number | boolean | null | string[];
export type CmsRow = Record<string, CmsValue>;

function assertTable(table: string): CmsTable {
  if (!(TABLES as readonly string[]).includes(table)) throw new Error("Unknown content type");
  return table as CmsTable;
}

export const listContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { table: string }) => data)
  .handler(async ({ context, data }) => {
    const table = assertTable(data.table);
    const { data: rows, error } = await context.supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as CmsRow[] };
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { table: string; id?: string; values: CmsRow }) => data)
  .handler(async ({ context, data }) => {
    const table = assertTable(data.table);
    if (data.id) {
      const { error } = await context.supabase
        .from(table)
        .update(data.values as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await context.supabase
      .from(table)
      .insert(data.values as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id };
  });

export const deleteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { table: string; id: string }) => data)
  .handler(async ({ context, data }) => {
    const table = assertTable(data.table);
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("site_settings")
      .select("id, usd_to_pkr_rate, last_rate_updated_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
  });

export const updateRate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string; rate: number }) => data)
  .handler(async ({ context, data }) => {
    if (!Number.isFinite(data.rate) || data.rate <= 0) throw new Error("Invalid rate");
    const { error } = await context.supabase
      .from("site_settings")
      .update({ usd_to_pkr_rate: data.rate, last_rate_updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [leads, services, projects, pricing] = await Promise.all([
      context.supabase
        .from("leads")
        .select("status, estimated_total, currency, created_at, source"),
      context.supabase.from("services").select("id", { count: "exact", head: true }),
      context.supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
      context.supabase.from("pricing_items").select("id", { count: "exact", head: true }),
    ]);

    const rows = leads.data ?? [];
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let pipelineUsd = 0;
    let wonUsd = 0;

    for (const l of rows) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
      bySource[l.source] = (bySource[l.source] ?? 0) + 1;
      const value = Number(l.estimated_total ?? 0);
      if (!value) continue;
      if (l.status === "won") wonUsd += value;
      else if (l.status !== "lost") pipelineUsd += value;
    }

    return {
      totalLeads: rows.length,
      last30: rows.filter((l) => new Date(l.created_at).getTime() >= since).length,
      byStatus,
      bySource,
      pipelineUsd,
      wonUsd,
      counts: {
        services: services.count ?? 0,
        projects: projects.count ?? 0,
        pricing: pricing.count ?? 0,
      },
    };
  });
