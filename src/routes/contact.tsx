import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check, CheckCircle2, Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CurrencyToggle, useCurrency } from "@/components/site/CurrencyToggle";
import { getPricingData } from "@/lib/cms.functions";
import { formatPrice } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_URL } from "@/components/site/WhatsAppButton";

const searchSchema = z.object({
  items: z.string().optional(),
  total: z.number().optional(),
  currency: z.enum(["USD", "PKR"]).optional(),
});

const pricingQuery = queryOptions({
  queryKey: ["pricing"],
  queryFn: () => getPricingData(),
});

const PROJECT_TYPES = [
  "Website",
  "Web app",
  "Mobile app",
  "AI system",
  "Design / branding",
  "Other",
];
const BUDGETS = ["< $2k", "$2k – $5k", "$5k – $10k", "$10k – $25k", "$25k+"];
const TIMELINES = ["ASAP", "1–2 months", "3–6 months", "Flexible"];

export const Route = createFileRoute("/contact")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Contact — Start a Project with VyntrixNova" },
      {
        name: "description",
        content:
          "Tell VyntrixNova what you're building. Share your project type, budget and timeline and we'll come back with honest scope and a plan.",
      },
      { property: "og:title", content: "Contact — Start a Project with VyntrixNova" },
      {
        property: "og:description",
        content: "Send us your brief and get scope, timeline and pricing back.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pricingQuery),
  errorComponent: () => <Shell title="Something went wrong" />,
  notFoundComponent: () => <Shell title="Page not found" />,
  component: ContactPage,
});

function Shell({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-32">
        <h1 className="text-3xl font-semibold">{title}</h1>
      </main>
      <SiteFooter />
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface-subtle px-4 py-3 text-sm text-foreground shadow-subtle outline-none transition-[background-color,border-color,box-shadow] duration-(--motion-standard) ease-(--ease-standard) placeholder:text-muted-foreground/70 hover:border-border-strong hover:bg-surface-interactive focus:border-border-focus focus:ring-2 focus:ring-ring/35";

function ContactPage() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(pricingQuery);
  const { currency, setCurrency } = useCurrency();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedIds = useMemo(
    () => (search.items ? search.items.split(",").filter(Boolean) : []),
    [search.items],
  );
  const selectedItems = data.items.filter((i) => selectedIds.includes(i.id));
  const totalUsd = selectedItems.reduce((sum, i) => sum + i.base_price_usd, 0);
  const activeCurrency = search.currency ?? currency;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("full_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim() || null,
      company: String(form.get("company") ?? "").trim() || null,
      project_type: String(form.get("project_type") ?? "") || null,
      budget_range: String(form.get("budget_range") ?? "") || null,
      timeline: String(form.get("timeline") ?? "") || null,
      message: String(form.get("message") ?? "").trim() || null,
      selected_items: selectedItems.map((i) => ({
        id: i.id,
        name: i.name,
        base_price_usd: i.base_price_usd,
      })),
      estimated_total: totalUsd || null,
      currency: activeCurrency,
      source: selectedItems.length ? "pricing_calculator" : "contact_form",
    };

    if (!payload.full_name || !payload.email) {
      toast.error("Please add your name and email.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("leads").insert(payload);
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't send that. Please try again.");
      return;
    }
    setDone(true);
    toast.success("Brief received — we'll reply within one business day.");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-20 lg:py-24">
            <div>
              <p className="marker-accent text-xs">Get in touch</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
                Let's start the conversation
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-secondary">
                Share what you're building, where you're stuck, or what needs to change. We'll come
                back with honest scope, timeline, and pricing.
              </p>
            </div>
          </div>
        </section>

        <section className="container-site py-16 md:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:gap-16">
            {/* Left Column - Context */}
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="marker-accent text-xs">How it works</p>
                <h2 className="mt-4 max-w-md text-2xl font-semibold leading-tight md:text-3xl">
                  Make every detail count.
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-foreground-secondary">
                  The more you share about your project, the faster we can scope it and come back
                  with a real plan.
                </p>
              </div>

              {/* Three Steps */}
              <div className="space-y-5 border-t border-border/40 pt-8">
                <div className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/5 text-xs font-semibold text-accent">
                    1
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">The project</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Tell us the project type and what you're building or improving.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-border/40 pt-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/5 text-xs font-semibold text-accent">
                    2
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Budget & timeline</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Share a budget range and when you'd like to start so we can prioritize.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-border/40 pt-5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/5 text-xs font-semibold text-accent">
                    3
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Your brief</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Describe the idea, goals, must-haves, or what's already built.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="min-w-0">
              {done ? (
                <div
                  className="surface-panel border border-border/60 p-8 md:p-10"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/8">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-accent">
                    Brief received
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">Thanks for reaching out</h2>
                  <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
                    Your brief has been logged and we'll review it and get back to you within one
                    business day.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 border-t border-border/40 pt-8 text-sm sm:flex-row sm:gap-6">
                    <Link
                      to="/work"
                      className="inline-flex items-center gap-2 font-medium text-accent transition-colors hover:text-foreground"
                    >
                      View our work <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-accent transition-colors hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4" /> Message us
                    </a>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="surface-panel border border-border/60 space-y-7 p-8 md:p-10"
                >
                  <div className="border-b border-border/40 pb-6">
                    <h2 className="text-lg font-semibold">Tell us about your project</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      The more context you share, the better our initial proposal can be.
                    </p>
                  </div>

                  {submitting && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary-foreground border border-primary/20"
                    >
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Submitting your brief…
                    </div>
                  )}

                  {/* Name and Email Row */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="full_name" required>
                      <input
                        id="full_name"
                        name="full_name"
                        required
                        className={inputClass}
                        placeholder="Ayesha Khan"
                      />
                    </Field>
                    <Field label="Email" htmlFor="email" required>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={inputClass}
                        placeholder="you@company.com"
                      />
                    </Field>
                  </div>

                  {/* Phone and Company Row */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Phone" htmlFor="phone">
                      <input
                        id="phone"
                        name="phone"
                        className={inputClass}
                        placeholder="+92 300 0000000"
                      />
                    </Field>
                    <Field label="Company" htmlFor="company">
                      <input
                        id="company"
                        name="company"
                        className={inputClass}
                        placeholder="Acme Ltd"
                      />
                    </Field>
                  </div>

                  {/* Project Type, Budget, Timeline */}
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="Project type" htmlFor="project_type">
                      <select
                        id="project_type"
                        name="project_type"
                        className={inputClass}
                        defaultValue={PROJECT_TYPES[0]}
                      >
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Budget range" htmlFor="budget_range">
                      <select
                        id="budget_range"
                        name="budget_range"
                        className={inputClass}
                        defaultValue={BUDGETS[1]}
                      >
                        {BUDGETS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Timeline" htmlFor="timeline">
                      <select
                        id="timeline"
                        name="timeline"
                        className={inputClass}
                        defaultValue={TIMELINES[1]}
                      >
                        {TIMELINES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* Message Textarea */}
                  <Field label="What are you building?" htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className={inputClass}
                      placeholder="Goals, must-have features, anything already built…"
                    />
                  </Field>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send brief
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar - Project Estimate and Info */}
            <aside className="space-y-5 lg:col-start-2">
              {selectedItems.length > 0 && (
                <div className="surface-panel border border-border/60 p-6 md:p-7">
                  <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-5">
                    <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Your estimate
                    </h3>
                    <CurrencyToggle currency={activeCurrency} onChange={setCurrency} />
                  </div>
                  <p className="mt-5 text-4xl font-semibold">
                    {formatPrice(totalUsd, activeCurrency, data.usdToPkrRate)}
                  </p>
                  <ul className="mt-5 space-y-3 text-sm">
                    {selectedItems.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center justify-between gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="flex items-center gap-2 text-foreground">
                          <Check className="h-4 w-4 text-accent" />
                          {i.name}
                        </span>
                        <span className="shrink-0 font-medium text-foreground">
                          {formatPrice(i.base_price_usd, activeCurrency, data.usdToPkrRate)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="surface-panel border border-border/60 p-6 md:p-7">
                <h3 className="text-sm font-medium">Build an estimate first</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Not sure what you need? Use our pricing calculator to build a scope, then submit
                  it directly.
                </p>
                <Link
                  to="/pricing"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-foreground"
                >
                  Open pricing calculator <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-accent" aria-label="required">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
