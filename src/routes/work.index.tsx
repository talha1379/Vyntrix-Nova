import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getPortfolio } from "@/lib/cms.functions";

const portfolioQuery = queryOptions({
  queryKey: ["portfolio"],
  queryFn: () => getPortfolio(),
});

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Work — Client Projects & Case Studies | VyntrixNova" },
      {
        name: "description",
        content:
          "Browse VyntrixNova case studies: web platforms, mobile apps and AI systems delivered for clients, with the stack and outcomes behind each build.",
      },
      { property: "og:title", content: "Work — Client Projects & Case Studies | VyntrixNova" },
      {
        property: "og:description",
        content: "Case studies from web, mobile and AI engagements delivered by VyntrixNova.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery),
  errorComponent: () => <Shell title="Something went wrong" />,
  notFoundComponent: () => <Shell title="Page not found" />,
  component: WorkPage,
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

function WorkPage() {
  const { data } = useSuspenseQuery(portfolioQuery);
  const featuredProject = data.projects.find((project) => project.is_featured) ?? data.projects[0];
  const supportingProjects = featuredProject
    ? data.projects.filter((project) => project.id !== featuredProject.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="grid-backdrop border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
            <div className="max-w-4xl">
              <p className="text-sm uppercase tracking-[0.22em] text-accent">Selected work</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.02]">
                Work that solves <span className="text-primary">real problems.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                A selection of platforms, apps and AI systems we designed, built and shipped. Each
                case study follows the thinking behind the work, not just the final interface.
              </p>
            </div>
            <div className="mt-16 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px w-12 bg-primary" />
              <span>{data.projects.length} case studies</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          {featuredProject ? (
            <>
              <Link
                to="/work/$slug"
                params={{ slug: featuredProject.slug }}
                className="group block border-y border-border py-8 transition-colors hover:border-accent/70 md:py-12"
              >
                <div className="grid gap-10 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:items-end md:gap-16">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="text-accent">Featured case study</span>
                      {featuredProject.category && <span>{featuredProject.category}</span>}
                      {featuredProject.duration && <span>{featuredProject.duration}</span>}
                    </div>
                    <h2 className="mt-8 max-w-xl text-4xl font-semibold leading-tight md:text-6xl">
                      {featuredProject.name}
                    </h2>
                    {featuredProject.client_name && (
                      <p className="mt-4 text-muted-foreground">
                        For {featuredProject.client_name}
                      </p>
                    )}
                  </div>
                  <div className="md:pb-1">
                    <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                      {featuredProject.description}
                    </p>
                    {featuredProject.technologies.length > 0 && (
                      <div className="mt-8 flex flex-wrap gap-2">
                        {featuredProject.technologies.slice(0, 5).map((technology) => (
                          <span
                            key={technology}
                            className="rounded-md border border-border bg-surface/60 px-2.5 py-1 text-xs text-secondary-foreground"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-9 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent">
                      Read the case study
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>

              {supportingProjects.length > 0 && (
                <div className="mt-16">
                  <div className="mb-8 flex items-center justify-between border-b border-border/60 pb-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      More case studies
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {String(supportingProjects.length).padStart(2, "0")} supporting
                    </span>
                  </div>
                  <div>
                    {supportingProjects.map((project, index) => (
                      <Link
                        key={project.id}
                        to="/work/$slug"
                        params={{ slug: project.slug }}
                        className="group grid gap-5 border-b border-border/60 py-8 transition-colors hover:border-accent/70 md:grid-cols-[5rem_minmax(0,0.8fr)_minmax(0,1fr)_auto] md:items-center md:gap-8"
                      >
                        <span className="font-display text-sm text-accent">
                          {String(index + 2).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                            <span>{project.category}</span>
                            {project.duration && <span>{project.duration}</span>}
                          </div>
                          <h2 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
                            {project.name}
                          </h2>
                          {project.client_name && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              For {project.client_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {project.description}
                          </p>
                          {project.technologies.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {project.technologies.slice(0, 3).map((technology) => (
                                <span
                                  key={technology}
                                  className="text-xs text-secondary-foreground"
                                >
                                  {technology}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex min-h-11 items-center gap-2 text-sm text-accent md:justify-self-end">
                          View case study
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="border-y border-border py-16">
              <p className="text-sm uppercase tracking-[0.18em] text-accent">The next chapter</p>
              <h2 className="mt-4 text-3xl font-semibold">No case studies published yet.</h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                We are preparing the next set of work. Check back soon to explore how we approach
                complex digital problems.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
