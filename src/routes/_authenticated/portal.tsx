import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getProjectDetail, listMyProjects, postProjectMessage } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">VyntrixNova</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Client Portal</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Portal error</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </main>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">VyntrixNova</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Client Portal</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project you're looking for doesn't exist.
          </p>
          <Link
            to="/portal"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to portal
          </Link>
        </div>
      </main>
    </div>
  ),
});

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Active: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    "In Progress": { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-500" },
    "In progress": { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-500" },
    Discovery: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
    Review: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-500" },
    Completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    Done: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    Pending: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500" },
    Planned: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500" },
    Blocked: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  };

  const config = statusConfig[status] || {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

// Skeleton loading components
function ProjectSidbarSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg bg-secondary/50 p-3 animate-pulse">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-2 h-3 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/40 p-6 bg-card/30">
        <div className="space-y-4">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full max-w-md rounded bg-muted animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MILESTONE_TONE: Record<string, string> = {
  Done: "bg-accent",
  "In progress": "bg-primary",
  Planned: "bg-border",
  Blocked: "bg-destructive",
};

function money(amount: number, currency: string) {
  return currency === "PKR"
    ? `Rs ${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function PortalPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(listMyProjects);
  const detailFn = useServerFn(getProjectDetail);
  const postFn = useServerFn(postProjectMessage);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const projectsQuery = useQuery({ queryKey: ["my-projects"], queryFn: () => listFn() });
  const projects = useMemo(
    () => projectsQuery.data?.projects ?? [],
    [projectsQuery.data?.projects],
  );

  useEffect(() => {
    if (!activeId && projects[0]) setActiveId(projects[0].id);
  }, [activeId, projects]);

  const detailQuery = useQuery({
    queryKey: ["project-detail", activeId],
    queryFn: () => detailFn({ data: { projectId: activeId as string } }),
    enabled: Boolean(activeId),
  });

  const send = useMutation({
    mutationFn: () => postFn({ data: { projectId: activeId as string, body: draft } }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["project-detail", activeId] });
    },
    onError: (e) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  }

  const active = projects.find((p) => p.id === activeId);
  const detail = detailQuery.data;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">VyntrixNova</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Client Portal</span>
          </Link>
          <button
            onClick={signOut}
            className="rounded-lg border border-border/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            title="Sign out of your account"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          {/* Loading State */}
          {projectsQuery.isLoading ? (
            <div className="space-y-6">
              <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                <div>
                  <div className="mb-4">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </div>
                  <ProjectSidbarSkeleton />
                </div>
                <ProjectDetailSkeleton />
              </div>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="mx-auto max-w-md rounded-xl border border-border/30 bg-card/50 p-8">
              <h1 className="font-display text-2xl font-semibold">Welcome to your portal</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your projects, timelines, and communications will appear here once we kick off an
                engagement.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start a project
              </Link>
            </div>
          ) : (
            /* Main Grid */
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
              {/* Sidebar Navigation */}
              <aside className="flex flex-col gap-1">
                <div className="mb-2">
                  <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Projects ({projects.length})
                  </h2>
                </div>
                <div className="flex flex-col gap-1.5">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      className={`group rounded-lg px-3.5 py-3 text-left transition-all ${
                        p.id === activeId
                          ? "bg-primary/15 border border-primary/40"
                          : "border border-transparent hover:bg-secondary/50 hover:border-border/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <div className="mt-1.5">
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex flex-col gap-6">
                {/* Project Overview */}
                {active && (
                  <section className="rounded-xl border border-border/30 bg-card/30 p-6 lg:p-8">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                            {active.name}
                          </h1>
                          {active.summary && (
                            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                              {active.summary}
                            </p>
                          )}
                          <div className="mt-4">
                            <StatusBadge status={active.status} />
                          </div>
                        </div>
                        <div className="rounded-lg bg-secondary/40 p-4 border border-border/30">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            Contract Value
                          </p>
                          <p className="font-display text-2xl font-semibold text-accent mt-1">
                            {money(active.contract_value_usd, active.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {active.target_date
                              ? `Target ${new Date(active.target_date).toLocaleDateString()}`
                              : "No target date"}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">{active.progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{ width: `${active.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Timeline Section */}
                {detailQuery.isPending ? (
                  <div className="space-y-3">
                    <div className="h-6 w-32 rounded bg-muted animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="rounded-lg bg-secondary/50 p-4 animate-pulse">
                          <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-muted" />
                            <div className="h-3 w-full rounded bg-muted" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <section>
                    <h2 className="font-display text-lg font-semibold text-foreground">Timeline</h2>
                    <div className="mt-4 flex flex-col gap-3">
                      {(detail?.milestones ?? []).length === 0 ? (
                        <div className="rounded-lg border border-border/20 bg-card/30 p-4">
                          <p className="text-sm text-muted-foreground">
                            No milestones scheduled yet.
                          </p>
                        </div>
                      ) : (
                        detail?.milestones.map((m) => (
                          <div
                            key={m.id}
                            className="group rounded-lg border border-border/30 bg-card/30 p-4 transition-all hover:bg-card/50 hover:border-border/50"
                          >
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center gap-2">
                                <span
                                  className={`h-3 w-3 rounded-full ring-2 ring-background ${
                                    MILESTONE_TONE[m.status] ?? "bg-border"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{m.title}</p>
                                {m.details && (
                                  <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-line">
                                    {m.details}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="inline-block px-2 py-1 rounded-full bg-secondary/40 font-medium">
                                    {m.status}
                                  </span>
                                  {m.due_date && (
                                    <span className="font-mono">
                                      {new Date(m.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                )}

                {/* Files and Invoices Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Files Section */}
                  {detailQuery.isPending ? (
                    <div className="space-y-3">
                      <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="rounded-lg bg-secondary/50 p-3 animate-pulse">
                            <div className="h-4 w-32 rounded bg-muted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <section>
                      <h2 className="font-display text-lg font-semibold text-foreground">Files</h2>
                      <div className="mt-4 flex flex-col gap-2">
                        {(detail?.files ?? []).length === 0 ? (
                          <div className="rounded-lg border border-border/20 bg-card/30 p-4">
                            <p className="text-sm text-muted-foreground">No files shared yet.</p>
                          </div>
                        ) : (
                          detail?.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-4 py-3 transition-all hover:bg-card/50 hover:border-primary/40"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {f.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {f.file_type}
                                  {f.size_kb ? ` • ${(f.size_kb / 1024).toFixed(1)} MB` : ""}
                                </p>
                              </div>
                              <span className="text-lg text-muted-foreground group-hover:text-primary transition-colors">
                                ↓
                              </span>
                            </a>
                          ))
                        )}
                      </div>
                    </section>
                  )}

                  {/* Invoices Section */}
                  {detailQuery.isPending ? (
                    <div className="space-y-3">
                      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="rounded-lg bg-secondary/50 p-3 animate-pulse">
                            <div className="h-4 w-32 rounded bg-muted" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <section>
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        Invoices
                      </h2>
                      <div className="mt-4 flex flex-col gap-2">
                        {(detail?.invoices ?? []).length === 0 ? (
                          <div className="rounded-lg border border-border/20 bg-card/30 p-4">
                            <p className="text-sm text-muted-foreground">No invoices issued yet.</p>
                          </div>
                        ) : (
                          detail?.invoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="group rounded-lg border border-border/30 bg-card/30 p-4 transition-all hover:bg-card/50 hover:border-border/50"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground">
                                    {inv.number}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="inline-block px-2 py-1 rounded-full bg-secondary/40 font-medium">
                                      {inv.status}
                                    </span>
                                  </p>
                                  {inv.due_at && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                      Due {new Date(inv.due_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-display text-base font-semibold text-accent">
                                    {money(inv.amount, inv.currency)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Messages Section */}
                {detailQuery.isPending ? (
                  <div className="space-y-3">
                    <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-lg bg-secondary/50 p-3 animate-pulse ${i % 2 === 0 ? "mr-12" : "ml-12"}`}
                        >
                          <div className="h-4 w-48 rounded bg-muted" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <section>
                    <h2 className="font-display text-lg font-semibold text-foreground">Messages</h2>
                    <div className="mt-4 space-y-3 rounded-lg border border-border/30 bg-card/30 p-5">
                      {(detail?.messages ?? []).length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No messages yet. Start a conversation with the team.
                        </p>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {detail?.messages.map((m) => {
                            const isOwn = m.sender_id === detail?.viewerId;
                            return (
                              <div
                                key={m.id}
                                className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`flex flex-col gap-1 max-w-[80%] md:max-w-md ${isOwn ? "items-end" : "items-start"}`}
                                >
                                  <div className="text-xs text-muted-foreground px-3 py-0.5">
                                    <span className="font-medium">{m.sender_label}</span>
                                    <span className="mx-2 opacity-60">•</span>
                                    <span className="font-mono text-xs">
                                      {new Date(m.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div
                                    className={`rounded-lg px-4 py-3 text-sm break-words ${
                                      isOwn
                                        ? "bg-primary/20 border border-primary/40 text-foreground"
                                        : "bg-secondary/40 border border-border/30 text-foreground"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">{m.body}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Message Composer */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) send.mutate();
                      }}
                      className="mt-4 flex gap-3"
                    >
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Send a message to the team…"
                        disabled={send.isPending}
                        className="flex-1 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm placeholder-muted-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                        aria-label="Message input"
                      />
                      <button
                        type="submit"
                        disabled={send.isPending || !draft.trim()}
                        className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={send.isPending ? "Sending..." : "Send message"}
                      >
                        {send.isPending ? "Sending…" : "Send"}
                      </button>
                    </form>
                    {send.isError && (
                      <p className="mt-2 text-xs text-destructive">{send.error?.message}</p>
                    )}
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
