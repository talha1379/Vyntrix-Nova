import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getEnv } from "@/lib/env";
import type { Database } from "@/integrations/supabase/types";

const PROJECT_FIELDS =
  "id, name, slug, category, short_description, description, problem, solution, technologies, live_url, github_url, status, is_published, created_at, updated_at";
const IMAGE_FIELDS = "id, image_url, storage_path, is_primary, display_order, created_at";

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

export const listPublishedProjects = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select(`${PROJECT_FIELDS}, project_images(${IMAGE_FIELDS})`)
    .eq("status", "Published")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return { projects: data ?? [] };
});

export const getPublishedProject = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: project, error } = await supabase
      .from("portfolio_projects")
      .select(`${PROJECT_FIELDS}, project_images(${IMAGE_FIELDS})`)
      .eq("id", data.id)
      .eq("status", "Published")
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { project };
  });

export const listAdminPortfolioProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("portfolio_projects")
      .select(`${PROJECT_FIELDS}, project_images(${IMAGE_FIELDS})`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { projects: data ?? [] };
  });

export const savePortfolioProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id?: string; values: Record<string, unknown> }) => data)
  .handler(async ({ context, data }) => {
    const values = { ...data.values };
    if (!values.slug && values.name) {
      values.slug = String(values.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    values.is_published = values.status === "Published";
    const result = data.id
      ? await context.supabase
          .from("portfolio_projects")
          .update(values as never)
          .eq("id", data.id)
          .select("id")
          .single()
      : await context.supabase
          .from("portfolio_projects")
          .insert(values as never)
          .select("id")
          .single();
    if (result.error) throw new Error(result.error.message);
    return { id: result.data.id };
  });

export const deletePortfolioProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("portfolio_projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addProjectImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      project_id: string;
      image_url: string;
      storage_path: string;
      is_primary?: boolean;
      display_order?: number;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    if (data.is_primary) {
      await context.supabase
        .from("project_images")
        .update({ is_primary: false })
        .eq("project_id", data.project_id);
    }
    const { data: image, error } = await context.supabase
      .from("project_images")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: image.id };
  });

export const deleteProjectImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { data: image, error: readError } = await context.supabase
      .from("project_images")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (readError) throw new Error(readError.message);
    const { error } = await context.supabase.from("project_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.storage.from("project-images").remove([image.storage_path]);
    return { ok: true };
  });

export const setPrimaryProjectImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { id: string; project_id: string }) => data)
  .handler(async ({ context, data }) => {
    await context.supabase
      .from("project_images")
      .update({ is_primary: false })
      .eq("project_id", data.project_id);
    const { error } = await context.supabase
      .from("project_images")
      .update({ is_primary: true })
      .eq("id", data.id)
      .eq("project_id", data.project_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
