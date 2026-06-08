import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from "./constants";

/**
 * Format a price for display. Uses Intl for correct grouping (₹2,499 / ₹1,00,000 in en-IN).
 * Prices are stored as numeric in the DB; we treat them as whole-rupee values, not paise,
 * so no /100 division. (Phase 2 payments may switch to integer minor-units — see // PHASE 2.)
 */
export function formatPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback if the currency code is unknown to Intl.
    const symbol = CURRENCY_SYMBOLS[currency] ?? "";
    return `${symbol}${amount.toLocaleString(locale)}`;
  }
}

/**
 * Discount percentage from compare-at anchor. Returns null when there's no valid markdown,
 * so the UI can decide to hide the "-X%" badge entirely (no fake/zero discounts).
 */
export function discountPercent(
  price: number,
  compareAtPrice: number | null | undefined,
): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
