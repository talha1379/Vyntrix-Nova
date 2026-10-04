export type Currency = "USD" | "PKR";

export const CURRENCY_STORAGE_KEY = "preferredCurrency";

/** Round PKR amounts to the nearest 500 so conversions don't look like artifacts. */
export function roundPkr(amount: number): number {
  return Math.round(amount / 500) * 500;
}

export function convert(amountUsd: number, currency: Currency, usdToPkrRate: number): number {
  if (currency === "USD") return Math.round(amountUsd);
  return roundPkr(amountUsd * usdToPkrRate);
}

/** Formats using standard grouping for USD and Pakistani lakh-style grouping for PKR. */
export function formatPrice(amountUsd: number, currency: Currency, usdToPkrRate: number): string {
  const value = convert(amountUsd, currency, usdToPkrRate);
  if (currency === "USD") {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function readStoredCurrency(): Currency | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return stored === "USD" || stored === "PKR" ? stored : null;
}

export function storeCurrency(currency: Currency) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

export const UNIT_LABEL: Record<string, string> = {
  fixed: "one-off",
  hourly: "per hour",
  per_page: "per page",
  monthly: "per month",
};
