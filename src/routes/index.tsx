import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Code2,
  Palette,
  PenTool,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { getHomeContent } from "@/lib/cms.functions";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: () => getHomeContent(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VyntrixNova — Web, Mobile & AI Product Studio" },
      {
        name: "description",
        content:
          "VyntrixNova builds web platforms, mobile apps and AI systems for teams that need work shipped. See our services, featured projects and process.",
      },
      {
        property: "og:title",
        content: "VyntrixNova — Web, Mobile & AI Product Studio",
      },
      {
        property: "og:description",
        content:
          "A product studio building web, mobile and AI systems that ship. Explore services, featured work and how we run projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
});

const ICONS: Record<string, typeof Code2> = {
  Code2,
  Smartphone,
  Sparkles,
  PenTool,
  Palette,
  TrendingUp,
};

const PROCESS = [
  {
    step: "01",
    title: "Discovery",
    body: "We map goals, constraints and the smallest useful scope.",
  },
  {
    step: "02",
    title: "Design",
    body: "Flows, wireframes and a design system before a line of code.",
  },
  {
    step: "03",
    title: "Build",
    body: "Weekly demos against a milestone plan you can hold us to.",
  },
  {
    step: "04",
    title: "Launch & grow",
    body: "Ship, instrument, then iterate on what the data shows.",
  },
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = revealRef.current?.querySelectorAll(".reveal-on-scroll");

    if (!elements?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={revealRef} className="min-h-screen overflow-hidden bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative container-site grid min-h-[34rem] items-center gap-12 py-20 md:min-h-[38rem] md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.65fr)] lg:gap-14 lg:py-28">
            <div>
              <span className="marker-accent hero-fade hero-delay-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Taking new projects for Q4
              </span>

              <h1 className="hero-fade hero-delay-2 mt-6 max-w-3xl text-[clamp(2.8rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] md:mt-7 lg:max-w-[14ch]">
                We build the <span className="text-primary">digital systems</span> your business
                actually runs on.
              </h1>

              <p className="hero-fade hero-delay-3 mt-6 max-w-lg text-[1.125rem] leading-[1.7] text-foreground-secondary md:mt-7">
                Web platforms, mobile apps and AI tooling — designed, engineered and shipped by one
                accountable team.
              </p>

              <div className="hero-fade hero-delay-4 mt-8 flex flex-wrap items-center gap-3 md:mt-9 md:gap-4">
                <Button asChild size="lg" className="premium-button">
                  <a href="#contact">
                    Start a project <ArrowUpRight />
                  </a>
                </Button>

                <Button asChild variant="link" size="lg">
                  <a href="#work">
                    See our work <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>

            <div className="hero-visual relative hidden min-h-72 lg:block">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />

              <div className="hero-orbit absolute right-8 top-1/2 grid h-32 w-32 -translate-y-1/2 place-items-center rounded-full border border-border bg-background text-center backdrop-blur-sm">
                <span className="font-display text-sm leading-snug text-foreground-secondary">
                  One team
                  <br />
                  <span className="text-primary">from brief to build</span>
                </span>
              </div>

              <div className="absolute bottom-3 right-0 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Web / Mobile / AI
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="container-site scroll-mt-20 py-24 md:py-section-lg">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div className="reveal-on-scroll">
              <p className="marker-accent">Capabilities</p>

              <h2 className="mt-5 text-3xl font-semibold md:text-h2">What we do</h2>

              <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
                Six disciplines, one team. Engaged individually or as a full delivery unit.
              </p>
            </div>

            <div className="grid gap-x-8 sm:grid-cols-2">
              {data.services.map((service, index) => {
                const Icon = ICONS[service.icon ?? "Code2"] ?? Code2;

                return (
                  <article
                    key={service.id}
                    className={`reveal-on-scroll stagger-${Math.min(
                      index + 1,
                      6,
                    )} group border-t border-border py-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent ${
                      index === 0 ? "first:border-t-0 sm:first:border-t" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg p-1.5 transition-all duration-300 group-hover:bg-primary/10">
                          <Icon className="h-5 w-5 text-accent transition-transform duration-300 group-hover:scale-110" />
                        </div>

                        <h3 className="text-lg font-semibold">{service.title}</h3>
                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" />
                    </div>

                    <p className="mt-3 text-sm text-accent">{service.tagline}</p>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>

                    {service.starting_price_usd != null && (
                      <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
                        From ${Number(service.starting_price_usd).toLocaleString("en-US")}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured work */}
        <section id="work" className="surface-section scroll-mt-20">
          <div className="container-site py-24 md:py-section-lg">
            <div className="reveal-on-scroll flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="marker-accent">Selected engagements</p>

                <h2 className="mt-5 text-3xl font-semibold md:text-h2">Featured work</h2>
              </div>

              <p className="max-w-sm leading-relaxed text-muted-foreground">
                Selected engagements with measurable outcomes.
              </p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              {data.projects.map((project, index) => (
                <article
                  key={project.id}
                  className={`reveal-on-scroll stagger-${Math.min(
                    index + 1,
                    6,
                  )} group flex flex-col justify-between border-t border-border py-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent ${
                    index === 0
                      ? "lg:row-span-2 lg:min-h-[28rem] lg:border-brand lg:px-8 lg:py-9"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                      <span>{project.category}</span>
                      <span>{project.duration}</span>
                    </div>

                    <h3 className="mt-8 text-2xl font-semibold transition-colors duration-300 group-hover:text-accent">
                      {project.name}
                    </h3>

                    <p className="mt-2 text-sm text-accent">{project.client_name}</p>

                    <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-all duration-200 group-hover:-translate-y-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <Link
                      to="/work/$slug"
                      params={{ slug: project.slug }}
                      aria-label={`View ${project.name} case study`}
                      className="shrink-0 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-accent"
                    >
                      View case study{" "}
                      <ArrowUpRight className="ml-1 inline h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="container-site scroll-mt-20 py-24 md:py-section-lg">
          <div className="reveal-on-scroll max-w-2xl">
            <p className="marker-accent">The method</p>

            <h2 className="mt-5 text-3xl font-semibold md:text-h2">How we work</h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((phase, index) => (
              <div
                key={phase.step}
                className={`reveal-on-scroll stagger-${index + 1} group relative border-t border-border pt-5 transition-transform duration-300 hover:-translate-y-1 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-primary before:transition-all before:duration-300 hover:before:w-full`}
              >
                <span className="font-display text-xs tracking-widest text-accent">
                  {phase.step}
                </span>

                <h3 className="mt-3 text-base font-semibold transition-colors group-hover:text-accent">
                  {phase.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{phase.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="surface-section">
          <div className="container-site py-24 md:py-section-lg">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="reveal-on-scroll">
                <p className="marker-accent">Proof of partnership</p>

                <h2 className="mt-5 text-3xl font-semibold md:text-h2">Client words</h2>
              </div>

              <div className="divide-y divide-border border-y border-border">
                {data.testimonials.map((item, index) => (
                  <figure
                    key={item.id}
                    className={`reveal-on-scroll stagger-${Math.min(
                      index + 1,
                      6,
                    )} py-8 first:pt-7 last:pb-7 transition-transform duration-300 hover:translate-x-1`}
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-accent text-accent transition-transform duration-200 hover:scale-125"
                        />
                      ))}
                    </div>

                    <blockquote className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground-secondary">
                      “{item.quote}”
                    </blockquote>

                    <figcaption className="mt-6 text-sm">
                      <span className="font-medium">{item.author_name}</span>

                      <span className="block text-muted-foreground">
                        {item.author_role}, {item.company}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container-content scroll-mt-20 py-24 md:py-section-lg">
          <div className="reveal-on-scroll">
            <p className="marker-accent">Good to know</p>

            <h2 className="mt-5 text-3xl font-semibold md:text-h2">Questions</h2>
          </div>

          <div className="reveal-on-scroll mt-10 divide-y divide-border border-y border-border">
            {data.faqs.map((faq) => (
              <details key={faq.id} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                  {faq.question}

                  <span className="text-xl font-light text-accent transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="scroll-mt-20 px-5 pb-28">
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden border-y border-border py-20 md:py-28">
            <div className="grid-backdrop absolute inset-0 -z-10 opacity-45" />

            <div className="reveal-on-scroll relative mx-auto max-w-3xl text-center">
              <p className="marker-accent">Next, let’s make it real</p>

              <h2 className="mt-6 text-4xl font-semibold md:text-display">
                Tell us what you're building
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Share the goal and constraints. We'll come back with a scope, a timeline and a
                price.
              </p>

              <Button asChild size="lg" className="premium-button mt-8">
                <a href="mailto:hello@vyntrixnova.com">
                  hello@vyntrixnova.com <ArrowUpRight />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
