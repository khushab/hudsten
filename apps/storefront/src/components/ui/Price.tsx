import { discountPercent, formatPrice } from "@hudsten/shared";
import { cn } from "@/lib/cn";

/**
 * Price with compare-at anchor + % off (PRD §6 price anchoring). The discount pill
 * only renders when there's a genuine markdown (no fake/zero discounts).
 */
export function Price({
  price,
  compareAt,
  currency,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number | null;
  currency: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = discountPercent(price, compareAt);
  const sizeCls = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn("font-display font-semibold tracking-tight", sizeCls)}>
        {formatPrice(price, currency)}
      </span>
      {pct != null && compareAt != null && (
        <>
          <span className="text-sm text-stone-600 line-through">
            {formatPrice(compareAt, currency)}
          </span>
          <span className="rounded-sm bg-brass-100 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-brass-800">
            -{pct}%
          </span>
        </>
      )}
    </div>
  );
}
