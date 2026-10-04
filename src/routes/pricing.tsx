import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CurrencyToggle, useCurrency } from "@/components/site/CurrencyToggle";
import { getPricingData } from "@/lib/cms.functions";
import { formatPrice, UNIT_LABEL } from "@/lib/currency";

const pricingQuery = queryOptions({
  queryKey: ["pricing"],
  queryFn: () => getPricingData(),
});

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing Calculator — Estimate Your Project | VyntrixNova" },
      {
        name: "description",
        content:
          "Build a live estimate for your web, mobile or AI project. Pick deliverables and add-ons, and see pricing instantly in USD or PKR.",
      },
      { property: "og:title", content: "Pricing Calculator — Estimate Your Project | VyntrixNova" },
      {
        property: "og:description",
        content: "Transparent project pricing in USD or PKR, calculated live from your selections.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pricingQuery),
  errorComponent: () => <Shell title="Something went wrong" />,
  notFoundComponent: () => <Shell title="Page not found" />,
  component: PricingPage,
});

function Shell({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-32">
        <h1 className="text-3xl font-semibold">{title}</h1>
      </main>
      <SiteFooter />
    </div>
  );
}

function PricingPage() {
  const { data } = useSuspenseQuery(pricingQuery);
  const { currency, setCurrency } = useCurrency();
  const [selected, setSelected] = useState<string[]>([]);

  const core = data.items.filter((i) => !i.is_addon);
  const addons = data.items.filter((i) => i.is_addon);

  const totalUsd = useMemo(
    () =>
      data.items
        .filter((i) => selected.includes(i.id))
        .reduce((sum, i) => sum + i.base_price_usd, 0),
    [data.items, selected],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const rate = data.usdToPkrRate;

  const selectedItems = data.items.filter((i) => selected.includes(i.id));

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden border-b border-border bg-background">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-16 md:gap-8 md:py-20 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <p className="marker-accent text-xs">Transparent pricing</p>
              <h1 className="mt-5 text-[clamp(1.75rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
                Build your estimate in minutes
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground-secondary">
                Select the services and capabilities your project needs. Your total updates
                instantly. When you're ready, send it as a brief—no hidden fees, no surprises.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Display currency
                </p>
                <CurrencyToggle currency={currency} onChange={setCurrency} />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container-site py-16 md:py-24 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
            {/* Service Selection */}
            <div className="space-y-14">
              {/* Core Deliverables */}
              <div>
                <div className="mb-8 flex items-end justify-between gap-5 border-b border-border/50 pb-6">
                  <div>
                    <p className="marker-accent text-xs">01 / Foundation</p>
                    <h2 className="mt-3 text-2xl font-semibold">Core deliverables</h2>
                  </div>
                  <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
                    Build the foundation of your project
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {core.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      rate={rate}
                      active={selected.includes(item.id)}
                      onToggle={() => toggle(item.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <div className="mb-8 flex items-end justify-between gap-5 border-b border-border/50 pb-6">
                  <div>
                    <p className="marker-accent text-xs">02 / Extend</p>
                    <h2 className="mt-3 text-2xl font-semibold">Focused capabilities</h2>
                  </div>
                  <p className="hidden max-w-xs text-right text-xs leading-relaxed text-muted-foreground sm:block">
                    Add specialized features as needed
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {addons.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      rate={rate}
                      active={selected.includes(item.id)}
                      onToggle={() => toggle(item.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:h-fit">
              <div className="surface-panel border border-border/60 p-7 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-6">
                  <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Your estimate
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {currency}
                  </span>
                </div>

                {/* Total */}
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Total amount
                  </p>
                  <p
                    aria-live="polite"
                    className="mt-3 text-5xl font-semibold tracking-tight text-foreground lg:text-6xl"
                  >
                    {formatPrice(totalUsd, currency, rate)}
                  </p>
                  <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
                    {selected.length === 0
                      ? "No items selected"
                      : `${selected.length} item${selected.length === 1 ? "" : "s"} selected`}
                  </p>
                </div>

                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <>
                    <div className="my-6 h-px bg-border/40" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Selected services
                      </p>
                      <ul aria-live="polite" className="mt-4 space-y-3">
                        {selectedItems.map((i) => (
                          <li
                            key={i.id}
                            className="flex items-center justify-between gap-3 border-b border-border/30 pb-3 text-sm last:border-0 last:pb-0"
                          >
                            <span className="flex items-center gap-2 text-foreground">
                              <Check className="h-4 w-4 text-accent" />
                              {i.name}
                            </span>
                            <span className="shrink-0 font-medium text-foreground">
                              {formatPrice(i.base_price_usd, currency, rate)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* CTA */}
                <Link
                  to="/contact"
                  search={{
                    items: selected.length ? selected.join(",") : undefined,
                    total: totalUsd || undefined,
                    currency,
                  }}
                  className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  Send this as a brief
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                {/* Footer Notes */}
                <div className="mt-6 space-y-3 border-t border-border/40 pt-6">
                  {currency === "PKR" && (
                    <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Exchange rate:</span> 1 USD ≈ Rs{" "}
                      {rate.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                    Estimates are indicative. Final pricing and timeline are confirmed after a
                    discovery conversation.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ItemCard({
  item,
  currency,
  rate,
  active,
  onToggle,
}: {
  item: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    base_price_usd: number;
    unit: string;
  };
  currency: "USD" | "PKR";
  rate: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`surface-panel group relative flex h-full min-h-52 flex-col p-6 text-left transition-all duration-200 ${
        active
          ? "border-primary/60 bg-primary/8"
          : "border-border/50 hover:-translate-y-1 hover:border-primary/40"
      }`}
    >
      {/* Selection Indicator */}
      <div className="absolute right-6 top-6">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
            active ? "border-primary bg-primary" : "border-border group-hover:border-primary/60"
          }`}
        >
          {active && <Check className="h-3.5 w-3.5 text-background" />}
        </span>
      </div>

      {/* Content */}
      <div className="pr-10 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary">
          {item.category}
        </p>
        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight">{item.name}</h3>
        {item.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        )}
      </div>

      {/* Price Section */}
      <div className="mt-6 border-t border-border/40 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {formatPrice(item.base_price_usd, currency, rate)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {UNIT_LABEL[item.unit] ?? item.unit}
            </p>
          </div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              active ? "text-accent" : "text-muted-foreground"
            }`}
          >
            {active ? "Added" : "Add"}
          </span>
        </div>
      </div>
    </button>
  );
}
