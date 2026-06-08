import type { HudstenClient } from "../supabase/client";
import type { Tables } from "../database.types";
import { unwrap } from "./_shared";

export type Review = Tables<"reviews">;

export interface ReviewSummary {
  count: number;
  average: number | null; // null when there are no reviews → PDP hides the rating
}

/**
 * Published reviews for a product. Ships EMPTY (PRD guardrail — never fabricated).
 * RLS only returns is_published = true. The PDP renders an honest empty state when count = 0.
 */
export async function getPublishedReviews(
  client: HudstenClient,
  productId: string,
): Promise<Review[]> {
  const res = await client
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return (unwrap(res, "getPublishedReviews") ?? []) as Review[];
}

export function summarizeReviews(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) return { count: 0, average: null };
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { count: reviews.length, average: Math.round(avg * 10) / 10 };
}
