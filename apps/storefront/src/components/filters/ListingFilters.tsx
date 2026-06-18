"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ProductCard } from "@hudsten/db";
import { ProductGrid, EmptyProducts } from "@/components/product/ProductGrid";
import { PriceRange } from "@/components/filters/PriceRange";
import { Accordion } from "@/components/ui/Accordion";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronDown, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type Sort = "featured" | "price-asc" | "price-desc" | "az" | "za";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "az", label: "Alphabetically, A–Z" },
  { value: "za", label: "Alphabetically, Z–A" },
];
const SORT_VALUES = SORT_OPTIONS.map((o) => o.value);

const GENDER_LABEL: Record<string, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
};

/**
 * Client-side filters over a statically-rendered product set (keeps catalog pages
 * SSG/ISR + SEO-friendly: all products are in the HTML). Filters: color, gender, price.
 * UI follows the Mission Workshop pattern — a control bar (count · Sort · Filter), a
 * right-slide filter drawer, and a Sort-by dropdown. PHASE 2: server-side query + FTS.
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
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 0) };
  }, [products]);

  const availableGenders = useMemo(
    () => Array.from(new Set(products.map((p) => p.gender))),
    [products],
  );

  const [colors, setColors] = useState<Set<string>>(new Set());
  const [genders, setGenders] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState<number>(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState<number>(priceBounds.max);
  const [sort, setSort] = useState<Sort>("featured");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const currency = products[0]?.currency ?? "INR";

  // Filters ⇄ URL (?color=Black,Tan&for=men&max=2500&sort=price-asc): bookmarkable +
  // shareable. Read once after hydration (page stays SSG), then mirror via replaceState.
  const urlReady = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const csv = (key: string) =>
      (params.get(key) ?? "").split(",").map((s) => s.trim()).filter(Boolean);

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

    const min = Number(params.get("min"));
    if (Number.isFinite(min) && min > priceBounds.min && min < priceBounds.max)
      setMinPrice(min);

    const max = Number(params.get("max"));
    if (Number.isFinite(max) && max > 0 && max < priceBounds.max)
      setMaxPrice(Math.max(priceBounds.min, max));

    const wantSort = params.get("sort");
    if (wantSort && (SORT_VALUES as string[]).includes(wantSort))
      setSort(wantSort as Sort);

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
    setOrDelete("min", minPrice > priceBounds.min ? String(minPrice) : null);
    setOrDelete("max", maxPrice < priceBounds.max ? String(maxPrice) : null);
    setOrDelete("sort", sort !== "featured" ? sort : null);
    window.history.replaceState(null, "", url);
  }, [colors, genders, minPrice, maxPrice, sort, priceBounds.min, priceBounds.max]);

  // Escape closes the drawer + sort dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setSortOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (colors.size > 0 && !(p.colors ?? []).some((c) => colors.has(c.value)))
        return false;
      if (genders.size > 0 && !genders.has(p.gender)) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "az":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        list = [...list].sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return list;
  }, [products, colors, genders, minPrice, maxPrice, sort]);

  const toggle = (set: Set<string>, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  const priceActive =
    minPrice > priceBounds.min || maxPrice < priceBounds.max;
  const activeCount = colors.size + genders.size + (priceActive ? 1 : 0);

  const clear = () => {
    setColors(new Set());
    setGenders(new Set());
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  };

  return (
    <div>
      {/* Control bar — count · Sort by ▾ · Filter (MW pattern). */}
      <div className="mb-8 flex items-stretch border-y border-stone-200 text-xs uppercase tracking-caps">
        <div className="flex flex-1 items-center px-1 py-4 text-stone-500 sm:px-4">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
            onClick={() => setSortOpen((o) => !o)}
            className="flex h-full items-center gap-2 border-l border-stone-200 px-4 py-4 text-stone-600 transition-colors hover:text-ink sm:px-6"
          >
            Sort by
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                sortOpen && "rotate-180",
              )}
            />
          </button>
          {sortOpen && (
            <>
              {/* click-away catcher */}
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => setSortOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="listbox"
                className="absolute right-0 top-full z-50 mt-px w-60 border border-stone-200 bg-paper py-1"
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={sort === o.value}
                    onClick={() => {
                      setSort(o.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2.5 text-left text-sm normal-case tracking-normal transition-colors hover:bg-stone-100",
                      sort === o.value ? "font-medium text-ink" : "text-stone-600",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 border-l border-stone-200 px-4 py-4 text-stone-600 transition-colors hover:text-ink sm:px-6"
        >
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      {/* Grid (unchanged) */}
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} priorityCount={4} />
      ) : (
        <EmptyProducts message="No products match these filters." />
      )}

      {/* Filter drawer — slides in from the right. Always mounted so it animates out. */}
      <div
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Close filters"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
          className="absolute inset-0 bg-ink/40"
        />
        <div
          role="dialog"
          aria-label="Filters"
          className={cn(
            "absolute right-0 top-0 flex h-dvh w-full max-w-sm flex-col bg-paper shadow-xl transition-transform duration-300 ease-lux",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <p className="text-sm font-medium uppercase tracking-caps">Filters</p>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setDrawerOpen(false)}
              className="text-stone-500 transition-colors hover:text-ink"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5">
            {colorFacets.length > 0 && (
              <Accordion title="Colour" defaultOpen>
                <div className="flex flex-wrap gap-2 pt-1">
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
                          "h-9 w-9 rounded-full border transition-all",
                          active
                            ? "ring-2 ring-ink ring-offset-2 ring-offset-paper"
                            : "border-stone-300 hover:border-ink",
                        )}
                        style={{ backgroundColor: c.color_hex ?? "#ddd" }}
                      >
                        <span className="sr-only">{c.value}</span>
                      </button>
                    );
                  })}
                </div>
              </Accordion>
            )}

            {availableGenders.length > 1 && (
              <Accordion title="For" defaultOpen>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableGenders.map((g) => {
                    const active = genders.has(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setGenders((s) => toggle(s, g))}
                        className={cn(
                          "border px-3 py-1.5 text-sm uppercase tracking-[0.08em] transition-colors",
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
              </Accordion>
            )}

            {priceBounds.max > priceBounds.min && (
              <Accordion title="Price" defaultOpen>
                <PriceRange
                  min={priceBounds.min}
                  max={priceBounds.max}
                  valueMin={minPrice}
                  valueMax={maxPrice}
                  onChange={({ min, max }) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                  }}
                  currency={currency}
                />
              </Accordion>
            )}
          </div>

          <div className="border-t border-stone-200 p-4">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clear}
                className="mb-3 block w-full text-center text-xs uppercase tracking-caps text-stone-500 underline underline-offset-2 transition-colors hover:text-ink"
              >
                Clear all
              </button>
            )}
            {/* MW "view results" button: solid, borderless, label left + count right (space-between). */}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className={buttonClasses("primary", "md", "h-[45px] w-full justify-between px-7")}
            >
              <span>View results</span>
              <span>{filtered.length}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
