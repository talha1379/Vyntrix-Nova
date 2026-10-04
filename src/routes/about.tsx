import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Github, Linkedin, Star } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getAboutContent } from "@/lib/cms.functions";

const aboutQuery = queryOptions({
  queryKey: ["about-content"],
  queryFn: () => getAboutContent(),
});

const VALUES = [
  {
    title: "Scope honesty",
    body: "We tell you what we can ship in the time you have — not what sells.",
  },
  {
    title: "Weekly proof",
    body: "Every week ends with something you can click, not a status update.",
  },
  {
    title: "Own the outcome",
    body: "One accountable team from discovery through post-launch iteration.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Team — VyntrixNova Product Studio" },
      {
        name: "description",
        content:
          "Meet the VyntrixNova team: engineers, designers and strategists building web, mobile and AI products with weekly demos and honest scope.",
      },
      { property: "og:title", content: "About the Team — VyntrixNova Product Studio" },
      {
        property: "og:description",
        content: "The people behind VyntrixNova and how we run projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQuery),
  errorComponent: () => <Shell title="Something went wrong" />,
  notFoundComponent: () => <Shell title="Page not found" />,
  component: AboutPage,
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

function AboutPage() {
  const { data } = useSuspenseQuery(aboutQuery);

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 md:gap-12 md:py-20 lg:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(200px,0.4fr)] lg:items-end lg:gap-16">
            <div>
              <p className="marker-accent text-xs">About VyntrixNova</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
                A studio built around delivery.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-secondary">
                We combine design, engineering, and strategy under one roof. Every week ends with
                something real you can touch and iterate on.
              </p>
            </div>
            <div className="hidden border-l border-border/40 pl-6 lg:block">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Core belief
              </p>
              <p className="mt-3 text-lg leading-snug text-foreground">
                Clear thinking.
                <br />
                <span className="text-primary">Useful work.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="container-site py-16 md:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
            <div>
              <p className="marker-accent text-xs">01 / Philosophy</p>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">How we think about work</h2>
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-foreground-secondary md:text-xl">
              We make progress visible every week. The scope stays honest. And we own the outcome
              after launch, not just on day one.
            </p>
          </div>
        </section>

        <section className="surface-section">
          <div className="container-site py-16 md:py-24 lg:py-28">
            <div className="mb-12 flex items-end justify-between gap-6 border-b border-border/40 pb-8">
              <div>
                <p className="marker-accent text-xs">02 / Values</p>
                <h2 className="mt-4 text-2xl font-semibold md:text-3xl">What we stand for</h2>
              </div>
              <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
                The principles that guide every decision.
              </p>
            </div>
            <div className="space-y-8 border-t border-border/40 md:space-y-10">
              {VALUES.map((value, index) => (
                <article key={value.title} className="pt-8 md:pt-10 first:pt-0">
                  <div className="flex gap-6 md:gap-8">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold">{value.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {value.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {data.team.length > 0 && (
          <section className="container-site py-16 md:py-24 lg:py-28">
            <div className="mb-10 flex items-end justify-between gap-6 border-b border-border/40 pb-8">
              <div>
                <p className="marker-accent text-xs">03 / People</p>
                <h2 className="mt-4 text-2xl font-semibold md:text-3xl">The team</h2>
              </div>
              <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
                Designers, engineers, strategists.
              </p>
            </div>
            <div className="space-y-8 border-t border-border/40 md:space-y-10">
              {data.team.map((member) => (
                <article
                  key={member.id}
                  className="grid gap-6 border-b border-border/40 py-8 transition-colors hover:border-accent/30 md:grid-cols-[minmax(180px,0.75fr)_1.25fr_auto] md:items-start md:gap-10 md:py-10 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={`Portrait of ${member.full_name}`}
                        loading="lazy"
                        className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-border/40"
                      />
                    ) : (
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-border/40 bg-surface text-sm font-semibold text-foreground">
                        {member.full_name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold">{member.full_name}</h3>
                      <p className="mt-1 text-sm text-accent">{member.position}</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    {member.bio && (
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {member.bio}
                      </p>
                    )}
                    {member.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        {member.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="text-xs text-accent/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 text-muted-foreground md:justify-end">
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.full_name} on LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4 transition-colors hover:text-foreground" />
                      </a>
                    )}
                    {member.github_url && (
                      <a
                        href={member.github_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.full_name} on GitHub`}
                      >
                        <Github className="h-4 w-4 transition-colors hover:text-foreground" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {data.testimonials.length > 0 && (
          <section className="surface-section">
            <div className="container-site py-16 md:py-24 lg:py-28">
              <div className="mb-10 border-b border-border/40 pb-8">
                <p className="marker-accent text-xs">04 / Perspectives</p>
                <h2 className="mt-4 text-2xl font-semibold md:text-3xl">What clients think</h2>
              </div>
              <div className="space-y-10 border-t border-border/40 md:space-y-12">
                {data.testimonials.map((t) => (
                  <figure key={t.id} className="pt-10 first:pt-0">
                    <div className="flex gap-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <blockquote className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground-secondary md:text-xl">
                      "{t.quote}"
                    </blockquote>
                    <figcaption className="mt-5 text-sm">
                      <span className="font-medium text-foreground">{t.author_name}</span>
                      <span className="block text-muted-foreground">
                        {t.author_role}
                        {t.company ? `, ${t.company}` : ""}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container-site py-16 md:py-24 lg:py-28">
          <div className="surface-panel border border-border/60 px-8 py-12 md:px-12 md:py-16 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div>
              <p className="marker-accent text-xs">Next step</p>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">Let's start building</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Tell us what you're creating and we'll give you honest scope, timeline, and pricing.
              </p>
            </div>
            <Link
              to="/"
              hash="contact"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background lg:mt-0 lg:shrink-0"
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
