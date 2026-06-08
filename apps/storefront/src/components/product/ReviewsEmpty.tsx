import { ShieldIcon, ReturnIcon } from "@/components/icons";

/**
 * Honest empty-state for reviews (PRD §1/§6 — NEVER fabricate social proof). For a new
 * arrival with no reviews, we lean on authority/risk-reversal substitutes instead of
 * fake stars. There is intentionally no review-submission UI in Phase 1.
 */
export function ReviewsEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-paper-dim p-6">
      <p className="font-display text-lg font-medium">No reviews yet</p>
      <p className="mt-1 text-sm text-stone-600">
        This is a fresh arrival. In the meantime, every Hudsten piece is backed
        by our guarantees:
      </p>
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-700">
        <span className="flex items-center gap-2">
          <ShieldIcon className="h-5 w-5 text-brass-600" />
          1-year warranty against defects
        </span>
        <span className="flex items-center gap-2">
          <ReturnIcon className="h-5 w-5 text-brass-600" />
          7-day easy returns
        </span>
      </div>
    </div>
  );
}
