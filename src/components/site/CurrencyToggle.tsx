/* eslint-disable react-refresh/only-export-components */

import { useEffect, useState } from "react";
import type { Currency } from "@/lib/currency";
import { readStoredCurrency, storeCurrency } from "@/lib/currency";
import { getVisitorCountry } from "@/lib/cms.functions";

/** Resolves currency from localStorage, falling back to geo-IP country, defaulting to USD. */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let active = true;
    const stored = readStoredCurrency();
    if (stored) {
      setCurrencyState(stored);
      setResolved(true);
      return;
    }
    getVisitorCountry()
      .then((res) => {
        if (!active) return;
        const next: Currency = res.country === "PK" ? "PKR" : "USD";
        setCurrencyState(next);
        storeCurrency(next);
      })
      .catch(() => undefined)
      .finally(() => active && setResolved(true));
    return () => {
      active = false;
    };
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    storeCurrency(next);
  };

  return { currency, setCurrency, resolved };
}

export function CurrencyToggle({
  currency,
  onChange,
}: {
  currency: Currency;
  onChange: (c: Currency) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Display currency"
      className="inline-flex rounded-lg border border-border bg-surface/60 p-1"
    >
      {(["PKR", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-pressed={currency === c}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            currency === c
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {c === "PKR" ? "🇵🇰 PKR" : "🌍 USD"}
        </button>
      ))}
    </div>
  );
}
