import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  adminAssignClient,
  adminDeleteChild,
  adminDeleteProject,
  adminListProjects,
  adminSaveChild,
  adminSaveProject,
  getProjectDetail,
  postProjectMessage,
} from "@/lib/portal.functions";

const STATUSES = ["Discovery", "Design", "Build", "QA", "Launched", "On hold"] as const;
const MILESTONE_STATUSES = ["Planned", "In progress", "Done", "Blocked"] as const;
const statusClasses: Record<string, string> = {
  Discovery: "border-sky-200 bg-sky-50 text-sky-700",
  Design: "border-violet-200 bg-violet-50 text-violet-700",
  Build: "border-amber-200 bg-amber-50 text-amber-700",
  QA: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Launched: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "On hold": "border-amber-200 bg-amber-50 text-amber-700",
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Archived: "border-slate-200 bg-slate-100 text-slate-700",
};

const input =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

export function ProjectsPanel() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListProjects);
  const saveFn = useServerFn(adminSaveProject);
  const deleteFn = useServerFn(adminDeleteProject);
  const assignFn = useServerFn(adminAssignClient);
  const detailFn = useServerFn(getProjectDetail);
  const childSaveFn = useServerFn(adminSaveChild);
  const childDeleteFn = useServerFn(adminDeleteChild);
  const messageFn = useServerFn(postProjectMessage);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [email, setEmail] = useState("");
  const [reply, setReply] = useState("");

  const projectsQuery = useQuery({ queryKey: ["admin-projects"], queryFn: () => listFn() });
  const projects = projectsQuery.data?.projects ?? [];
  const active = projects.find((p) => p.id === activeId) ?? null;

  const detailQuery = useQuery({
    queryKey: ["project-detail", activeId],
    queryFn: () => detailFn({ data: { projectId: activeId as string } }),
    enabled: Boolean(activeId),
  });

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    qc.invalidateQueries({ queryKey: ["project-detail", activeId] });
  };

  const save = useMutation({
    mutationFn: (vars: Parameters<typeof saveFn>[0]["data"]) => saveFn({ data: vars }),
    onSuccess: () => {
      setNewName("");
      refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      setActiveId(null);
      refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assign = useMutation({
    mutationFn: () => assignFn({ data: { projectId: activeId as string, email } }),
    onSuccess: () => {
      setEmail("");
      toast.success("Client linked to this project.");
      refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const childSave = useMutation({
    mutationFn: (vars: { kind: string; values: Record<string, string | number | null> }) =>
      childSaveFn({
        data: { kind: vars.kind, projectId: activeId as string, values: vars.values },
      }),
    onSuccess: refreshAll,
    onError: (e: Error) => toast.error(e.message),
  });

  const childDelete = useMutation({
    mutationFn: (vars: { kind: string; id: string }) => childDeleteFn({ data: vars }),
    onSuccess: refreshAll,
    onError: (e: Error) => toast.error(e.message),
  });

  const sendReply = useMutation({
    mutationFn: () =>
      messageFn({ data: { projectId: activeId as string, body: reply, label: "Team" } }),
    onSuccess: () => {
      setReply("");
      refreshAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const detail = detailQuery.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newName.trim()) save.mutate({ name: newName.trim() });
          }}
          className="flex gap-2"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New project name"
            className={`${input} flex-1`}
          />
          <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            Add
          </button>
        </form>

        <div className="flex flex-col gap-1.5">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`rounded-lg px-3.5 py-2.5 text-left text-sm transition-colors ${
                p.id === activeId
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block font-medium">{p.name}</span>
              <span className="text-xs">
                {p.status} · {p.client_user_id ? "client linked" : "unassigned"}
              </span>
            </button>
          ))}
          {projects.length === 0 && !projectsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">No client projects yet.</p>
          )}
        </div>
      </aside>

      {!active ? (
        <p className="text-sm text-muted-foreground">Select a project to manage it.</p>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="surface-panel rounded-xl p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Name
                <input
                  defaultValue={active.name}
                  onBlur={(e) => save.mutate({ id: active.id, name: e.target.value })}
                  className={input}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Status
                <select
                  value={active.status}
                  onChange={(e) =>
                    save.mutate({ id: active.id, name: active.name, status: e.target.value })
                  }
                  className={input}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Progress %
                <input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={active.progress}
                  onBlur={(e) =>
                    save.mutate({
                      id: active.id,
                      name: active.name,
                      status: active.status,
                      progress: Number(e.target.value),
                    })
                  }
                  className={input}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Contract value (USD)
                <input
                  type="number"
                  defaultValue={active.contract_value_usd}
                  onBlur={(e) =>
                    save.mutate({
                      id: active.id,
                      name: active.name,
                      status: active.status,
                      progress: active.progress,
                      contract_value_usd: Number(e.target.value),
                    })
                  }
                  className={input}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
                Summary
                <input
                  defaultValue={active.summary ?? ""}
                  onBlur={(e) =>
                    save.mutate({
                      id: active.id,
                      name: active.name,
                      status: active.status,
                      progress: active.progress,
                      contract_value_usd: active.contract_value_usd,
                      summary: e.target.value,
                    })
                  }
                  className={input}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Client email to link"
                className={`${input} flex-1 min-w-[200px]`}
              />
              <button
                onClick={() => assign.mutate()}
                disabled={assign.isPending || !email}
                className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
              >
                Link client
              </button>
              <button
                onClick={() => remove.mutate(active.id)}
                className="rounded-lg border border-destructive/50 px-3 py-2 text-sm text-destructive"
              >
                Delete project
              </button>
            </div>
          </section>

          <Section
            title="Milestones"
            fields={[
              { key: "title", placeholder: "Milestone title" },
              { key: "due_date", placeholder: "Due date", type: "date" },
            ]}
            select={{ key: "status", options: [...MILESTONE_STATUSES] }}
            rows={(detail?.milestones ?? []).map((m) => ({
              id: m.id,
              primary: m.title,
              secondary: `${m.status}${m.due_date ? ` · ${m.due_date}` : ""}`,
            }))}
            onAdd={(values) => childSave.mutate({ kind: "project_milestones", values })}
            onDelete={(id) => childDelete.mutate({ kind: "project_milestones", id })}
          />

          <Section
            title="Files"
            fields={[
              { key: "label", placeholder: "File label" },
              { key: "url", placeholder: "https://…" },
            ]}
            rows={(detail?.files ?? []).map((f) => ({
              id: f.id,
              primary: f.label,
              secondary: f.url,
            }))}
            onAdd={(values) => childSave.mutate({ kind: "project_files", values })}
            onDelete={(id) => childDelete.mutate({ kind: "project_files", id })}
          />

          <Section
            title="Invoices"
            fields={[
              { key: "number", placeholder: "INV-001" },
              { key: "amount", placeholder: "Amount", type: "number" },
              { key: "due_at", placeholder: "Due", type: "date" },
            ]}
            select={{ key: "status", options: ["Draft", "Sent", "Paid", "Overdue"] }}
            rows={(detail?.invoices ?? []).map((i) => ({
              id: i.id,
              primary: `${i.number} · ${i.currency} ${i.amount}`,
              secondary: `${i.status}${i.due_at ? ` · due ${i.due_at}` : ""}`,
            }))}
            onAdd={(values) =>
              childSave.mutate({
                kind: "invoices",
                values: { ...values, currency: active.currency },
              })
            }
            onDelete={(id) => childDelete.mutate({ kind: "invoices", id })}
          />

          <section>
            <h3 className="font-display text-lg font-semibold">Messages</h3>
            <div className="mt-3 flex flex-col gap-2">
              {(detail?.messages ?? []).map((m) => (
                <div key={m.id} className="surface-panel rounded-lg px-4 py-2.5 text-sm">
                  <p className="whitespace-pre-line">{m.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.sender_label} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              {(detail?.messages ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (reply.trim()) sendReply.mutate();
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to the client…"
                className={`${input} flex-1`}
              />
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Send
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

type Field = { key: string; placeholder: string; type?: string };

function Section({
  title,
  fields,
  select,
  rows,
  onAdd,
  onDelete,
}: {
  title: string;
  fields: Field[];
  select?: { key: string; options: string[] };
  rows: { id: string; primary: string; secondary: string }[];
  onAdd: (values: Record<string, string | number | null>) => void;
  onDelete: (id: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <section>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="surface-panel flex items-center justify-between gap-3 rounded-lg px-4 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.primary}</p>
              <p className="truncate text-xs text-muted-foreground">{r.secondary}</p>
            </div>
            <button
              onClick={() => onDelete(r.id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const payload: Record<string, string | number | null> = {};
          for (const f of fields) {
            const raw = values[f.key] ?? "";
            if (!raw && f.type === "date") continue;
            payload[f.key] = f.type === "number" ? Number(raw || 0) : raw;
          }
          if (select) payload[select.key] = values[select.key] ?? select.options[0] ?? "";
          onAdd(payload);
          setValues({});
        }}
        className="mt-3 flex flex-wrap gap-2"
      >
        {fields.map((f) => (
          <input
            key={f.key}
            type={f.type ?? "text"}
            value={values[f.key] ?? ""}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className={`${input} flex-1 min-w-[140px]`}
          />
        ))}
        {select && (
          <select
            value={values[select.key] ?? select.options[0]}
            onChange={(e) => setValues({ ...values, [select.key]: e.target.value })}
            className={input}
          >
            {select.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
        <button className="rounded-lg border border-border px-3 py-2 text-sm">Add</button>
      </form>
    </section>
  );
}
