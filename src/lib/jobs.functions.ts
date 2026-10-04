import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getEnv } from "@/lib/env";
import type { Database } from "@/integrations/supabase/types";

const JOB_FIELDS =
  "id, title, department, employment_type, location, experience_level, short_description, description, responsibilities, requirements, skills, benefits, application_deadline, status, created_at, updated_at";

function publicClient() {
  const key = getEnv("SUPABASE_PUBLISHABLE_KEY");
  if (!key) throw new Error("Missing SUPABASE_PUBLISHABLE_KEY");
  return createClient<Database>(getEnv("SUPABASE_URL")!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listPublishedJobs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_FIELDS)
    .eq("status", "Published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { jobs: data ?? [] };
});

export const getPublishedJob = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: job, error } = await supabase
      .from("jobs")
      .select(JOB_FIELDS)
      .eq("id", data.id)
      .eq("status", "Published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { job };
  });

export const listAdminJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("jobs")
      .select(JOB_FIELDS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: applications, error: applicationError } = await context.supabase
      .from("job_applications")
      .select(
        "id, job_id, full_name, email, phone, location, linkedin_url, portfolio_url, cover_message, resume_url, status, created_at",
      );
    if (applicationError) throw new Error(applicationError.message);
    const applicationsWithLinks = await Promise.all(
      (applications ?? []).map(async (application) => {
        const { data: signed } = await context.supabase.storage
          .from("job-resumes")
          .createSignedUrl(application.resume_url, 60 * 10);
        return { ...application, resume_link: signed?.signedUrl ?? null };
      }),
    );
    return { jobs: data ?? [], applications: applicationsWithLinks };
  });

export const saveJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id?: string; values: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const result = data.id
      ? await context.supabase
          .from("jobs")
          .update(data.values as never)
          .eq("id", data.id)
          .select("id")
          .single()
      : await context.supabase
          .from("jobs")
          .insert(data.values as never)
          .select("id")
          .single();
    if (result.error) throw new Error(result.error.message);
    return { id: result.data.id };
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("jobs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ context, data }) => {
    const allowed = ["New", "Reviewing", "Shortlisted", "Interview", "Selected", "Rejected"];
    if (!allowed.includes(data.status)) throw new Error("Invalid application status");
    const { error } = await context.supabase
      .from("job_applications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("job_applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
