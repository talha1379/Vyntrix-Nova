import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getPortfolio, getProjectBySlug } from "@/lib/cms.functions";

const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
  });

const portfolioQuery = queryOptions({
  queryKey: ["portfolio"],
  queryFn: () => getPortfolio(),
});

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!res.project) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.project) {
      return {
        meta: [{ title: "Unavailable — VyntrixNova" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.project;
    const description =
      p.description ??
      `A ${p.category} project delivered by VyntrixNova for ${p.client_name ?? "our client"}.`;
    return {
      meta: [
        { title: `${p.name} — Case Study | VyntrixNova` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${p.name} — Case Study | VyntrixNova` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Shell title="Something went wrong" />,
  notFoundComponent: () => <Shell title="Case study not found" />,
  component: ProjectPage,
});

function Shell({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-32">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <Link to="/work" className="mt-6 inline-block text-sm text-accent">
          Back to all work
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProjectPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const portfolio = useQuery(portfolioQuery);
  const project = data.project;
  if (!project) return <Shell title="Case study not found" />;

  const projects = portfolio.data?.projects ?? [];
  const projectIndex = projects.findIndex((item) => item.slug === project.slug);
  const previousProject = projectIndex > 0 ? projects[projectIndex - 1] : undefined;
  const nextProject = projectIndex >= 0 ? projects[projectIndex + 1] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="grid-backdrop border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:pb-28 md:pt-12">
            <Link
              to="/work"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All case studies
            </Link>
            <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.42fr)] md:items-end md:gap-20">
              <div>
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-accent">
                  <span className="h-px w-10 bg-primary" />
                  <span>Case study</span>
                </div>
                <h1 className="mt-7 max-w-4xl text-[clamp(2rem,6vw,5rem)] font-semibold leading-[1.02]">
                  {project.name}
                </h1>
                {project.client_name && (
                  <p className="mt-6 text-lg text-muted-foreground">For {project.client_name}</p>
                )}
              </div>
              <div className="border-l border-border pl-5 md:mb-2 md:pl-7">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Project focus
                </p>
                <p className="mt-3 text-lg leading-relaxed text-foreground-secondary">
                  {project.short_description || project.description}
                </p>
              </div>
            </div>

            <dl className="mt-16 grid gap-7 border-t border-border/70 pt-7 sm:grid-cols-2 md:grid-cols-4">
              {project.client_name && <Meta label="Client" value={project.client_name} />}
              {project.category && <Meta label="Category" value={project.category} />}
              {project.duration && <Meta label="Duration" value={project.duration} />}
              {project.status && <Meta label="Status" value={project.status} />}
            </dl>
          </div>
        </section>

        <article className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          {project.description && (
            <section className="grid gap-8 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-12">
              <SectionMarker number="01" label="Project context" />
              <p className="max-w-3xl text-2xl leading-relaxed text-foreground-secondary md:text-4xl md:leading-tight">
                {project.description}
              </p>
            </section>
          )}
          {project.problem && (
            <section className="mt-24 grid gap-8 border-t border-border/70 pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-12">
              <SectionMarker number="02" label="The challenge" />
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                {project.problem}
              </p>
            </section>
          )}
          {project.solution && (
            <section className="mt-24 grid gap-8 border-t border-border/70 pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-12">
              <SectionMarker number="03" label="The build" />
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                {project.solution}
              </p>
            </section>
          )}
          {project.technologies.length > 0 && (
            <section className="mt-24 grid gap-8 border-t border-border/70 pt-8 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-12">
              <SectionMarker number="04" label="Technology stack" />
              <div className="grid max-w-3xl sm:grid-cols-2">
                {project.technologies.map((technology, index) => (
                  <div
                    key={technology}
                    className="flex items-center gap-4 border-b border-border/60 py-4"
                  >
                    <span className="font-display text-xs text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg text-foreground-secondary">{technology}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {project.tags.length > 0 && (
            <section className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-6">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Tags
              </span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {project.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-24 border-y border-border py-8 md:mt-32 md:py-10">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Project at a glance</p>
            <dl className="mt-8 grid gap-7 sm:grid-cols-2 md:grid-cols-4">
              {project.client_name && <Meta label="Client" value={project.client_name} />}
              {project.category && <Meta label="Category" value={project.category} />}
              {project.duration && <Meta label="Duration" value={project.duration} />}
              <Meta label="Technologies" value={`${project.technologies.length} in the stack`} />
            </dl>
          </section>

          <section className="mt-24 border border-border bg-surface/30 px-6 py-12 md:mt-32 md:px-12 md:py-16">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              Have a project in mind?
            </p>
            <div className="mt-5 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-5xl">
                Let&apos;s build something worth remembering.
              </h2>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-accent transition-colors hover:text-foreground md:self-auto"
              >
                Start a project <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </section>

          {(previousProject || nextProject) && (
            <nav
              aria-label="Case study navigation"
              className="mt-24 grid border-t border-border md:grid-cols-2"
            >
              {previousProject ? (
                <Link
                  to="/work/$slug"
                  params={{ slug: previousProject.slug }}
                  className="group border-b border-border py-8 transition-colors hover:border-accent md:border-b-0 md:border-r md:pr-10"
                >
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Previous
                  </span>
                  <span className="mt-4 flex items-center gap-3 text-2xl font-semibold">
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    {previousProject.name}
                  </span>
                </Link>
              ) : (
                <div className="hidden md:block" />
              )}
              {nextProject && (
                <Link
                  to="/work/$slug"
                  params={{ slug: nextProject.slug }}
                  className="group py-8 text-left transition-colors hover:border-accent md:pl-10 md:text-right"
                >
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Next
                  </span>
                  <span className="mt-4 flex items-center justify-start gap-3 text-2xl font-semibold md:justify-end">
                    {nextProject.name}
                    <ArrowLeft className="h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )}
            </nav>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm text-foreground-secondary">{value}</dd>
    </div>
  );
}

function SectionMarker({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <span className="font-display text-sm text-accent">{number}</span>
      <h2 className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</h2>
    </div>
  );
}
