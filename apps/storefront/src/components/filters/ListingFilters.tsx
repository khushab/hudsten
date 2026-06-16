"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductCard } from "@hudsten/db";
import { formatPrice } from "@hudsten/shared";
import { ProductGrid, EmptyProducts } from "@/components/product/ProductGrid";
import { cn } from "@/lib/cn";

type Sort = "featured" | "price-asc" | "price-desc";

const GENDER_LABEL: Record<string, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

/**
 * Client-side filters over a statically-rendered product set (keeps catalog pages
 * SSG/ISR + SEO-friendly: all products are in the HTML). Filters: color, gender, price.
 * PHASE 2: move to server-side query params + Postgres FTS when the catalog outgrows this.
 */
export function ListingFilters({
  products,
  colorFacets,
}: {
  products: ProductCard[];
  colorFacets: { value: string; color_hex: string | null }[];
}) {
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 0),
    };
  }, [products]);

  const availableGenders = useMemo(
    () => Array.from(new Set(products.map((p) => p.gender))),
    [products],
  );

  const [colors, setColors] = useState<Set<string>>(new Set());
  const [genders, setGenders] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number>(priceBounds.max);
  const [sort, setSort] = useState<Sort>("featured");

  // Filters ⇄ URL (?color=Black,Tan&for=men&max=2500&sort=price-asc): bookmarkable
  // and shareable. Read once after hydration (page stays SSG), then mirror changes
  // via replaceState so back/forward isn't spammed with filter steps.
  const urlReady = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const csv = (key: string) =>
      (params.get(key) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    // Match URL colors case-insensitively against known facets (canonical casing wins).
    const wantColors = csv("color").map((c) => c.toLowerCase());
    if (wantColors.length > 0) {
      setColors(
        new Set(
          colorFacets
            .filter((c) => wantColors.includes(c.value.toLowerCase()))
            .map((c) => c.value),
        ),
      );
    }
    const wantGenders = csv("for").filter((g) => g in GENDER_LABEL);
    if (wantGenders.length > 0) setGenders(new Set(wantGenders));

    const max = Number(params.get("max"));
    if (Number.isFinite(max) && max > 0 && max < priceBounds.max)
      setMaxPrice(Math.max(priceBounds.min, max));

    const wantSort = params.get("sort");
    if (wantSort === "price-asc" || wantSort === "price-desc") setSort(wantSort);

    urlReady.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!urlReady.current) return;
    const url = new URL(window.location.href);
    const setOrDelete = (key: string, value: string | null) =>
      value ? url.searchParams.set(key, value) : url.searchParams.delete(key);

    setOrDelete("color", colors.size > 0 ? Array.from(colors).join(",") : null);
    setOrDelete("for", genders.size > 0 ? Array.from(genders).join(",") : null);
    setOrDelete("max", maxPrice < priceBounds.max ? String(maxPrice) : null);
    setOrDelete("sort", sort !== "featured" ? sort : null);
    window.history.replaceState(null, "", url);
  }, [colors, genders, maxPrice, sort, priceBounds.max]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (colors.size > 0 && !(p.colors ?? []).some((c) => colors.has(c.value)))
        return false;
      if (genders.size > 0 && !genders.has(p.gender)) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, colors, genders, maxPrice, sort]);

  const toggle = (set: Set<string>, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  const hasFilters =
    colors.size > 0 || genders.size > 0 || maxPrice < priceBounds.max;

  const clear = () => {
    setColors(new Set());
    setGenders(new Set());
    setMaxPrice(priceBounds.max);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 rounded-lg border border-stone-200 bg-paper-dim p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          {/* Color */}
          {colorFacets.length > 0 && (
            <Group label="Color">
              <div className="flex flex-wrap gap-2">
                {colorFacets.map((c) => {
                  const active = colors.has(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      aria-pressed={active}
                      title={c.value}
                      onClick={() => setColors((s) => toggle(s, c.value))}
                      className={cn(
                        // 36px on touch screens (tap target), compact 28px on desktop.
                        "h-9 w-9 rounded-full border transition-all sm:h-7 sm:w-7",
                        active
                          ? "ring-2 ring-ink ring-offset-2 ring-offset-paper-dim"
                          : "border-stone-300 hover:border-ink",
                      )}
                      style={{ backgroundColor: c.color_hex ?? "#ddd" }}
                    >
                      <span className="sr-only">{c.value}</span>
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {/* Gender */}
          {availableGenders.length > 1 && (
            <Group label="For">
              <div className="flex flex-wrap gap-2">
                {availableGenders.map((g) => {
                  const active = genders.has(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setGenders((s) => toggle(s, g))}
                      className={cn(
                        "border px-3 py-1 text-sm uppercase tracking-[0.08em] transition-colors",
                        active
                          ? "border-ink bg-ink text-paper"
                          : "border-stone-300 text-stone-600 hover:border-ink",
                      )}
                    >
                      {GENDER_LABEL[g] ?? g}
                    </button>
                  );
                })}
              </div>
            </Group>
          )}

          {/* Price */}
          {priceBounds.max > priceBounds.min && (
            <Group label={`Under ${formatPrice(maxPrice, products[0]?.currency ?? "INR")}`}>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-44 accent-ink"
                aria-label="Maximum price"
              />
            </Group>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-200 pt-4">
          <p className="text-sm text-stone-500">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {hasFilters && (
              <button
                type="button"
                onClick={clear}
                className="ml-3 text-ink underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-stone-300 bg-paper px-2 py-1.5 text-sm outline-none focus:border-ink"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} priorityCount={4} />
      ) : (
        <EmptyProducts message="No products match these filters." />
      )}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-2xs font-medium uppercase tracking-eyebrow text-stone-500">
        {label}
      </p>
      {children}
    </div>
  );
}
