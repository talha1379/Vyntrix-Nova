import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  addProjectImage,
  deletePortfolioProject,
  deleteProjectImage,
  listAdminPortfolioProjects,
  savePortfolioProject,
  setPrimaryProjectImage,
} from "@/lib/portfolio.functions";

const statuses = ["Draft", "Published", "Archived"];
const statusClasses: Record<string, string> = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Archived: "border-slate-200 bg-slate-100 text-slate-700",
};
const inputClass =
  "w-full rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-primary";
type Project = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  technologies: string[];
  live_url: string | null;
  status: string;
  project_images: Array<{
    id: string;
    image_url: string;
    storage_path: string;
    is_primary: boolean;
    display_order: number;
  }>;
  [key: string]: unknown;
};

export function PortfolioProjectsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminPortfolioProjects);
  const saveFn = useServerFn(savePortfolioProject);
  const deleteFn = useServerFn(deletePortfolioProject);
  const addImageFn = useServerFn(addProjectImage);
  const deleteImageFn = useServerFn(deleteProjectImage);
  const setPrimaryImageFn = useServerFn(setPrimaryProjectImage);
  const query = useQuery({ queryKey: ["admin-portfolio-projects"], queryFn: () => listFn() });
  const projects = (query.data?.projects ?? []) as Project[];
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState("All");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-portfolio-projects"] });
  const save = useMutation({
    mutationFn: (data: { id?: string; values: Record<string, unknown> }) => saveFn({ data }),
    onSuccess: (result, variables) => {
      toast.success("Project saved");
      setEditing((current) =>
        current
          ? ({
              ...current,
              ...variables.values,
              id: result.id,
              project_images: current.project_images ?? [],
              technologies: Array.isArray(variables.values.technologies)
                ? variables.values.technologies
                : (current.technologies ?? []),
            } as Project)
          : current,
      );
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Project deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const addImage = useMutation({
    mutationFn: (data: {
      project_id: string;
      image_url: string;
      storage_path: string;
      is_primary: boolean;
      display_order: number;
    }) => addImageFn({ data }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const removeImage = useMutation({
    mutationFn: (id: string) => deleteImageFn({ data: { id } }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const setPrimaryImage = useMutation({
    mutationFn: (data: { id: string; project_id: string }) => setPrimaryImageFn({ data }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const visibleProjects =
    filter === "All" ? projects : projects.filter((project) => project.status === filter);

  async function uploadImages(event: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !event.target.files?.length) return;
    for (const file of Array.from(event.target.files)) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
        toast.error("Use JPG, PNG, or WEBP images up to 5 MB.");
        continue;
      }
      const path = `${editing.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const upload = await supabase.storage
        .from("project-images")
        .upload(path, file, { contentType: file.type });
      if (upload.error) {
        toast.error(upload.error.message);
        continue;
      }
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      addImage.mutate({
        project_id: editing.id,
        image_url: data.publicUrl,
        storage_path: path,
        is_primary: editing.project_images.length === 0,
        display_order: editing.project_images.length,
      });
    }
    event.target.value = "";
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    form.technologies = String(form.technologies ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    form.category = String(form.category ?? "");
    form.live_url = String(form.live_url ?? "");
    save.mutate({ id: editing?.id, values: form });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the projects shown on the public portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className={inputClass}
          >
            <option>All</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() =>
              setEditing({ status: "Draft", project_images: [], technologies: [] } as Project)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>
      {editing && (
        <form onSubmit={submit} className="surface-panel mt-8 grid gap-4 p-6 md:grid-cols-2">
          <h2 className="text-xl font-semibold md:col-span-2">
            {editing.id ? "Edit Project" : "Create Project"}
          </h2>
          <Field
            label="Project Name"
            name="name"
            defaultValue={String(editing.name ?? "")}
            required
          />
          <Field label="Category" name="category" defaultValue={String(editing.category ?? "")} />
          <Field
            label="Short Description"
            name="short_description"
            defaultValue={String(editing.short_description ?? editing.description ?? "")}
            required
          />
          <Field
            label="Project Link"
            name="live_url"
            defaultValue={String(editing.live_url ?? "")}
            type="url"
          />
          <Field
            label="Technologies (comma separated)"
            name="technologies"
            defaultValue={editing.technologies?.join(", ")}
          />
          <label className="text-sm md:col-span-2">
            <span className="mb-1.5 block">Full Description</span>
            <textarea
              name="description"
              defaultValue={String(editing.description ?? "")}
              required
              rows={5}
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block">Status</span>
            <select name="status" defaultValue={editing.status} className={inputClass}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              disabled={save.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground"
            >
              {save.isPending ? "Saving..." : "Save Project"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-border px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
          <div className="md:col-span-2">
            <p className="mb-1 text-sm font-medium">Project Images</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {editing.id
                ? "Upload JPG, PNG, or WEBP images up to 5 MB."
                : "Save the project first to enable image uploads."}
            </p>
            {editing.id ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {editing.project_images.map((image) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() =>
                          setPrimaryImage.mutate({ id: image.id, project_id: editing.id! })
                        }
                        className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs text-accent"
                      >
                        Set primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage.mutate(image.id)}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="grid aspect-video cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent">
                  <ImagePlus className="h-6 w-6" />
                  <span className="sr-only">Upload project images</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={uploadImages}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Project images will be available after the project is saved.
              </div>
            )}
          </div>
        </form>
      )}
      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-surface-subtle text-[11px] uppercase tracking-[0.12em] text-foreground/75">
            <tr>
              {["Project", "Category", "Status", "Created", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleProjects.map((project) => (
              <tr key={project.id} className="border-t border-border">
                <td className="px-4 py-4 font-medium">{project.name}</td>
                <td className="px-4 py-4 text-muted-foreground">{project.category || "-"}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[project.status] ?? "border-border bg-surface-subtle text-foreground"}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(project.created_at as string).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: project.id }}
                      target="_blank"
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setEditing(project)}
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        save.mutate({
                          id: project.id,
                          values: {
                            status: project.status === "Published" ? "Draft" : "Published",
                          },
                        })
                      }
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/5"
                    >
                      {project.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() =>
                        save.mutate({ id: project.id, values: { status: "Archived" } })
                      }
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this project and its images?"))
                          remove.mutate(project.id);
                      }}
                      className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibleProjects.length && (
          <p className="p-8 text-sm text-muted-foreground">No projects found.</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        required={required}
        className={inputClass}
      />
    </label>
  );
}
