// @hudsten/db — typed Supabase client + repository data-access layer.
// Apps import repositories from here and pass their own HudstenClient. A future move
// off Supabase touches only this package (PRD portability requirement).

export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums } from "./database.types";
export * from "./types";
export { createBrowserSupabaseClient } from "./supabase/client";
export type { HudstenClient } from "./supabase/client";

export { RepositoryError } from "./repositories/_shared";

// Read repositories (storefront + admin reads)
export { getSettings } from "./repositories/settings";
export { getNavigation } from "./repositories/navigation";
export {
  getActiveCategories,
  getCategoryTree,
  getCategoryBySlug,
  getCategoryBreadcrumb,
} from "./repositories/categories";
export {
  getActiveCollections,
  getCollectionBySlug,
  getProductsForCollection,
} from "./repositories/collections";
export {
  getProductCards,
  getListingCards,
  getFeaturedProducts,
  getActiveProductSlugs,
  getColorFacets,
  getProductBySlug,
  type ProductCardFilters,
} from "./repositories/products";
export { subscribeToNewsletter, type SubscribeResult } from "./repositories/newsletter";
export {
  getPublishedReviews,
  summarizeReviews,
  type Review,
  type ReviewSummary,
} from "./repositories/reviews";
