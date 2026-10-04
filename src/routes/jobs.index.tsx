import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, MapPin, Send } from "lucide-react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listPublishedJobs } from "@/lib/jobs.functions";

const jobsQuery = queryOptions({
  queryKey: ["published-jobs"],
  queryFn: () => listPublishedJobs(),
});

export const Route = createFileRoute("/jobs/")({
  head: () => ({ meta: [{ title: "Careers — VyntrixNova" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { data, isLoading, isError } = useQuery(jobsQuery);
  const jobs = data?.jobs ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24 lg:py-28">
            <p className="marker-accent text-xs">Careers / Opportunities</p>
            <h1 className="mt-5 max-w-3xl text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
              Join a studio that ships.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-secondary">
              We're looking for talented designers, engineers, and strategists who care about craft
              and ownership. Work with a team that values honesty, weekly delivery, and
              accountability.
            </p>
            <a
              href="#open-positions"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              View Open Positions <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="open-positions" className="container-site py-16 md:py-24 lg:py-28">
          <div className="mb-12 flex items-end justify-between gap-6 border-b border-border/40 pb-8">
            <div>
              <p className="marker-accent text-xs">Open Positions</p>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                {jobs.length > 0 ? "Opportunities" : "No roles available"}
              </h2>
            </div>
            <a
              href="mailto:careers@vyntrixnova.com?subject=CV%20for%20future%20opportunities"
              className="hidden items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-accent hover:text-accent sm:inline-flex"
            >
              <Send className="h-4 w-4" /> Send Your CV
            </a>
          </div>

          {isLoading && (
            <div className="space-y-8 border-t border-border/40 md:space-y-10">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse pt-8 first:pt-0 md:pt-10">
                  <div className="h-6 w-1/2 rounded bg-secondary" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-secondary" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-secondary" />
                </div>
              ))}
            </div>
          )}
          {isError && (
            <div className="mt-12 border-t border-border/40 pt-10">
              <p className="text-sm text-destructive">
                Unable to load job openings right now. Please try again later.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg border border-border/60 px-4 py-2.5 text-sm transition-all hover:border-accent hover:text-accent"
              >
                Try Again
              </button>
            </div>
          )}
          {!isLoading && !isError && jobs.length === 0 && (
            <div className="mt-12 border-t border-border/40 pt-10">
              <p className="text-muted-foreground">
                No open positions available at the moment. We'd love to hear from you anyway.
              </p>
              <a
                href="mailto:careers@vyntrixnova.com?subject=CV%20for%20future%20opportunities"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2.5 text-sm transition-all hover:border-accent hover:text-accent"
              >
                <Send className="h-4 w-4" /> Send Your CV
              </a>
            </div>
          )}
          <div className="space-y-8 border-t border-border/40 md:space-y-10">
            {jobs.map((job, index) => (
              <article
                key={job.id}
                className="flex flex-col gap-6 border-b border-border/40 py-8 transition-all hover:border-accent/30 md:flex-row md:items-start md:justify-between md:gap-8 md:py-10 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold leading-tight">{job.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-accent/60" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-accent/60" />
                      {job.location}
                    </span>
                    <span>{job.employment_type}</span>
                    <span>{job.experience_level}</span>
                  </div>
                  {job.short_description && (
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-secondary">
                      {job.short_description}
                    </p>
                  )}
                  {job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-secondary/40 px-2.5 py-1 text-xs text-secondary-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: job.id }}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background md:mt-0"
                >
                  View Role <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
