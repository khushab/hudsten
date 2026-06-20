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
 * Server-side data accessors, each wrapped in `unstable_cache` with ENTITY-LEVEL tags so Next owns
 * the cache entry and on-demand revalidation is granular: editing one product only invalidates that
 * product's tags — not every product. The admin's /api/revalidate call (after a save) fires the
 * matching `revalidateTag`s. `revalidate` is a time-based backstop.
 *
 * Tag scheme:
 *   product:<slug>              one PDP
 *   product-reviews:<id>        one product's reviews
 *   category:<slug>             one category page (name/desc + breadcrumb)
 *   category-products:<id>      the product cards/facets of one category (+ its related products)
 *   collection:<slug>          one collection page (name/desc)
 *   collection-products:<id>    the product cards/facets of one collection
 *   collections-list            the set of collections (home tiles + /collections index)
 *   categories-list             the set of categories (nav, etc.)
 *   products-list               the product roster (sitemap)
 *   home                        home-only product reads (featured fallback)
 *   settings | nav              global chrome (read in the layout → cascade to all pages)
 *
 * Components NEVER call Supabase directly — they call these. This is the portability seam.
 */

const REVALIDATE = 3600;

function tagged<R>(
  keyParts: string[],
  tags: string[],
  fn: () => Promise<R>,
): Promise<R> {
  return unstable_cache(fn, keyParts, { tags, revalidate: REVALIDATE })();
}

export const fetchSettings = () =>
  tagged(["settings"], ["settings"], () => getSettings(createPublicClient()));
export const fetchNavigation = () =>
  tagged(["navigation"], ["nav"], () => getNavigation(createPublicClient()));
export const fetchCategoryTree = () =>
  tagged(["category-tree"], ["categories-list"], () =>
    getCategoryTree(createPublicClient()),
  );
export const fetchActiveCategories = () =>
  tagged(["active-categories"], ["categories-list"], () =>
    getActiveCategories(createPublicClient()),
  );
export const fetchActiveProductSlugs = () =>
  tagged(["active-product-slugs"], ["products-list"], () =>
    getActiveProductSlugs(createPublicClient()),
  );
export const fetchActiveCollections = () =>
  tagged(["active-collections"], ["collections-list"], () =>
    getActiveCollections(createPublicClient()),
  );

export const fetchFeaturedProducts = (limit?: number) =>
  tagged(["featured-products", String(limit ?? "")], ["home"], () =>
    getFeaturedProducts(createPublicClient(), limit),
  );

export const fetchCategoryBySlug = (slug: string) =>
  tagged(["category-by-slug", slug], [`category:${slug}`], () =>
    getCategoryBySlug(createPublicClient(), slug),
  );
export const fetchCategoryBreadcrumb = (slug: string) =>
  tagged(["category-breadcrumb", slug], [`category:${slug}`], () =>
    getCategoryBreadcrumb(createPublicClient(), slug),
  );
export const fetchCollectionBySlug = (slug: string) =>
  tagged(["collection-by-slug", slug], [`collection:${slug}`], () =>
    getCollectionBySlug(createPublicClient(), slug),
  );

export const fetchProductCards = (filters?: ProductCardFilters) =>
  tagged(
    ["product-cards", JSON.stringify(filters ?? {})],
    [filters?.categoryId ? `category-products:${filters.categoryId}` : "listings"],
    () => getProductCards(createPublicClient(), filters),
  );
export const fetchListingCards = (filters?: ProductCardFilters) =>
  tagged(
    ["listing-cards", JSON.stringify(filters ?? {})],
    [filters?.categoryId ? `category-products:${filters.categoryId}` : "listings"],
    () => getListingCards(createPublicClient(), filters),
  );
export const fetchProductsForCollection = (
  collection: Parameters<typeof getProductsForCollection>[1],
) =>
  tagged(
    ["products-for-collection", collection.id],
    [`collection-products:${collection.id}`],
    () => getProductsForCollection(createPublicClient(), collection),
  );
/** `tag` lets the caller scope facets to a collection (the opts only carry product ids). */
export const fetchColorFacets = (
  opts?: Parameters<typeof getColorFacets>[1],
  tag?: string,
) =>
  tagged(
    ["color-facets", JSON.stringify(opts ?? {})],
    [tag ?? (opts?.categoryId ? `category-products:${opts.categoryId}` : "listings")],
    () => getColorFacets(createPublicClient(), opts),
  );

export const fetchProductBySlug = (slug: string) =>
  tagged(["product-by-slug", slug], [`product:${slug}`], () =>
    getProductBySlug(createPublicClient(), slug),
  );
/** Related products — same category, excluding the current product. */
export const fetchProductsForCrossSell = (
  categoryId: string,
  excludeId: string,
  limit = 4,
) =>
  tagged(
    ["cross-sell", categoryId, excludeId, String(limit)],
    [`category-products:${categoryId}`],
    () => getProductCards(createPublicClient(), { categoryId, excludeId, limit }),
  );
export const fetchPublishedReviews = (productId: string) =>
  tagged(["published-reviews", productId], [`product-reviews:${productId}`], () =>
    getPublishedReviews(createPublicClient(), productId),
  );
