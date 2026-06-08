import type { ProductCard as ProductCardType } from "@hudsten/db";
import { cn } from "@/lib/cn";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: ProductCardType[];
  className?: string;
  /** Number of leading cards to mark priority (above-the-fold LCP). */
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

/** Honest empty state — never fabricate inventory. */
export function EmptyProducts({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 py-16 text-center">
      <p className="text-sm text-stone-500">
        {message ?? "No products here yet. Check back soon."}
      </p>
    </div>
  );
}
