import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Code2,
  Palette,
  PenTool,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getServicesPage } from "@/lib/cms.functions";

const servicesQuery = queryOptions({
  queryKey: ["services-page"],
  queryFn: () => getServicesPage(),
});

const ICONS: Record<string, typeof Code2> = {
  Code2,
  Smartphone,
  Sparkles,
  PenTool,
  Palette,
  TrendingUp,
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Web, Mobile & AI Engineering | VyntrixNova" },
      {
        name: "description",
        content:
          "Explore VyntrixNova services: web platforms, mobile apps, AI systems, product design, branding and growth — with transparent starting prices.",
      },
      { property: "og:title", content: "Services — Web, Mobile & AI Engineering | VyntrixNova" },
      {
        property: "og:description",
        content: "Six delivery disciplines with clear scope and transparent starting prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  errorComponent: () => <PageMessage title="Something went wrong" />,
  notFoundComponent: () => <PageMessage title="Page not found" />,
  component: ServicesPage,
});

function PageMessage({ title }: { title: string }) {
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

function ServicesPage() {
  const { data } = useSuspenseQuery(servicesQuery);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] lg:items-end lg:gap-20">
            <div>
              <p className="marker-accent">Services / Capabilities</p>
              <h1 className="mt-6 max-w-3xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-tight">
                What can VyntrixNova <span className="text-primary">actually build for you?</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-foreground-secondary md:text-lg">
                From web products and mobile apps to AI workflow systems and product design, we help
                teams move from ambiguity to shipped outcomes.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface/60 px-5 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  View pricing
                </Link>
              </div>
            </div>
            <div className="border-l border-border/70 pl-6 lg:block">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Delivery model
              </p>
              <p className="mt-3 font-display text-xl leading-snug text-foreground-secondary">
                One accountable team
                <br />
                <span className="text-accent">from brief to build.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="container-site py-20 md:py-section-lg">
          <div className="mb-10 flex items-end justify-between gap-6 border-b border-border/70 pb-6">
            <div>
              <p className="marker-accent">The capabilities</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-h2">Built for the work ahead</h2>
            </div>
            <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted-foreground sm:block">
              Choose the discipline you need, or bring the entire studio in.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.services.map((service, index) => {
              const Icon = ICONS[service.icon ?? "Code2"] ?? Code2;
              const featured = index === 0;

              return (
                <article
                  key={service.id}
                  className={[
                    "group relative overflow-hidden border border-border/70 bg-surface/30 transition-colors duration-200 hover:border-accent/60",
                    featured ? "md:col-span-2 xl:col-span-2" : "",
                  ].join(" ")}
                >
                  <div className="flex h-full flex-col p-6 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="rounded-full border border-border/70 bg-background/80 p-2.5">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold leading-tight md:text-3xl">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm text-accent">{service.tagline}</p>
                    </div>

                    <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {service.description}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
                      {service.starting_price_usd != null ? (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                            Starting at
                          </p>
                          <p className="mt-2 text-lg font-medium text-foreground">
                            ${Number(service.starting_price_usd).toLocaleString("en-US")}
                          </p>
                        </div>
                      ) : (
                        <div />
                      )}
                      <Link
                        to="/contact"
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-foreground"
                      >
                        Talk to us
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {data.faqs.length > 0 && (
          <section className="surface-section">
            <div className="container-content py-20 md:py-section-lg">
              <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
                <div>
                  <p className="marker-accent">Good to know</p>
                  <h2 className="mt-4 text-3xl font-semibold md:text-h2">Questions we get a lot</h2>
                </div>
                <div className="divide-y divide-border/60 border-t border-border/70">
                  {data.faqs.map((faq) => (
                    <div key={faq.id} className="py-6 first:pt-5">
                      <h3 className="text-base font-medium text-foreground">{faq.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="container-site py-20 md:py-section-lg">
          <div className="grid-backdrop relative overflow-hidden border border-border/70 bg-background-elevated px-6 py-12 md:px-12 md:py-14 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <p className="marker-accent">Next step</p>
              <h2 className="mt-5 text-3xl font-semibold">Have a project in mind?</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Tell us the outcome you need — we&apos;ll come back with scope, timing, and the
                right team for the work.
              </p>
            </div>
            <Link
              to="/contact"
              className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 lg:mt-0 lg:ml-8"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
