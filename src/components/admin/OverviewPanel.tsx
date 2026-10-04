import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getAnalytics, getSettings, updateRate } from "@/lib/cms-admin.functions";

function usd(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function OverviewPanel() {
  const qc = useQueryClient();
  const analyticsFn = useServerFn(getAnalytics);
  const settingsFn = useServerFn(getSettings);
  const rateFn = useServerFn(updateRate);
  const [rate, setRate] = useState<string>("");

  const analytics = useQuery({ queryKey: ["analytics"], queryFn: () => analyticsFn() });
  const settings = useQuery({ queryKey: ["settings"], queryFn: () => settingsFn() });

  const saveRate = useMutation({
    mutationFn: (vars: { id: string; rate: number }) => rateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Exchange rate updated");
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const a = analytics.data;
  const s = settings.data?.settings;

  const stats = [
    { label: "Total leads", value: a ? String(a.totalLeads) : "—", suffix: "" },
    { label: "Last 30 days", value: a ? String(a.last30) : "—", suffix: "leads" },
    { label: "Open pipeline", value: a ? usd(a.pipelineUsd) : "—", suffix: "" },
    { label: "Won value", value: a ? usd(a.wonUsd) : "—", suffix: "" },
  ];

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Business metrics at a glance — pipeline, sources and content.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <div
            key={st.label}
            className="rounded-lg border border-border/30 bg-card/30 p-5 transition-all hover:bg-card/50 hover:border-border/50"
          >
            <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
              {st.label}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="font-display text-3xl font-semibold text-foreground">{st.value}</p>
              {st.suffix && (
                <span className="text-xs text-muted-foreground font-medium">{st.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline by Status */}
        <div className="rounded-lg border border-border/30 bg-card/30 p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Pipeline by Status</h2>
          <div className="mt-5 space-y-4">
            {Object.entries(a?.byStatus ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            ) : (
              Object.entries(a?.byStatus ?? {}).map(([status, count]) => {
                const total = a?.totalLeads ?? 1;
                const percentage = (count / total) * 100;
                const statusColor: Record<string, string> = {
                  new: "bg-primary",
                  contacted: "bg-secondary",
                  qualified: "bg-accent",
                  proposal: "bg-warning",
                  won: "bg-emerald-500",
                  lost: "bg-destructive",
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {status}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{count}</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-secondary/60"
                      aria-label={`${status}: ${count} leads (${Math.round(percentage)}%)`}
                      role="progressbar"
                      aria-valuenow={Math.round(percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full ${statusColor[status as keyof typeof statusColor] || "bg-primary"}`}
                        style={{ width: `${Math.max(3, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Content Library & Lead Sources */}
        <div className="rounded-lg border border-border/30 bg-card/30 p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Business Assets</h2>

          {/* Content Library */}
          <div className="mt-5">
            <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-3">
              Content Library
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Services", count: a?.counts.services ?? 0 },
                { label: "Portfolio", count: a?.counts.projects ?? 0 },
                { label: "Pricing", count: a?.counts.pricing ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border bg-surface-subtle p-3 text-center">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-display text-xl font-semibold text-accent">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="mt-6">
            <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-3">
              Lead Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(a?.bySource ?? {}).map(([src, count]) => (
                <div
                  key={src}
                  className="rounded-full border border-border bg-surface-subtle px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {src} <span className="ml-1 text-muted-foreground">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="rounded-lg border border-border/30 bg-card/30 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Exchange Rate Settings
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              USD to PKR conversion rate used throughout the site. Last updated{" "}
              <span className="font-mono text-xs text-foreground">
                {s ? new Date(s.last_rate_updated_at).toLocaleString() : "—"}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="exchange-rate-input"
              className="text-xs uppercase tracking-wider font-medium text-muted-foreground block mb-2"
            >
              Rate (PKR per USD)
            </label>
            <input
              id="exchange-rate-input"
              type="number"
              step="0.01"
              value={rate === "" ? String(s?.usd_to_pkr_rate ?? "") : rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-40 rounded-lg border border-border/50 bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => {
              if (!s) return;
              saveRate.mutate({ id: s.id, rate: Number(rate === "" ? s.usd_to_pkr_rate : rate) });
            }}
            disabled={saveRate.isPending || !s}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveRate.isPending ? "Saving…" : "Update rate"}
          </button>
        </div>
      </div>
    </section>
  );
}
