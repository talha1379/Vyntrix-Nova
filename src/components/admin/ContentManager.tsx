/* eslint-disable react-refresh/only-export-components */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { deleteContent, listContent, saveContent, type CmsRow } from "@/lib/cms-admin.functions";

type FieldType = "text" | "textarea" | "number" | "boolean" | "list";

type Field = { key: string; label: string; type: FieldType };

export type ContentType = {
  table: string;
  label: string;
  titleKey: string;
  fields: Field[];
};

export const CONTENT_TYPES: ContentType[] = [
  {
    table: "services",
    label: "Services",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "icon", label: "Icon", type: "text" },
      { key: "starting_price_usd", label: "Starting price (USD)", type: "number" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    table: "portfolio_projects",
    label: "Portfolio",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "client_name", label: "Client", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "problem", label: "Problem", type: "textarea" },
      { key: "solution", label: "Solution", type: "textarea" },
      { key: "technologies", label: "Technologies (comma separated)", type: "list" },
      { key: "tags", label: "Tags (comma separated)", type: "list" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "live_url", label: "Live URL", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "is_featured", label: "Featured", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    table: "testimonials",
    label: "Testimonials",
    titleKey: "author_name",
    fields: [
      { key: "author_name", label: "Author", type: "text" },
      { key: "author_role", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "is_featured", label: "Featured", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    table: "faqs",
    label: "FAQs",
    titleKey: "question",
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "textarea" },
      { key: "category", label: "Category", type: "text" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    table: "team_members",
    label: "Team",
    titleKey: "full_name",
    fields: [
      { key: "full_name", label: "Full name", type: "text" },
      { key: "position", label: "Position", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "skills", label: "Skills (comma separated)", type: "list" },
      { key: "experience", label: "Experience", type: "text" },
      { key: "linkedin_url", label: "LinkedIn", type: "text" },
      { key: "github_url", label: "GitHub", type: "text" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
  {
    table: "pricing_items",
    label: "Pricing items",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "base_price_usd", label: "Base price (USD)", type: "number" },
      { key: "unit", label: "Unit", type: "text" },
      { key: "is_addon", label: "Add-on", type: "boolean" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_published", label: "Published", type: "boolean" },
    ],
  },
];

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function emptyDraft(type: ContentType): CmsRow {
  const draft: CmsRow = {};
  for (const f of type.fields) {
    draft[f.key] = f.type === "boolean" ? f.key === "is_published" : f.type === "number" ? 0 : "";
  }
  return draft;
}

function toDraft(type: ContentType, row: CmsRow): CmsRow {
  const draft: CmsRow = {};
  for (const f of type.fields) {
    const v = row[f.key];
    draft[f.key] =
      f.type === "list"
        ? Array.isArray(v)
          ? v.join(", ")
          : ""
        : (v ?? (f.type === "boolean" ? false : ""));
  }
  return draft;
}

function toPayload(type: ContentType, draft: CmsRow): CmsRow {
  const out: CmsRow = {};
  for (const f of type.fields) {
    const v = draft[f.key];
    if (f.type === "list") {
      out[f.key] = String(v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (f.type === "number") {
      out[f.key] = v === "" || v == null ? 0 : Number(v);
    } else if (f.type === "boolean") {
      out[f.key] = Boolean(v);
    } else {
      out[f.key] = v === "" ? null : String(v);
    }
  }
  return out;
}

export function ContentManager() {
  const qc = useQueryClient();
  const [typeIndex, setTypeIndex] = useState(0);
  const [editing, setEditing] = useState<{ id?: string; draft: CmsRow } | null>(null);

  const type = CONTENT_TYPES[typeIndex]!;
  const listFn = useServerFn(listContent);
  const saveFn = useServerFn(saveContent);
  const deleteFn = useServerFn(deleteContent);

  const rowsQuery = useQuery({
    queryKey: ["cms", type.table],
    queryFn: () => listFn({ data: { table: type.table } }),
  });

  const save = useMutation({
    mutationFn: (vars: { id?: string; values: CmsRow }) =>
      saveFn({ data: { table: type.table, ...vars } }),
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["cms", type.table] });
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { table: type.table, id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["cms", type.table] });
    },
    onError: (e) => toast.error(e.message),
  });

  const rows = (rowsQuery.data?.rows ?? []) as CmsRow[];

  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {CONTENT_TYPES.map((t, i) => (
          <button
            key={t.table}
            onClick={() => {
              setTypeIndex(i);
              setEditing(null);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              i === typeIndex
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{type.label}</h2>
        <button
          onClick={() => setEditing({ draft: emptyDraft(type) })}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
        >
          New entry
        </button>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({
              ...(editing.id ? { id: editing.id } : {}),
              values: toPayload(type, editing.draft),
            });
          }}
          className="surface-panel mt-5 grid gap-3 rounded-xl p-5 sm:grid-cols-2"
        >
          {type.fields.map((f) => (
            <label
              key={f.key}
              className={`flex flex-col gap-1.5 text-xs text-muted-foreground ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              {f.label}
              {f.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={String(editing.draft[f.key] ?? "")}
                  onChange={(e) =>
                    setEditing({ ...editing, draft: { ...editing.draft, [f.key]: e.target.value } })
                  }
                  className={inputClass}
                />
              ) : f.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={Boolean(editing.draft[f.key])}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      draft: { ...editing.draft, [f.key]: e.target.checked },
                    })
                  }
                  className="h-5 w-5 accent-[var(--color-primary)]"
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(editing.draft[f.key] ?? "")}
                  onChange={(e) =>
                    setEditing({ ...editing, draft: { ...editing.draft, [f.key]: e.target.value } })
                  }
                  className={inputClass}
                />
              )}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {rowsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!rowsQuery.isLoading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
        {rows.map((row) => (
          <article
            key={String(row["id"])}
            className="surface-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {String(row[type.titleKey] ?? "Untitled")}
              </p>
              <p className="text-xs text-muted-foreground">
                {row["is_published"] ? "Published" : "Draft"} · order{" "}
                {String(row["sort_order"] ?? 0)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing({ id: String(row["id"]), draft: toDraft(type, row) })}
                className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this entry?")) remove.mutate(String(row["id"]));
                }}
                className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
