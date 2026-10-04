import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ChildKind = "project_milestones" | "project_files" | "invoices";

const CHILD_KINDS: ChildKind[] = ["project_milestones", "project_files", "invoices"];

function assertChild(kind: string): ChildKind {
  if (!CHILD_KINDS.includes(kind as ChildKind)) throw new Error("Unknown record type");
  return kind as ChildKind;
}

async function assertAdmin(
  supabase: { rpc: (fn: never, args: never) => PromiseLike<{ data: unknown }> },
  userId: string,
) {
  const { data } = await supabase.rpc(
    "has_role" as never,
    {
      _user_id: userId,
      _role: "admin",
    } as never,
  );
  if (data !== true) throw new Error("Admin access required");
}

/* ---------------- client portal ---------------- */

export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("client_projects")
      .select(
        "id, name, summary, status, progress, start_date, target_date, currency, contract_value_usd, created_at",
      )
      .eq("client_user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

export const getProjectDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { projectId: string }) => data)
  .handler(async ({ context, data }) => {
    const [milestones, files, invoices, messages] = await Promise.all([
      context.supabase
        .from("project_milestones")
        .select("id, title, details, status, due_date, sort_order")
        .eq("project_id", data.projectId)
        .order("sort_order", { ascending: true }),
      context.supabase
        .from("project_files")
        .select("id, label, url, file_type, size_kb, created_at")
        .eq("project_id", data.projectId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("invoices")
        .select("id, number, description, amount, currency, status, issued_at, due_at")
        .eq("project_id", data.projectId)
        .order("issued_at", { ascending: false }),
      context.supabase
        .from("project_messages")
        .select("id, sender_id, sender_label, body, created_at")
        .eq("project_id", data.projectId)
        .order("created_at", { ascending: true }),
    ]);

    return {
      milestones: milestones.data ?? [],
      files: files.data ?? [],
      invoices: invoices.data ?? [],
      messages: messages.data ?? [],
      viewerId: context.userId,
    };
  });

export const postProjectMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { projectId: string; body: string; label?: string }) => data)
  .handler(async ({ context, data }) => {
    const body = data.body.trim();
    if (!body) throw new Error("Message can't be empty");
    if (body.length > 4000) throw new Error("Message is too long");
    const { error } = await context.supabase.from("project_messages").insert({
      project_id: data.projectId,
      sender_id: context.userId,
      sender_label: data.label === "Team" ? "Team" : "Client",
      body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- admin management ---------------- */

export const adminListProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("client_projects")
      .select(
        "id, name, summary, status, progress, start_date, target_date, currency, contract_value_usd, client_user_id, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

export const adminSaveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      id?: string;
      name: string;
      summary?: string;
      status?: string;
      progress?: number;
      target_date?: string | null;
      currency?: string;
      contract_value_usd?: number;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const values = {
      name: data.name,
      summary: data.summary ?? null,
      status: data.status ?? "Discovery",
      progress: Math.min(100, Math.max(0, Number(data.progress ?? 0))),
      target_date: data.target_date || null,
      currency: data.currency === "PKR" ? "PKR" : "USD",
      contract_value_usd: Number(data.contract_value_usd ?? 0),
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("client_projects")
        .update(values)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("client_projects")
      .insert(values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("client_projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Links a project to a client account by their sign-in email. */
export const adminAssignClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { projectId: string; email: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const email = data.email.trim().toLowerCase();
    if (!email) throw new Error("Email required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) throw new Error(listError.message);
    const user = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (!user) throw new Error("No account found with that email — ask them to sign up first.");

    const { error } = await context.supabase
      .from("client_projects")
      .update({ client_user_id: user.id })
      .eq("id", data.projectId);
    if (error) throw new Error(error.message);
    return { clientUserId: user.id };
  });

export const adminSaveChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      kind: string;
      projectId: string;
      id?: string;
      values: Record<string, string | number | null>;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const kind = assertChild(data.kind);
    const payload = { ...data.values, project_id: data.projectId };
    if (data.id) {
      const { error } = await context.supabase
        .from(kind)
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from(kind)
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

export const adminDeleteChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { kind: string; id: string }) => data)
  .handler(async ({ context, data }) => {
    const kind = assertChild(data.kind);
    const { error } = await context.supabase.from(kind).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
