import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { Database } from "@/integrations/supabase/types";

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

export const getHomeContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();

  const [services, projects, testimonials, faqs] = await Promise.all([
    supabase
      .from("services")
      .select("id, title, slug, tagline, description, icon, starting_price_usd")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("portfolio_projects")
      .select(
        "id, name, slug, client_name, category, description, technologies, duration, status, tags",
      )
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order"),
    supabase
      .from("testimonials")
      .select("id, author_name, author_role, company, quote, rating")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order"),
    supabase
      .from("faqs")
      .select("id, question, answer, category")
      .eq("is_published", true)
      .order("sort_order")
      .limit(6),
  ]);

  return {
    services: services.data ?? [],
    projects: projects.data ?? [],
    testimonials: testimonials.data ?? [],
    faqs: faqs.data ?? [],
  };
});

export const getServicesPage = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [services, faqs] = await Promise.all([
    supabase
      .from("services")
      .select("id, title, slug, tagline, description, icon, starting_price_usd")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("faqs")
      .select("id, question, answer, category")
      .eq("is_published", true)
      .order("sort_order"),
  ]);
  return { services: services.data ?? [], faqs: faqs.data ?? [] };
});

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("portfolio_projects")
    .select(
      "id, name, slug, client_name, category, description, technologies, duration, status, tags, is_featured",
    )
    .eq("is_published", true)
    .order("sort_order");
  return { projects: data ?? [] };
});

export const getProjectBySlug = createServerFn({ method: "GET" })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: project } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return { project };
  });

export const getAboutContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [team, testimonials] = await Promise.all([
    supabase
      .from("team_members")
      .select(
        "id, full_name, position, bio, experience, skills, photo_url, linkedin_url, github_url",
      )
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("testimonials")
      .select("id, author_name, author_role, company, quote, rating")
      .eq("is_published", true)
      .order("sort_order"),
  ]);
  return { team: team.data ?? [], testimonials: testimonials.data ?? [] };
});

export const getPricingData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const [items, settings] = await Promise.all([
    supabase
      .from("pricing_items")
      .select("id, name, category, description, base_price_usd, unit, is_addon")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("site_settings")
      .select("usd_to_pkr_rate, last_rate_updated_at")
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    items: (items.data ?? []).map((i) => ({ ...i, base_price_usd: Number(i.base_price_usd) })),
    usdToPkrRate: Number(settings.data?.usd_to_pkr_rate ?? 278.5),
    rateUpdatedAt: settings.data?.last_rate_updated_at ?? null,
  };
});

export const getVisitorCountry = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const country =
    getRequestHeader("cf-ipcountry") ??
    getRequestHeader("x-vercel-ip-country") ??
    getRequestHeader("x-country-code") ??
    null;
  return { country: country?.toUpperCase() ?? null };
});
