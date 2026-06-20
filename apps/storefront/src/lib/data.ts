import { unstable_cache } from "next/cache";
import {
  getActiveCategories,
  getActiveCollections,
  getActiveProductSlugs,
  getCategoryBreadcrumb,
  getCategoryBySlug,
  getCategoryTree,
  getCollectionBySlug,
  getColorFacets,
  getFeaturedProducts,
  getListingCards,
  getNavigation,
  getProductBySlug,
  getProductCards,
  getProductsForCollection,
  getPublishedReviews,
  getSettings,
  type ProductCardFilters,
} from "@hudsten/db";
import { createPublicClient } from "@/lib/supabase/server";

/**
 * Server-side data accessors. Each read is wrapped in `unstable_cache` with `sb:<table>` tags so
 * NEXT owns the cache entry — supabase-js bypasses Next's patched fetch, so tagging the fetch is
 * silently ignored (supabase-js#917); unstable_cache is what `revalidateTag('sb:<table>')` (called
 * by /api/revalidate on an admin save) can reliably clear. `revalidate` is a time-based backstop.
 *
 * Components NEVER call Supabase directly — they call these. This is the portability seam.
 */

const REVALIDATE = 3600;

function tagged<R>(
  keyParts: string[],
  tables: string[],
  fn: () => Promise<R>,
): Promise<R> {
  return unstable_cache(fn, keyParts, {
    tags: [...tables.map((t) => `sb:${t}`), "sb:all"],
    revalidate: REVALIDATE,
  })();
}

export const fetchSettings = () =>
  tagged(["settings"], ["settings"], () => getSettings(createPublicClient()));
export const fetchNavigation = () =>
  tagged(["navigation"], ["navigation_menu"], () =>
    getNavigation(createPublicClient()),
  );
export const fetchCategoryTree = () =>
  tagged(["category-tree"], ["categories"], () =>
    getCategoryTree(createPublicClient()),
  );
export const fetchActiveCategories = () =>
  tagged(["active-categories"], ["categories"], () =>
    getActiveCategories(createPublicClient()),
  );
export const fetchActiveProductSlugs = () =>
  tagged(["active-product-slugs"], ["products"], () =>
    getActiveProductSlugs(createPublicClient()),
  );
export const fetchActiveCollections = () =>
  tagged(["active-collections"], ["collections"], () =>
    getActiveCollections(createPublicClient()),
  );

export const fetchFeaturedProducts = (limit?: number) =>
  tagged(["featured-products", String(limit ?? "")], ["products"], () =>
    getFeaturedProducts(createPublicClient(), limit),
  );

export const fetchCategoryBySlug = (slug: string) =>
  tagged(["category-by-slug", slug], ["categories"], () =>
    getCategoryBySlug(createPublicClient(), slug),
  );
export const fetchCategoryBreadcrumb = (slug: string) =>
  tagged(["category-breadcrumb", slug], ["categories"], () =>
    getCategoryBreadcrumb(createPublicClient(), slug),
  );
export const fetchCollectionBySlug = (slug: string) =>
  tagged(["collection-by-slug", slug], ["collections"], () =>
    getCollectionBySlug(createPublicClient(), slug),
  );

export const fetchProductCards = (filters?: ProductCardFilters) =>
  tagged(["product-cards", JSON.stringify(filters ?? {})], ["products"], () =>
    getProductCards(createPublicClient(), filters),
  );
export const fetchListingCards = (filters?: ProductCardFilters) =>
  tagged(["listing-cards", JSON.stringify(filters ?? {})], ["products"], () =>
    getListingCards(createPublicClient(), filters),
  );
export const fetchProductsForCollection = (
  collection: Parameters<typeof getProductsForCollection>[1],
) =>
  tagged(
    ["products-for-collection", collection.id],
    ["products", "product_collections"],
    () => getProductsForCollection(createPublicClient(), collection),
  );
export const fetchColorFacets = (opts?: Parameters<typeof getColorFacets>[1]) =>
  tagged(["color-facets", JSON.stringify(opts ?? {})], ["products"], () =>
    getColorFacets(createPublicClient(), opts),
  );

export const fetchProductBySlug = (slug: string) =>
  tagged(["product-by-slug", slug], ["products"], () =>
    getProductBySlug(createPublicClient(), slug),
  );
/** Related products — same category, excluding the current product. */
export const fetchProductsForCrossSell = (
  categoryId: string,
  excludeId: string,
  limit = 4,
) =>
  tagged(["cross-sell", categoryId, excludeId, String(limit)], ["products"], () =>
    getProductCards(createPublicClient(), { categoryId, excludeId, limit }),
  );
export const fetchPublishedReviews = (productId: string) =>
  tagged(["published-reviews", productId], ["reviews", "products"], () =>
    getPublishedReviews(createPublicClient(), productId),
  );
