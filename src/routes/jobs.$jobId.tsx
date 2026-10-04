import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { getPublishedJob } from "@/lib/jobs.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: async ({ params }) => {
    try {
      return await getPublishedJob({ data: { id: params.jobId } });
    } catch {
      return { job: null };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.job ? `${loaderData.job.title} — VyntrixNova` : "Job — VyntrixNova" },
    ],
  }),
  component: JobDetailsPage,
});

const inputClass =
  "w-full rounded-lg border border-border/50 bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20";

function JobDetailsPage() {
  const { job } = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!job) return <NotFound />;

  async function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const resume = form.get("resume");
    if (!(resume instanceof File) || !resume.size) {
      setError("Please attach your CV or resume.");
      setSubmitting(false);
      return;
    }
    if (resume.size > 5 * 1024 * 1024) {
      setError("Your resume must be smaller than 5 MB.");
      setSubmitting(false);
      return;
    }
    if (!/[.]pdf$|[.]docx?$|[.]txt$/i.test(resume.name)) {
      setError("Upload a PDF, DOC, DOCX, or TXT file.");
      setSubmitting(false);
      return;
    }
    const path = `${job.id}/${crypto.randomUUID()}-${resume.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const upload = await supabase.storage
      .from("job-resumes")
      .upload(path, resume, { contentType: resume.type || "application/octet-stream" });
    if (upload.error) {
      setError("We could not upload your resume. Please try again.");
      setSubmitting(false);
      return;
    }
    const { error: insertError } = await supabase.from("job_applications").insert({
      job_id: job.id,
      full_name: String(form.get("full_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      location: String(form.get("location") ?? "").trim(),
      linkedin_url: String(form.get("linkedin_url") ?? "").trim() || null,
      portfolio_url: String(form.get("portfolio_url") ?? "").trim() || null,
      cover_message: String(form.get("cover_message") ?? "").trim(),
      resume_url: path,
    });
    setSubmitting(false);
    if (insertError) {
      setError("We could not submit your application. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16 lg:py-20">
        <Link
          to="/jobs/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All opportunities
        </Link>
        <section className="mt-12 border-b border-border/40 pb-10 md:mt-16 md:pb-12">
          <p className="marker-accent text-xs">{job.department}</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
            {job.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-accent/60" />
              {job.location}
            </span>
            <span>{job.employment_type}</span>
            <span>{job.experience_level}</span>
            <span className="text-xs text-muted-foreground/70">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </section>
        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1fr_360px] lg:gap-16">
          <article>
            {job.description && (
              <section>
                <p className="text-base leading-relaxed text-foreground-secondary">
                  {job.description}
                </p>
              </section>
            )}
            <Detail title="Responsibilities" value={job.responsibilities} />
            <Detail title="Requirements" value={job.requirements} />
            <Detail title="Benefits" value={job.benefits} />
            {job.skills.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-semibold">Key Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-secondary/40 px-3 py-1.5 text-xs text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </article>
          <section id="apply" className="surface-panel h-fit border border-border/60 p-8">
            <h2 className="text-xl font-semibold">Ready to apply?</h2>
            {submitted ? (
              <div className="mt-6">
                <CheckCircle2 className="h-8 w-8 text-accent" />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Your application has been submitted. Thank you for your interest!
                </p>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="mt-6 space-y-5">
                {error && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
                  >
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <Field label="Full Name" name="full_name" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <div className="space-y-4">
                  <Field label="Phone" name="phone" required />
                  <Field label="Location" name="location" required />
                </div>
                <div className="space-y-4">
                  <Field label="LinkedIn URL" name="linkedin_url" type="url" />
                  <Field label="Portfolio URL" name="portfolio_url" type="url" />
                </div>
                <div>
                  <label htmlFor="cover_message" className="block text-sm font-medium">
                    Cover Message{" "}
                    <span className="text-destructive" aria-label="required">
                      {" "}
                      *
                    </span>
                  </label>
                  <textarea
                    id="cover_message"
                    name="cover_message"
                    required
                    rows={4}
                    className={`${inputClass} mt-1.5`}
                    placeholder="Tell us why you're interested in this role..."
                  />
                </div>
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium">
                    CV / Resume{" "}
                    <span className="text-destructive" aria-label="required">
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    id="resume"
                    name="resume"
                    required
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="mt-1.5 w-full text-sm text-muted-foreground"
                    aria-describedby="file-requirements"
                  />
                  <p id="file-requirements" className="mt-1.5 text-xs text-muted-foreground">
                    PDF, DOC, DOCX, or TXT (Max 5 MB)
                  </p>
                </div>
                <button
                  disabled={submitting}
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Detail({ title, value }: { title: string; value: string }) {
  return value ? (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {value}
      </p>
    </section>
  ) : null;
}
function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={name} className="block text-sm">
      <span className="mb-1.5 block">
        {label}
        {required ? (
          <span className="text-destructive" aria-label="required">
            {" "}
            *
          </span>
        ) : (
          ""
        )}
      </span>
      <input id={name} name={name} type={type} required={required} className={inputClass} />
    </label>
  );
}
function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <h1 className="text-3xl font-semibold">Position not found</h1>
        <p className="mt-3 text-muted-foreground">
          This job posting may have been filled or archived.
        </p>
        <Link
          to="/jobs/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all opportunities
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
