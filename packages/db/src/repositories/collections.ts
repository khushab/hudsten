import type { SmartRules } from "@hudsten/shared";
import type { HudstenClient } from "../supabase/client";
import type { Collection, ProductCard } from "../types";
import { getCategoryBySlug } from "./categories";
import { getProductCards } from "./products";
import { RepositoryError, unwrap } from "./_shared";

const COLLECTION_COLS =
  "id, name, slug, type, rules, description, image_url, meta_title, meta_description, position, is_active, created_at, updated_at";

export async function getActiveCollections(
  client: HudstenClient,
): Promise<Collection[]> {
  const res = await client
    .from("collections")
    .select(COLLECTION_COLS)
    .order("position", { ascending: true });
  return (unwrap(res, "getActiveCollections") ?? []) as Collection[];
}

export async function getCollectionBySlug(
  client: HudstenClient,
  slug: string,
): Promise<Collection | null> {
  const res = await client
    .from("collections")
    .select(COLLECTION_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return unwrap(res, `getCollectionBySlug(${slug})`) as Collection | null;
}

/**
 * Resolve a collection's products.
 *  • manual → membership rows in product_collections (manual order preserved)
 *  • smart  → products matching collections.rules (gender includes unisex; category by slug)
 */
export async function getProductsForCollection(
  client: HudstenClient,
  collection: Collection,
): Promise<ProductCard[]> {
  if (collection.type === "manual") {
    const res = await client
      .from("product_collections")
      .select("product_id, position")
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });
    if (res.error)
      throw new RepositoryError(
        `getProductsForCollection(manual ${collection.slug}): ${res.error.message}`,
        res.error,
      );
    const ordered = (res.data ?? []).map((r) => r.product_id);
    if (ordered.length === 0) return [];
    const cards = await getProductCards(client, { ids: ordered });
    // Re-sort to the manual order (getProductCards orders by products.position).
    const rank = new Map(ordered.map((id, i) => [id, i]));
    return cards.sort(
      (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
    );
  }

  // Smart collection
  const rules = (collection.rules ?? {}) as SmartRules;
  let categoryId: string | undefined;
  if (rules.category) {
    const cat = await getCategoryBySlug(client, rules.category);
    // Unknown category slug → no matches rather than ignoring the rule.
    if (!cat) return [];
    categoryId = cat.id;
  }
  // PHASE 2: rules.tags (match-all tag filtering) not yet supported — seed uses gender+category.
  return getProductCards(client, {
    categoryId,
    genders: rules.gender ? [rules.gender] : undefined,
    priceMin: rules.price_min,
    priceMax: rules.price_max,
  });
}
