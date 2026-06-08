import type { SpecSchema } from "@hudsten/shared";
import type { Enums } from "../database.types";
import type { HudstenClient } from "../supabase/client";
import type {
  GalleryImage,
  ProductCard,
  ProductDetail,
  ProductOption,
  Tag,
  Variant,
} from "../types";
import { RepositoryError, byPosition } from "./_shared";

type Gender = Enums<"gender_enum">;

// ── Filters for product grids (category/collection listing, home, cross-sell) ──
export interface ProductCardFilters {
  categoryId?: string;
  /** Restrict to this set of product ids (e.g. manual collection membership). */
  ids?: string[];
  /** Gender filter; a specific gender always also includes 'unisex' (merchandising). */
  genders?: Gender[];
  priceMin?: number;
  priceMax?: number;
  /** Color option-value labels (e.g. ["Black","Tan"]) — resolved to product ids first. */
  colorValues?: string[];
  excludeId?: string;
  limit?: number;
}

/** A specific gender selection also surfaces unisex products. */
function expandGenders(genders?: Gender[]): Gender[] | null {
  if (!genders || genders.length === 0) return null;
  return Array.from(new Set<Gender>([...genders, "unisex"]));
}

const CARD_SELECT =
  "id, title, slug, price, compare_at_price, currency, gender, badges, in_stock, position, images:product_images(url, alt_text, position)";

interface RawCard {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  gender: Gender;
  badges: string[];
  in_stock: boolean;
  position: number;
  images: { url: string; alt_text: string | null; position: number }[];
}

function toCard(r: RawCard): ProductCard {
  const primary = [...(r.images ?? [])].sort(byPosition)[0] ?? null;
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    price: r.price,
    compare_at_price: r.compare_at_price,
    currency: r.currency,
    gender: r.gender,
    badges: r.badges ?? [],
    in_stock: r.in_stock,
    primaryImage: primary
      ? { url: primary.url, alt_text: primary.alt_text }
      : null,
  };
}

/** Resolve product ids that have a Color option-value in the given set. */
async function productIdsWithColors(
  client: HudstenClient,
  colorValues: string[],
): Promise<string[]> {
  const res = await client
    .from("product_option_values")
    .select("value, option:product_options!inner(product_id, name)")
    .eq("option.name", "Color")
    .in("value", colorValues);
  if (res.error)
    throw new RepositoryError(`productIdsWithColors: ${res.error.message}`, res.error);
  const rows = (res.data ?? []) as unknown as {
    option: { product_id: string } | null;
  }[];
  return Array.from(
    new Set(rows.map((r) => r.option?.product_id).filter(Boolean) as string[]),
  );
}

/**
 * Product cards for grids. RLS restricts to active products. Filters compose;
 * color is resolved to a product-id set first (avoids fragile nested filters).
 */
export async function getProductCards(
  client: HudstenClient,
  filters: ProductCardFilters = {},
): Promise<ProductCard[]> {
  let restrictIds = filters.ids;

  if (filters.colorValues && filters.colorValues.length > 0) {
    const colorIds = await productIdsWithColors(client, filters.colorValues);
    restrictIds = restrictIds
      ? restrictIds.filter((id) => colorIds.includes(id))
      : colorIds;
    if (restrictIds.length === 0) return [];
  }

  let q = client.from("products").select(CARD_SELECT).eq("status", "active");

  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (restrictIds) q = q.in("id", restrictIds);
  const genders = expandGenders(filters.genders);
  if (genders) q = q.in("gender", genders);
  if (filters.priceMin != null) q = q.gte("price", filters.priceMin);
  if (filters.priceMax != null) q = q.lte("price", filters.priceMax);
  if (filters.excludeId) q = q.neq("id", filters.excludeId);

  q = q.order("position", { ascending: true });
  if (filters.limit) q = q.limit(filters.limit);

  const res = await q;
  if (res.error)
    throw new RepositoryError(`getProductCards: ${res.error.message}`, res.error);
  return ((res.data ?? []) as unknown as RawCard[]).map(toCard);
}

export async function getFeaturedProducts(
  client: HudstenClient,
  limit = 8,
): Promise<ProductCard[]> {
  const res = await client
    .from("products")
    .select(CARD_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("position", { ascending: true })
    .limit(limit);
  if (res.error)
    throw new RepositoryError(`getFeaturedProducts: ${res.error.message}`, res.error);
  return ((res.data ?? []) as unknown as RawCard[]).map(toCard);
}

/** Slugs of all active products — for sitemap + static params. */
export async function getActiveProductSlugs(
  client: HudstenClient,
): Promise<{ slug: string; updated_at: string }[]> {
  const res = await client
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");
  if (res.error)
    throw new RepositoryError(`getActiveProductSlugs: ${res.error.message}`, res.error);
  return (res.data ?? []) as { slug: string; updated_at: string }[];
}

/** Distinct Color facets (value + hex) for active products in scope — powers filter chips. */
export async function getColorFacets(
  client: HudstenClient,
  opts: { categoryId?: string; ids?: string[] } = {},
): Promise<{ value: string; color_hex: string | null }[]> {
  let q = client
    .from("product_option_values")
    .select(
      "value, color_hex, option:product_options!inner(name, product:products!inner(id, status, category_id))",
    )
    .eq("option.name", "Color")
    .eq("option.product.status", "active");
  if (opts.categoryId) q = q.eq("option.product.category_id", opts.categoryId);
  if (opts.ids && opts.ids.length) q = q.in("option.product.id", opts.ids);

  const res = await q;
  if (res.error)
    throw new RepositoryError(`getColorFacets: ${res.error.message}`, res.error);
  const rows = (res.data ?? []) as unknown as {
    value: string;
    color_hex: string | null;
  }[];
  // Dedupe by value, keep first hex seen.
  const map = new Map<string, string | null>();
  for (const r of rows) if (!map.has(r.value)) map.set(r.value, r.color_hex);
  return Array.from(map, ([value, color_hex]) => ({ value, color_hex }));
}

// ── Full PDP detail ───────────────────────────────────────────────────────────
const DETAIL_SELECT = `
  id, title, slug, description, gender, price, compare_at_price, currency, in_stock,
  specs, whatsapp_message_template, amazon_url, badges, meta_title, meta_description,
  product_type:product_types(name, spec_schema),
  category:categories(id, name, slug),
  options:product_options(id, name, position, values:product_option_values(id, value, color_hex, position)),
  variants:product_variants(id, title, sku, price, compare_at_price, in_stock, position, variant_option_values(option_value_id)),
  images:product_images(id, url, alt_text, position, image_option_values(option_value_id)),
  product_collections(collection_id),
  product_tags(tag:tags(id, name, slug, created_at))
`;

interface RawDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  gender: Gender;
  price: number;
  compare_at_price: number | null;
  currency: string;
  in_stock: boolean;
  specs: Record<string, unknown> | null;
  whatsapp_message_template: string | null;
  amazon_url: string | null;
  badges: string[];
  meta_title: string | null;
  meta_description: string | null;
  product_type: { name: string; spec_schema: unknown } | null;
  category: { id: string; name: string; slug: string } | null;
  options: {
    id: string;
    name: string;
    position: number;
    values: {
      id: string;
      value: string;
      color_hex: string | null;
      position: number;
    }[];
  }[];
  variants: {
    id: string;
    title: string;
    sku: string | null;
    price: number | null;
    compare_at_price: number | null;
    in_stock: boolean;
    position: number;
    variant_option_values: { option_value_id: string }[];
  }[];
  images: {
    id: string;
    url: string;
    alt_text: string | null;
    position: number;
    image_option_values: { option_value_id: string }[];
  }[];
  product_collections: { collection_id: string }[];
  product_tags: { tag: Tag | null }[];
}

export async function getProductBySlug(
  client: HudstenClient,
  slug: string,
): Promise<ProductDetail | null> {
  const res = await client
    .from("products")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (res.error)
    throw new RepositoryError(`getProductBySlug(${slug}): ${res.error.message}`, res.error);
  if (!res.data) return null;
  const r = res.data as unknown as RawDetail;

  const options: ProductOption[] = [...(r.options ?? [])]
    .sort(byPosition)
    .map((o) => ({
      id: o.id,
      name: o.name,
      position: o.position,
      values: [...(o.values ?? [])].sort(byPosition),
    }));

  const variants: Variant[] = [...(r.variants ?? [])]
    .sort(byPosition)
    .map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      compare_at_price: v.compare_at_price,
      in_stock: v.in_stock,
      position: v.position,
      optionValueIds: (v.variant_option_values ?? []).map(
        (x) => x.option_value_id,
      ),
    }));

  const images: GalleryImage[] = [...(r.images ?? [])]
    .sort(byPosition)
    .map((img) => ({
      id: img.id,
      url: img.url,
      alt_text: img.alt_text,
      position: img.position,
      optionValueIds: (img.image_option_values ?? []).map(
        (x) => x.option_value_id,
      ),
    }));

  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    gender: r.gender,
    price: r.price,
    compare_at_price: r.compare_at_price,
    currency: r.currency,
    in_stock: r.in_stock,
    specs: (r.specs ?? {}) as Record<string, unknown>,
    whatsapp_message_template: r.whatsapp_message_template,
    amazon_url: r.amazon_url,
    badges: r.badges ?? [],
    meta_title: r.meta_title,
    meta_description: r.meta_description,
    specSchema: (r.product_type?.spec_schema ?? []) as SpecSchema,
    productTypeName: r.product_type?.name ?? "",
    category: r.category,
    options,
    variants,
    images,
    collectionIds: (r.product_collections ?? []).map((c) => c.collection_id),
    tags: (r.product_tags ?? [])
      .map((t) => t.tag)
      .filter((t): t is Tag => Boolean(t)),
  };
}
