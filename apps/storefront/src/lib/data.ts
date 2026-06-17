import { cache } from "react";
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
 * Server-side data accessors. Each wraps a repository with the public (anon) client.
 * Wrapped in React `cache()` so multiple components in one render (e.g. layout + page
 * both needing settings/nav) share a single query. Catalog pages set `revalidate` for ISR.
 *
 * Components NEVER call Supabase directly — they call these. This is the portability seam.
 */

export const fetchSettings = cache(() => getSettings(createPublicClient()));
export const fetchNavigation = cache(() => getNavigation(createPublicClient()));
export const fetchCategoryTree = cache(() => getCategoryTree(createPublicClient()));
export const fetchActiveCategories = cache(() =>
  getActiveCategories(createPublicClient()),
);
export const fetchActiveProductSlugs = cache(() =>
  getActiveProductSlugs(createPublicClient()),
);
export const fetchActiveCollections = cache(() =>
  getActiveCollections(createPublicClient()),
);

export const fetchFeaturedProducts = cache((limit?: number) =>
  getFeaturedProducts(createPublicClient(), limit),
);

export const fetchCategoryBySlug = cache((slug: string) =>
  getCategoryBySlug(createPublicClient(), slug),
);
export const fetchCategoryBreadcrumb = cache((slug: string) =>
  getCategoryBreadcrumb(createPublicClient(), slug),
);
export const fetchCollectionBySlug = cache((slug: string) =>
  getCollectionBySlug(createPublicClient(), slug),
);

export const fetchProductCards = cache((filters?: ProductCardFilters) =>
  getProductCards(createPublicClient(), filters),
);
export const fetchListingCards = cache((filters?: ProductCardFilters) =>
  getListingCards(createPublicClient(), filters),
);
export const fetchProductsForCollection = cache(
  (collection: Parameters<typeof getProductsForCollection>[1]) =>
    getProductsForCollection(createPublicClient(), collection),
);
export const fetchColorFacets = cache(
  (opts?: Parameters<typeof getColorFacets>[1]) =>
    getColorFacets(createPublicClient(), opts),
);

export const fetchProductBySlug = cache((slug: string) =>
  getProductBySlug(createPublicClient(), slug),
);
/** Related products — same category, excluding the current product. */
export const fetchProductsForCrossSell = cache(
  (categoryId: string, excludeId: string, limit = 4) =>
    getProductCards(createPublicClient(), { categoryId, excludeId, limit }),
);
export const fetchPublishedReviews = cache((productId: string) =>
  getPublishedReviews(createPublicClient(), productId),
);
