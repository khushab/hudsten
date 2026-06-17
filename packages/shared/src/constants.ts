/**
 * Domain-wide constants shared by storefront + admin.
 * These mirror the Postgres enums/columns defined in supabase/migrations.
 * Keeping them here (not duplicated per app) is the whole point of the shared package.
 */

// --- Enums (mirror DB enums exactly) ---
export const GENDERS = ["men", "women", "unisex"] as const;
export type Gender = (typeof GENDERS)[number];

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const COLLECTION_TYPES = ["manual", "smart"] as const;
export type CollectionType = (typeof COLLECTION_TYPES)[number];

export const NAV_LINK_TYPES = [
  "category",
  "collection",
  "url",
  "dropdown_parent",
] as const;
export type NavLinkType = (typeof NAV_LINK_TYPES)[number];

export const USER_ROLES = ["admin", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// --- Badges (free-text in DB, but these are the canonical suggestions) ---
export const SUGGESTED_BADGES = [
  "New",
  "Bestseller",
  "Limited",
  "Handcrafted",
] as const;

// --- Commerce defaults ---
export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// --- URL path prefixes (LOCKED per PRD §5 — changing later = redirect hell) ---
export const ROUTES = {
  category: "/c",
  product: "/p",
  collection: "/collections",
} as const;

// --- Storage ---
export const PRODUCT_IMAGE_BUCKET = "product-images";
