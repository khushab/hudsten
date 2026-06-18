"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

/**
 * Dual-handle price range (MW style): two overlapping native range inputs over a shared
 * track + two editable currency fields. Native inputs keep it keyboard-accessible with no
 * deps; the min slider sits on top so its thumb stays grabbable. Controlled — the parent
 * owns the values for filtering + URL sync.
 */
export function PriceRange({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  currency,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (next: { min: number; max: number }) => void;
  currency: string;
}) {
  // Currency symbol only (₹/$/…) — the boxes show a bare, right-aligned number like MW.
  const symbol = useMemo(() => {
    try {
      return (
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        })
          .formatToParts(0)
          .find((p) => p.type === "currency")?.value ?? ""
      );
    } catch {
      return "";
    }
  }, [currency]);

  const span = Math.max(1, max - min); // guard divide-by-zero
  const minPct = ((valueMin - min) / span) * 100;
  const maxPct = ((valueMax - min) / span) * 100;

  // Clamp against the other handle so they can't cross.
  const setMin = (v: number) =>
    onChange({ min: clamp(v, min, valueMax), max: valueMax });
  const setMax = (v: number) =>
    onChange({ min: valueMin, max: clamp(v, valueMin, max) });

  // Style the thumbs (webkit + moz); track stays transparent so our own bars show through.
  const thumb =
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:cursor-pointer";
  const slider =
    "pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent outline-none " +
    thumb;

  return (
    <div className="pt-3">
      <div className="relative mx-2 h-4">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-stone-200" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ink"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => setMin(Number(e.target.value))}
          className={cn(slider, "z-30")}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => setMax(Number(e.target.value))}
          className={cn(slider, "z-20")}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <PriceField symbol={symbol} value={valueMin} onCommit={setMin} label="Minimum price" />
        <span className="text-sm text-stone-400">to</span>
        <PriceField symbol={symbol} value={valueMax} onCommit={setMax} label="Maximum price" />
      </div>
    </div>
  );
}

function PriceField({
  symbol,
  value,
  onCommit,
  label,
}: {
  symbol: string;
  value: number;
  onCommit: (v: number) => void;
  label: string;
}) {
  // Single border that bolds on focus (1px→2px). box-border grows it inward, so there's no
  // layout shift and nothing extends past the box to clip. Input fully reset so no inset border.
  return (
    <label className="flex flex-1 items-center gap-1 border border-stone-300 px-3 py-2.5 transition-colors focus-within:border-2 focus-within:border-ink">
      <span className="text-sm text-stone-400">{symbol}</span>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onCommit(digits === "" ? 0 : Number(digits));
        }}
        // The label's border is the focus indicator; suppress the global :focus-visible ring
        // (globals.css) so it doesn't draw a second box inside the field.
        className="w-full appearance-none border-0 bg-transparent p-0 text-right text-sm tabular-nums outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </label>
  );
}
