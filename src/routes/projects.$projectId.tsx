import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ImageIcon } from "lucide-react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPublishedProject, listPublishedProjects } from "@/lib/portfolio.functions";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

type PublishedProject = Awaited<ReturnType<typeof listPublishedProjects>>["projects"][number];
type ProjectImage = {
  id: string;
  image_url: string;
  storage_path: string;
  is_primary: boolean;
  display_order: number;
};
type ProjectDetails = Omit<
  NonNullable<Awaited<ReturnType<typeof getPublishedProject>>["project"]>,
  "client_name" | "duration" | "tags" | "project_images"
> & {
  client_name: string | null;
  duration: string | null;
  tags: string[];
  project_images: ProjectImage[] | null;
};

const portfolioQuery = queryOptions({
  queryKey: ["published-projects"],
  queryFn: () => listPublishedProjects(),
});

export const Route = createFileRoute("/projects/$projectId")({
  loader: async ({ params }) => {
    try {
      return await getPublishedProject({ data: { id: params.projectId } });
    } catch {
      return { project: null };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.project
          ? `${loaderData.project.name} | VyntrixNova`
          : "Project Not Found | VyntrixNova",
      },
    ],
  }),
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { project } = Route.useLoaderData();
  const [activeImage, setActiveImage] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const portfolio = useQuery(portfolioQuery);

  if (!project) return <NotFound />;

  const projectDetails = project as unknown as ProjectDetails;
  const rawImages = Array.isArray(projectDetails.project_images)
    ? projectDetails.project_images
    : projectDetails.project_images
      ? [projectDetails.project_images]
      : [];
  const images = [...rawImages].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const tags = Array.isArray(projectDetails.tags) ? projectDetails.tags : [];
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];
  const selectedImage = images[activeImage] ?? images[0];
  const projects = portfolio.data?.projects ?? [];
  const projectIndex = projects.findIndex((item) => item.id === project.id);
  const previousProject = projectIndex > 0 ? projects[projectIndex - 1] : undefined;
  const nextProject = projectIndex >= 0 ? projects[projectIndex + 1] : undefined;
  const metadata = [
    projectDetails.client_name ? { label: "Client", value: projectDetails.client_name } : null,
    project.category ? { label: "Category", value: project.category } : null,
    projectDetails.duration ? { label: "Duration", value: projectDetails.duration } : null,
    project.status ? { label: "Status", value: project.status } : null,
    project.created_at
      ? {
          label: "Date",
          value: new Date(project.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="grid-backdrop border-b border-border/60">
          <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:pb-24 md:pt-12">
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> ALL PROJECTS
            </Link>
            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end lg:gap-16">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-accent">
                  Project / {project.category || "Showcase"}
                </p>
                <h1 className="mt-5 max-w-4xl text-[clamp(2rem,6vw,5rem)] font-semibold leading-[1.02]">
                  {project.name}
                </h1>
              </div>
              <div className="lg:pb-2">
                <p className="max-w-xl text-base leading-relaxed text-foreground-secondary md:text-lg">
                  {project.short_description || project.description}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 text-sm font-medium text-accent transition-colors hover:border-accent hover:text-foreground"
                    >
                      Visit live project <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                  <Link
                    to="/contact"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface/60 px-4 text-sm font-medium text-foreground-secondary transition-colors hover:border-accent/60 hover:text-foreground"
                  >
                    Contact the studio <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-12">
            <div>
              <div className="relative overflow-hidden border border-border/70 bg-secondary shadow-[var(--shadow-elevated)]">
                {selectedImage && !brokenImages[selectedImage.id] ? (
                  <img
                    src={selectedImage.image_url}
                    alt={`${project.name} project visual`}
                    className="aspect-[16/10] h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    onError={() =>
                      setBrokenImages((current) => ({
                        ...current,
                        [selectedImage.id]: true,
                      }))
                    }
                  />
                ) : (
                  <ProjectFallback project={project} />
                )}
                {images.length > 0 && (
                  <span className="absolute bottom-4 left-4 border border-border/70 bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {String(activeImage + 1).padStart(2, "0")}/
                    {String(images.length).padStart(2, "0")}
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => {
                    const isBroken = Boolean(brokenImages[image.id]);
                    return (
                      <button
                        key={image.id}
                        type="button"
                        aria-label={`Show ${project.name} image ${index + 1}`}
                        aria-current={index === activeImage}
                        onClick={() => setActiveImage(index)}
                        className={`overflow-hidden border transition-all duration-200 ${index === activeImage ? "border-accent bg-accent/5" : "border-border hover:border-accent/60"}`}
                      >
                        {isBroken ? (
                          <div className="grid aspect-[4/3] place-items-center bg-secondary text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        ) : (
                          <img
                            src={image.image_url}
                            alt={`${project.name} thumbnail ${index + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                            onError={() =>
                              setBrokenImages((current) => ({
                                ...current,
                                [image.id]: true,
                              }))
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Project information</p>
              {metadata.length > 0 ? (
                <dl className="mt-7 divide-y divide-border/70 border-y border-border/70">
                  {metadata.map((item) => (
                    <Meta key={item.label} label={item.label} value={item.value} />
                  ))}
                </dl>
              ) : null}
              {tags.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground-secondary">
                    {tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
          <div className="grid gap-12 border-t border-border/70 pt-8 md:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)] md:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Overview</p>
              <p className="mt-3 text-sm text-muted-foreground">What we built</p>
            </div>
            <div className="max-w-3xl">
              {project.description && (
                <p className="text-2xl leading-tight text-foreground-secondary md:text-4xl">
                  {project.description}
                </p>
              )}
              {(project.problem || project.solution) && (
                <div className="mt-10 grid gap-8 border-t border-border/70 pt-8 sm:grid-cols-2">
                  {project.problem && <Detail title="Challenge" text={project.problem} />}
                  {project.solution && <Detail title="Build" text={project.solution} />}
                </div>
              )}
            </div>
          </div>
        </section>

        {technologies.length > 0 && (
          <section className="border-y border-border/70 bg-surface/20">
            <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[minmax(10rem,0.35fr)_minmax(0,1fr)] md:gap-16 md:py-16">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent">Technology</p>
                <p className="mt-3 text-sm text-muted-foreground">The tools behind the project</p>
              </div>
              <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
                {technologies.map((technology, index) => (
                  <div
                    key={technology}
                    className="flex items-center gap-4 border-b border-border/70 py-4"
                  >
                    <span className="font-display text-[10px] uppercase tracking-[0.18em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base text-foreground-secondary">{technology}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="rounded-lg border border-border bg-surface/30 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent">Next step</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
                  Ready to shape something exceptional?
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-foreground"
                  >
                    VISIT LIVE PROJECT <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground"
                >
                  Contact us <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-y border-border py-8 md:flex md:items-center md:justify-between md:gap-10 md:py-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Explore the archive</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
                See more projects from the studio.
              </h2>
            </div>
            <Link
              to="/projects"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-foreground md:mt-0"
            >
              <ArrowLeft className="h-4 w-4" /> ALL PROJECTS
            </Link>
          </div>
          {(previousProject || nextProject) && (
            <nav
              aria-label="Project navigation"
              className="grid border-b border-border md:grid-cols-2"
            >
              {previousProject ? (
                <ProjectNavLink
                  label="Previous project"
                  project={previousProject}
                  direction="previous"
                />
              ) : (
                <div className="hidden md:block" />
              )}
              {nextProject && (
                <ProjectNavLink label="Next project" project={nextProject} direction="next" />
              )}
            </nav>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProjectFallback({
  project,
}: {
  project: NonNullable<Awaited<ReturnType<typeof getPublishedProject>>["project"]>;
}) {
  return (
    <div className="grid aspect-[16/10] place-items-center overflow-hidden bg-[radial-gradient(circle_at_70%_20%,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent_35%),var(--color-secondary)] p-8 text-center">
      <div>
        <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <p className="mt-4 font-display text-3xl font-semibold text-foreground/20">
          {project.name}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-accent">{project.category}</p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 py-4">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground-secondary">{value}</dd>
    </div>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function ProjectNavLink({
  label,
  project,
  direction,
}: {
  label: string;
  project: PublishedProject;
  direction: "previous" | "next";
}) {
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project.id }}
      className={`group py-8 transition-colors hover:border-accent ${direction === "next" ? "md:border-l md:pl-10 md:text-right" : "md:pr-10"}`}
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span
        className={`mt-3 flex items-center gap-3 text-xl font-semibold ${direction === "next" ? "md:justify-end" : ""}`}
      >
        {direction === "previous" && (
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        )}
        {project.name}
        {direction === "next" && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </span>
    </Link>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-32">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Project archive</p>
        <h1 className="mt-4 text-4xl font-semibold">Project not found</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          This project is unavailable or has not been published.
        </p>
        <Link
          to="/projects"
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
