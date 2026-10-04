import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  deleteApplication,
  deleteJob,
  listAdminJobs,
  saveJob,
  updateApplicationStatus,
} from "@/lib/jobs.functions";

const statuses = ["Draft", "Published", "Closed"];
const applicationStatuses = [
  "New",
  "Reviewing",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];
const statusClasses: Record<string, string> = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Closed: "border-slate-200 bg-slate-100 text-slate-700",
  New: "border-sky-200 bg-sky-50 text-sky-700",
  Reviewing: "border-violet-200 bg-violet-50 text-violet-700",
  Shortlisted: "border-amber-200 bg-amber-50 text-amber-700",
  Interview: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Selected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
};
const inputClass =
  "w-full rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-primary";

type Job = {
  id: string;
  title: string;
  department: string;
  employment_type: string;
  location: string;
  status: string;
  created_at: string;
  [key: string]: unknown;
};
type Application = {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  cover_message: string;
  resume_link: string | null;
  status: string;
  created_at: string;
};

export function JobsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminJobs);
  const saveFn = useServerFn(saveJob);
  const deleteFn = useServerFn(deleteJob);
  const statusFn = useServerFn(updateApplicationStatus);
  const deleteApplicationFn = useServerFn(deleteApplication);
  const query = useQuery({ queryKey: ["admin-jobs"], queryFn: () => listFn() });
  const jobs = (query.data?.jobs ?? []) as Job[];
  const applications = (query.data?.applications ?? []) as Application[];
  const [editing, setEditing] = useState<Job | null>(null);
  const [applicationsView, setApplicationsView] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [jobFilter, setJobFilter] = useState("All");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-jobs"] });
  const save = useMutation({
    mutationFn: (data: { id?: string; values: Record<string, unknown> }) => saveFn({ data }),
    onSuccess: () => {
      toast.success("Job saved");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const updateStatus = useMutation({
    mutationFn: (data: { id: string; status: string }) => statusFn({ data }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const removeApplication = useMutation({
    mutationFn: (id: string) => deleteApplicationFn({ data: { id } }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const filteredApplications = applications.filter(
    (application) =>
      `${application.full_name} ${application.email}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (statusFilter === "All" || application.status === statusFilter) &&
      (jobFilter === "All" || application.job_id === jobFilter),
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<
      string,
      unknown
    >;
    const skills = String(form["skills"] ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = { ...form, skills };
    if (editing?.id) {
      save.mutate({ id: editing.id, values: payload });
      return;
    }

    save.mutate({ values: payload });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, publish, and review applications from one place.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setApplicationsView((value) => !value)}
            className="rounded-lg border border-border px-4 py-2.5 text-sm"
          >
            {applicationsView ? "Manage Jobs" : `Applications (${applications.length})`}
          </button>
          <button
            onClick={() => setEditing({ status: "Draft" } as Job)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New Job
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total Jobs", jobs.length],
          ["Published", jobs.filter((job) => job.status === "Published").length],
          ["Draft", jobs.filter((job) => job.status === "Draft").length],
          ["Closed", jobs.filter((job) => job.status === "Closed").length],
          ["Applications", applications.length],
          [
            "New Applications",
            applications.filter((application) => application.status === "New").length,
          ],
        ].map(([label, value]) => (
          <div key={String(label)} className="surface-panel p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
      {editing && (
        <JobForm
          job={editing}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
          saving={save.isPending}
        />
      )}
      {applicationsView ? (
        <>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search applicants..."
              className={inputClass}
            />
            <select
              value={jobFilter}
              onChange={(event) => setJobFilter(event.target.value)}
              className={inputClass}
            >
              <option value="All">All jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
            >
              <option>All</option>
              {applicationStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {filteredApplications.map((application) => (
              <article key={application.id} className="surface-panel p-5">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-medium">{application.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.email} · {application.phone} · {application.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {jobs.find((job) => job.id === application.job_id)?.title} ·{" "}
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={application.status}
                      onChange={(event) =>
                        updateStatus.mutate({ id: application.id, status: event.target.value })
                      }
                      className={inputClass}
                    >
                      {applicationStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this application?"))
                          removeApplication.mutate(application.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
                  {application.cover_message}
                </p>
                {application.resume_link && (
                  <a
                    href={application.resume_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs text-accent"
                  >
                    View / download CV
                  </a>
                )}
              </article>
            ))}
            {!filteredApplications.length && (
              <p className="text-sm text-muted-foreground">No matching applications.</p>
            )}
          </div>
        </>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-subtle text-[11px] uppercase tracking-[0.12em] text-foreground/75">
              <tr>
                {[
                  "Job Title",
                  "Department",
                  "Type",
                  "Location",
                  "Status",
                  "Posted",
                  "Applications",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-4 font-medium">{job.title}</td>
                  <td className="px-4 py-4 text-muted-foreground">{job.department}</td>
                  <td className="px-4 py-4 text-muted-foreground">{job.employment_type}</td>
                  <td className="px-4 py-4 text-muted-foreground">{job.location}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[job.status] ?? "border-border bg-surface-subtle text-foreground"}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    {applications.filter((application) => application.job_id === job.id).length}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setEditing(job)}
                        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          save.mutate({
                            id: job.id,
                            values: { status: job.status === "Published" ? "Draft" : "Published" },
                          })
                        }
                        className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/5"
                      >
                        {job.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this job and its applications?"))
                            remove.mutate(job.id);
                        }}
                        className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!jobs.length && (
            <p className="p-8 text-sm text-muted-foreground">
              No jobs yet. Create the first opening.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function JobForm({
  job,
  onCancel,
  onSubmit,
  saving,
}: {
  job: Job;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  const field = (label: string, name: string, required = false) => (
    <label className="text-sm">
      <span className="mb-1.5 block">{label}</span>
      <input
        name={name}
        defaultValue={String(job[name] ?? "")}
        required={required}
        className={inputClass}
      />
    </label>
  );
  return (
    <form onSubmit={onSubmit} className="surface-panel mt-8 grid gap-4 p-6 md:grid-cols-2">
      <h2 className="text-xl font-semibold md:col-span-2">{job.id ? "Edit Job" : "Create Job"}</h2>
      {field("Job Title", "title", true)}
      {field("Department", "department", true)}
      {field("Employment Type", "employment_type", true)}
      {field("Location", "location", true)}
      {field("Experience Level", "experience_level", true)}
      <DeadlinePicker value={String(job["application_deadline"] ?? "")} />
      {field("Short Description", "short_description", true)}
      {field("Skills (comma separated)", "skills", true)}
      {["description", "responsibilities", "requirements", "benefits"].map((name) => (
        <label key={name} className="text-sm md:col-span-2">
          <span className="mb-1.5 block">{name}</span>
          <textarea
            name={name}
            defaultValue={String(job[name] ?? "")}
            rows={3}
            required={name === "description"}
            className={inputClass}
          />
        </label>
      ))}
      <label className="text-sm">
        <span className="mb-1.5 block">Status</span>
        <select name="status" defaultValue={job.status} className={inputClass}>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground"
        >
          {saving ? "Saving..." : "Save Job"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeadlinePicker({ value }: { value: string }) {
  const [date, setDate] = useState<Date | undefined>(() => parseDate(value));

  function handleSelect(nextDate: Date | undefined) {
    setDate(nextDate);
  }

  return (
    <div className="text-sm">
      <span className="mb-1.5 block">Application Deadline</span>
      <input type="hidden" name="application_deadline" value={formatDate(date)} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start bg-surface/60 text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? date.toLocaleDateString() : "Select a deadline"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function parseDate(value: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : undefined;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
