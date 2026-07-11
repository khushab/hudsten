/**
 * View-model types returned by the repository layer. These are the shapes the apps
 * consume — deliberately decoupled from raw DB rows so components never depend on the
 * exact table structure (the portability seam).
 */
import type { Enums, Tables } from "./database.types";

export type Category = Tables<"categories">;
export type Collection = Tables<"collections">;
export type Tag = Tables<"tags">;
export type ProductRow = Tables<"products">;

/** Category with nested children (the admin tree + storefront nav). */
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/** Resolved navigation node with a ready-to-use href + nested children. */
export interface NavNode {
  id: string;
  label: string;
  link_type: Enums<"nav_link_type">;
  link_target: string | null;
  position: number;
  /** Resolved relative href, or null for a pure dropdown parent. */
  href: string | null;
  children: NavNode[];
}

export interface OptionValue {
  id: string;
  value: string;
  color_hex: string | null;
  position: number;
}

export interface ProductOption {
  id: string;
  name: string; // "Color" | "Size" | ...
  position: number;
  values: OptionValue[];
}

export interface Variant {
  id: string;
  title: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  in_stock: boolean;
  position: number;
  /** option_value_ids composing this variant (the variant ⇄ option-value join). */
  optionValueIds: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
  /** option_value_ids (Colors) this image is tagged to — the variant-image engine. */
  optionValueIds: string[];
}

/** Compact product shape for grids/cards. */
export interface ProductCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  gender: Enums<"gender_enum">;
  badges: string[];
  in_stock: boolean;
  primaryImage: { url: string; alt_text: string | null } | null;
  /** Second gallery image — cards swap to it on hover (fashion-ecom convention). */
  secondaryImage: { url: string; alt_text: string | null } | null;
  /** Color option-values (label + hex) — drives the card swatch dots + listing filters. */
  colors: { value: string; color_hex: string | null }[];
}

/** Per-product FAQ entry (admin-editable). */
export interface ProductFaq {
  question: string;
  answer: string;
}

/** Editorial image+text block rendered as an alternating section on the PDP. */
export interface ProductEditorialBlock {
  image_url: string | null;
  heading: string;
  body: string;
}

/** Full PDP payload (PRD §6). */
export interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  details: string | null;
  specifications: string | null;
  videoUrl: string | null;
  gender: Enums<"gender_enum">;
  price: number;
  compare_at_price: number | null;
  currency: string;
  in_stock: boolean;
  /** Show the "Order on WhatsApp" CTA. When false, Amazon becomes the primary CTA. */
  whatsapp_enabled: boolean;
  whatsapp_message_template: string | null;
  amazon_url: string | null;
  badges: string[];
  meta_title: string | null;
  meta_description: string | null;
  faqs: ProductFaq[];
  editorialBlocks: ProductEditorialBlock[];
  category: Pick<Category, "id" | "name" | "slug"> | null;
  options: ProductOption[];
  variants: Variant[];
  images: GalleryImage[];
  collectionIds: string[];
  tags: Tag[];
}

/** Typed JSONB sub-shapes on the settings row. */
export interface HeroSettings {
  image_url?: string;
  headline?: string;
  subtext?: string;
  cta_label?: string;
  cta_link?: string;
}
export interface SocialSettings {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  x?: string;
}
export interface PolicyBodies {
  privacy?: string;
  terms?: string;
  shipping?: string;
  returns?: string;
}

/** Settings with JSONB columns parsed into typed shapes. */
export interface SiteSettings {
  store_name: string;
  logo_url: string | null;
  /** White/light logo for dark surfaces (footer). */
  logo_url_dark: string | null;
  announcement_bar: string | null;
  whatsapp_number: string | null;
  whatsapp_default_message_template: string | null;
  /** Shipping expectation line shown near the PDP CTA (e.g. "Ships in 24–48h"). */
  delivery_note: string | null;
  hero: HeroSettings;
  featured_collection_id: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  social: SocialSettings;
  policies: PolicyBodies;
}
