import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, ImageIcon, Send } from "lucide-react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listPublishedProjects } from "@/lib/portfolio.functions";

type Project = Awaited<ReturnType<typeof listPublishedProjects>>["projects"][number];

const projectsQuery = queryOptions({
  queryKey: ["published-projects"],
  queryFn: () => listPublishedProjects(),
});

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects | VyntrixNova" },
      {
        name: "description",
        content:
          "Explore digital products, websites, applications, and technology solutions built by VyntrixNova.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const query = useQuery(projectsQuery);
  const projects = query.data?.projects ?? [];
  const featuredProject = projects.find((project) => project.is_featured);
  const archiveProjects = featuredProject
    ? projects.filter((project) => project.id !== featuredProject.id)
    : projects;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="grid-backdrop border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.22em] text-accent">Project archive</p>
                <h1 className="mt-5 max-w-2xl text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.03]">
                  Things we&apos;ve built,{" "}
                  <span className="text-primary">designed, and shipped.</span>
                </h1>
              </div>
              <div className="border-l border-border pl-5 md:mb-1 md:max-w-xs">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  A curated inventory of digital products, platforms, and systems from the studio.
                </p>
              </div>
            </div>
            <div className="mt-14 flex items-center justify-between border-t border-border/70 pt-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>Selected builds</span>
              <span>{String(projects.length).padStart(2, "0")} projects</span>
            </div>
          </div>
        </section>
        <section id="published-projects" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          {query.isLoading && <LoadingState />}
          {query.isError && <ErrorState onRetry={() => query.refetch()} />}
          {!query.isLoading && !query.isError && projects.length === 0 && <EmptyState />}

          {!query.isLoading && !query.isError && featuredProject && (
            <ProjectShowcase project={featuredProject} index={1} featured />
          )}

          {!query.isLoading && !query.isError && archiveProjects.length > 0 && (
            <div className={featuredProject ? "mt-20" : ""}>
              <div className="mb-8 flex items-center justify-between border-b border-border/70 pb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Project inventory
                </p>
                <span className="text-xs text-muted-foreground">
                  {archiveProjects.length} builds
                </span>
              </div>
              <div className="grid gap-x-5 gap-y-12 md:grid-cols-2">
                {archiveProjects.map((project, index) => (
                  <ProjectShowcase
                    key={project.id}
                    project={project}
                    index={featuredProject ? index + 2 : index + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProjectShowcase({
  project,
  index,
  featured = false,
}: {
  project: Project;
  index: number;
  featured?: boolean;
}) {
  const images = project.project_images ?? [];
  const image = images.find((item) => item.is_primary) ?? images[0];

  return (
    <article className={`group ${featured ? "border-y border-border py-8 md:py-12" : ""}`}>
      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="block rounded-sm transition-colors focus-visible:outline-offset-4"
      >
        <div
          className={`relative overflow-hidden bg-secondary ${
            featured ? "aspect-[16/8]" : "aspect-[16/10]"
          }`}
        >
          {image?.image_url ? (
            <img
              src={image.image_url}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_70%_20%,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent_35%),var(--color-secondary)] p-6 text-center">
              <div>
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <span className="mt-3 block font-display text-7xl font-semibold text-foreground/10 md:text-9xl">
                  {String(index).padStart(2, "0")}
                </span>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent">
                  {project.category}
                </p>
              </div>
            </div>
          )}
          {project.is_featured && (
            <span className="absolute left-4 top-4 border border-accent/50 bg-background/85 px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-accent">
              Featured build
            </span>
          )}
        </div>
        <div className="pt-5">
          <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <span>
              {String(index).padStart(2, "0")} / {project.category}
            </span>
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <h2
            className={
              featured
                ? "mt-5 text-4xl font-semibold leading-tight md:text-6xl"
                : "mt-4 text-2xl font-semibold leading-tight md:text-3xl"
            }
          >
            {project.name}
          </h2>
          {project.client_name && (
            <p className="mt-2 text-sm text-muted-foreground">For {project.client_name}</p>
          )}
          <p
            className={`mt-4 max-w-2xl leading-relaxed text-muted-foreground ${
              featured ? "text-lg" : "text-sm"
            }`}
          >
            {project.short_description || project.description || ""}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {project.technologies?.slice(0, featured ? 5 : 4).map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
            {project.duration && <span>{project.duration}</span>}
            {project.status && (
              <span className="uppercase tracking-[0.12em]">{project.status}</span>
            )}
          </div>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent">
            View project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
      {project.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
      {project.live_url && (
        <a
          href={project.live_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-accent"
        >
          Visit live project <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse border border-border/70">
          <div className="aspect-[16/10] bg-secondary" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-1/4 rounded bg-secondary" />
            <div className="h-6 w-3/5 rounded bg-secondary" />
            <div className="h-4 w-full rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-border p-8 md:p-10">
      <p className="text-sm text-destructive">
        Unable to load projects right now. Please try again later.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm transition-colors hover:border-accent hover:text-accent"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-y border-border py-16">
      <p className="text-sm uppercase tracking-[0.18em] text-accent">Archive empty</p>
      <h2 className="mt-4 text-3xl font-semibold">No projects available at the moment.</h2>
      <a
        href="mailto:hello@vyntrixnova.com?subject=Project%20inquiry"
        className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent transition-colors hover:text-foreground"
      >
        <Send className="h-4 w-4" /> Start a project
      </a>
    </div>
  );
}
