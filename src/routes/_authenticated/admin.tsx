import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, listLeads, updateLeadStatus } from "@/lib/admin.functions";
import { ContentManager } from "@/components/admin/ContentManager";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { ProjectsPanel } from "@/components/admin/ProjectsPanel";
import { JobsPanel } from "@/components/admin/JobsPanel";
import { PortfolioProjectsPanel } from "@/components/admin/PortfolioProjectsPanel";
import { generateProposal } from "@/lib/ai.functions";

const TABS = ["Overview", "Leads", "Client Projects", "Projects", "Jobs", "Content"] as const;

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

const statusClasses: Record<string, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-cyan-200 bg-cyan-50 text-cyan-700",
  qualified: "border-violet-200 bg-violet-50 text-violet-700",
  proposal: "border-amber-200 bg-amber-50 text-amber-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-red-200 bg-red-50 text-red-700",
  Draft: "border-slate-200 bg-slate-100 text-slate-700",
  Published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Archived: "border-slate-200 bg-slate-100 text-slate-700",
  "On hold": "border-amber-200 bg-amber-50 text-amber-700",
};

// Navigation groups for better visual organization
const NAV_GROUPS = [
  {
    label: "Workspace",
    tabs: ["Overview"],
  },
  {
    label: "Business",
    tabs: ["Leads", "Client Projects"],
  },
  {
    label: "Content",
    tabs: ["Projects", "Jobs", "Content"],
  },
];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config = statusClasses[status] ?? "border-border bg-surface-subtle text-foreground";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
      {status}
    </span>
  );
}

// Loading skeleton
function SkeletonTab() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-muted/50 p-4 h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">VyntrixNova</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Admin</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Workspace error</h1>
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
            <span className="hidden text-xs text-muted-foreground sm:inline">Admin</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold">Not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The admin page you're looking for doesn't exist.
          </p>
          <Link
            to="/admin"
            className="mt-6 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back to admin
          </Link>
        </div>
      </main>
    </div>
  ),
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const access = useServerFn(getMyAccess);
  const leadsFn = useServerFn(listLeads);
  const statusFn = useServerFn(updateLeadStatus);
  const proposalFn = useServerFn(generateProposal);
  const [proposals, setProposals] = useState<Record<string, string>>({});
  const [proposalFor, setProposalFor] = useState<string | null>(null);

  const makeProposal = useMutation({
    mutationFn: (leadId: string) => proposalFn({ data: { leadId } }),
    onMutate: (leadId: string) => setProposalFor(leadId),
    onSuccess: (res, leadId) => setProposals((p) => ({ ...p, [leadId]: res.proposal })),
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setProposalFor(null),
  });

  const accessQuery = useQuery({ queryKey: ["access"], queryFn: () => access() });
  const isAdmin = accessQuery.data?.isAdmin ?? false;

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsFn(),
    enabled: isAdmin,
  });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: string }) => statusFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
    onError: (e) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  }

  const leads = leadsQuery.data?.leads ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold">VyntrixNova</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Admin</span>
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
          {accessQuery.isLoading ? (
            <SkeletonTab />
          ) : !isAdmin ? (
            /* No Access State */
            <div className="rounded-xl border border-border/30 bg-card/30 p-8">
              <h1 className="font-display text-2xl font-semibold">No admin access</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Your account is signed in but has no admin role. Ask an existing workspace owner to
                grant you access.
              </p>
              <Link
                to="/portal"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Go to client portal
              </Link>
            </div>
          ) : (
            /* Admin View */
            <>
              {/* Navigation */}
              <nav className="mb-6 space-y-3">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {group.tabs.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                            tab === t
                              ? "border border-primary/40 bg-primary/10 text-foreground"
                              : "border border-transparent text-muted-foreground hover:border-border/50 hover:bg-surface-subtle hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Content Area */}
              {tab === "Overview" && <OverviewPanel />}
              {tab === "Content" && <ContentManager />}
              {tab === "Client Projects" && <ProjectsPanel />}
              {tab === "Projects" && <PortfolioProjectsPanel />}
              {tab === "Jobs" && <JobsPanel />}

              {/* Leads Section */}
              {tab === "Leads" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <div>
                      <h1 className="font-display text-3xl font-semibold tracking-tight">Leads</h1>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Manage briefs and proposals. Total leads:{" "}
                        <span className="font-semibold text-foreground">{leads.length}</span>
                      </p>
                    </div>

                    {/* Status filters */}
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 px-3 py-2"
                        >
                          <span className="text-xs font-medium uppercase text-muted-foreground">
                            {s}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-foreground">
                            {leads.filter((l) => l.status === s).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leads List */}
                  <div className="space-y-3">
                    {leadsQuery.isLoading && (
                      <p className="text-sm text-muted-foreground">Loading leads…</p>
                    )}
                    {!leadsQuery.isLoading && leads.length === 0 && (
                      <div className="rounded-lg border border-border/20 bg-card/30 p-8 text-center">
                        <p className="text-sm text-muted-foreground">No leads yet.</p>
                      </div>
                    )}
                    {leads.map((lead) => (
                      <article
                        key={lead.id}
                        className="rounded-lg border border-border/30 bg-card/30 p-5 transition-all hover:bg-card/50 hover:border-border/50"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 min-w-0">
                            <h2 className="font-display text-lg font-semibold text-foreground">
                              {lead.full_name}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <a
                                href={`mailto:${lead.email}`}
                                className="hover:text-primary transition-colors"
                              >
                                {lead.email}
                              </a>
                              {lead.company && (
                                <>
                                  <span className="text-border">•</span>
                                  <span>{lead.company}</span>
                                </>
                              )}
                              {lead.phone && (
                                <>
                                  <span className="text-border">•</span>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    {lead.phone}
                                  </a>
                                </>
                              )}
                            </div>

                            {lead.message && (
                              <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                                {lead.message}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[lead.project_type, lead.budget_range, lead.timeline, lead.source]
                                .filter(Boolean)
                                .map((tag) => (
                                  <span
                                    key={tag as string}
                                    className="rounded-full border border-border bg-surface-subtle px-2.5 py-1 text-[11px] font-medium text-foreground/80"
                                  >
                                    {tag as string}
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Value and Date */}
                          {lead.estimated_total != null && (
                            <div className="text-right shrink-0">
                              <p className="font-display text-xl font-semibold text-accent">
                                {lead.currency === "PKR"
                                  ? `Rs ${Number(lead.estimated_total).toLocaleString("en-IN", {
                                      maximumFractionDigits: 0,
                                    })}`
                                  : `$${Number(lead.estimated_total).toLocaleString("en-US", {
                                      maximumFractionDigits: 0,
                                    })}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status and Actions */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => setStatus.mutate({ id: lead.id, status: s })}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                                  lead.status === s
                                    ? "bg-primary/20 border border-primary/40 text-primary"
                                    : "border border-border/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => makeProposal.mutate(lead.id)}
                            disabled={proposalFor === lead.id}
                            className="rounded-full border border-accent/50 px-3 py-1.5 text-xs font-medium text-accent hover:border-accent hover:bg-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {proposalFor === lead.id ? "Writing…" : "AI proposal"}
                          </button>
                        </div>

                        {/* Proposal Display */}
                        {proposals[lead.id] && (
                          <div className="mt-4 rounded-lg border border-border/30 bg-secondary/20 p-4">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                                AI Draft Proposal
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(proposals[lead.id] ?? "");
                                  toast.success("Proposal copied");
                                }}
                                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground text-muted-foreground">
                              {proposals[lead.id]}
                            </pre>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
