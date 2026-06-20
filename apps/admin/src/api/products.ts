import type { Enums, Json } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { removeProductImages } from "./storage";
import { revalidateStorefront } from "./revalidate";

/** Throw on a Supabase error; return data otherwise. */
function must<T>(res: { data: T; error: { message: string } | null }, ctx: string): T {
  if (res.error) throw new Error(`${ctx}: ${res.error.message}`);
  return res.data;
}

// ── Editor payload (form → DB) ────────────────────────────────────────────────
// `key` fields are opaque client ids used to wire relationships within the payload;
// on save the whole option/variant/image graph is replaced and keys are remapped to
// fresh DB ids. (Non-atomic across statements — PHASE 2: wrap in a Postgres RPC.)
export interface EditorOptionValue {
  key: string;
  value: string;
  color_hex: string | null;
  position: number;
}
export interface EditorOption {
  name: string;
  position: number;
  values: EditorOptionValue[];
}
export interface EditorVariant {
  title: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  in_stock: boolean;
  position: number;
  valueKeys: string[];
}
export interface EditorImage {
  url: string;
  alt_text: string | null;
  position: number;
  colorKey: string | null; // which Color option-value this image is tagged to
}
export interface ProductEditorPayload {
  id?: string;
  core: {
    title: string;
    slug: string;
    description: string | null;
    details: string | null;
    specifications: string | null;
    category_id: string | null;
    gender: Enums<"gender_enum">;
    price: number;
    compare_at_price: number | null;
    currency: string;
    status: Enums<"product_status">;
    in_stock: boolean;
    video_url: string | null;
    faqs: { question: string; answer: string }[];
    editorial_blocks: { image_url: string | null; heading: string; body: string }[];
    whatsapp_message_template: string | null;
    amazon_url: string | null;
    is_featured: boolean;
    badges: string[];
    meta_title: string | null;
    meta_description: string | null;
  };
  options: EditorOption[];
  variants: EditorVariant[];
  images: EditorImage[];
  collectionIds: string[];
  tagIds: string[];
}

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  status: Enums<"product_status">;
  price: number;
  is_featured: boolean;
  in_stock: boolean;
  category: string | null;
  image: string | null;
}

export async function listProducts(search?: string): Promise<ProductListItem[]> {
  const sb = getSupabase();
  let q = sb
    .from("products")
    .select(
      "id, title, slug, status, price, is_featured, in_stock, category:categories(name), images:product_images(url, position)",
    )
    .order("position", { ascending: true });
  if (search) q = q.ilike("title", `%${search}%`);
  const rows = must(await q, "listProducts") ?? [];
  return (rows as unknown as RawListRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    status: r.status,
    price: r.price,
    is_featured: r.is_featured,
    in_stock: r.in_stock,
    category: r.category?.name ?? null,
    image: [...(r.images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null,
  }));
}
interface RawListRow {
  id: string;
  title: string;
  slug: string;
  status: Enums<"product_status">;
  price: number;
  is_featured: boolean;
  in_stock: boolean;
  category: { name: string } | null;
  images: { url: string; position: number }[];
}

/** Load the full editable graph (any status). Keys = existing DB ids. */
export async function getProductForEdit(
  id: string,
): Promise<ProductEditorPayload> {
  const sb = getSupabase();
  const data = must(
    await sb
      .from("products")
      .select(
        `id, title, slug, description, details, specifications, video_url, faqs, editorial_blocks,
         category_id, gender, price, compare_at_price,
         currency, status, in_stock, whatsapp_message_template, amazon_url, is_featured, badges,
         meta_title, meta_description,
         options:product_options(id, name, position, values:product_option_values(id, value, color_hex, position)),
         variants:product_variants(id, title, sku, price, compare_at_price, in_stock, position, variant_option_values(option_value_id)),
         images:product_images(id, url, alt_text, position, image_option_values(option_value_id)),
         product_collections(collection_id),
         product_tags(tag_id)`,
      )
      .eq("id", id)
      .single(),
    "getProductForEdit",
  ) as unknown as RawEditRow;

  return {
    id: data.id,
    core: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      details: data.details,
      specifications: data.specifications,
      category_id: data.category_id,
      gender: data.gender,
      price: data.price,
      compare_at_price: data.compare_at_price,
      currency: data.currency,
      status: data.status,
      in_stock: data.in_stock,
      video_url: data.video_url,
      faqs: Array.isArray(data.faqs)
        ? (data.faqs as { question: string; answer: string }[])
        : [],
      editorial_blocks: Array.isArray(data.editorial_blocks)
        ? (data.editorial_blocks as { image_url: string | null; heading: string; body: string }[])
        : [],
      whatsapp_message_template: data.whatsapp_message_template,
      amazon_url: data.amazon_url,
      is_featured: data.is_featured,
      badges: data.badges ?? [],
      meta_title: data.meta_title,
      meta_description: data.meta_description,
    },
    options: [...(data.options ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((o) => ({
        name: o.name,
        position: o.position,
        values: [...(o.values ?? [])]
          .sort((a, b) => a.position - b.position)
          .map((v) => ({
            key: v.id,
            value: v.value,
            color_hex: v.color_hex,
            position: v.position,
          })),
      })),
    variants: [...(data.variants ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        title: v.title,
        sku: v.sku,
        price: v.price,
        compare_at_price: v.compare_at_price,
        in_stock: v.in_stock,
        position: v.position,
        valueKeys: (v.variant_option_values ?? []).map((x) => x.option_value_id),
      })),
    images: [...(data.images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        url: img.url,
        alt_text: img.alt_text,
        position: img.position,
        colorKey: img.image_option_values?.[0]?.option_value_id ?? null,
      })),
    collectionIds: (data.product_collections ?? []).map((c) => c.collection_id),
    tagIds: (data.product_tags ?? []).map((t) => t.tag_id),
  };
}
interface RawEditRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  details: string | null;
  specifications: string | null;
  video_url: string | null;
  faqs: unknown;
  editorial_blocks: unknown;
  category_id: string | null;
  gender: Enums<"gender_enum">;
  price: number;
  compare_at_price: number | null;
  currency: string;
  status: Enums<"product_status">;
  in_stock: boolean;
  whatsapp_message_template: string | null;
  amazon_url: string | null;
  is_featured: boolean;
  badges: string[];
  meta_title: string | null;
  meta_description: string | null;
  options: {
    id: string;
    name: string;
    position: number;
    values: { id: string; value: string; color_hex: string | null; position: number }[];
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
  product_tags: { tag_id: string }[];
}

/**
 * Current image URLs of a product (for storage cleanup diffs) — covers BOTH the
 * product_images gallery AND editorial-block images (stored in the products JSON),
 * so neither source leaks orphaned files in Storage.
 */
async function getImageUrls(productId: string): Promise<string[]> {
  const sb = getSupabase();
  const [imgs, prod] = await Promise.all([
    sb.from("product_images").select("url").eq("product_id", productId),
    sb.from("products").select("editorial_blocks").eq("id", productId).maybeSingle(),
  ]);
  const urls = (must(imgs, "getImageUrls") as { url: string }[]).map((r) => r.url);
  const blocks = prod.data?.editorial_blocks;
  if (Array.isArray(blocks)) {
    for (const b of blocks as { image_url?: string | null }[]) {
      if (b?.image_url) urls.push(b.image_url);
    }
  }
  return urls;
}

/**
 * Create/update a product and REPLACE its entire option/variant/image graph —
 * atomically, via the `admin_save_product` Postgres RPC (one transaction: a mid-save
 * failure rolls everything back instead of leaving partial state). RLS still applies
 * (the function is SECURITY INVOKER).
 *
 * After a successful save, storage files for images that were removed from the
 * product are deleted best-effort (never fails the save).
 */
/** Entity tags a product edit affects: its PDP + its category & collection listings + home. */
function productTags(
  slug: string,
  categoryId: string | null,
  collectionIds: string[],
): string[] {
  return [
    `product:${slug}`,
    ...(categoryId ? [`category-products:${categoryId}`] : []),
    ...collectionIds.map((id) => `collection-products:${id}`),
    "home",
  ];
}

export async function saveProduct(payload: ProductEditorPayload): Promise<string> {
  const sb = getSupabase();

  const previousUrls = payload.id ? await getImageUrls(payload.id) : [];

  const pid = must(
    await sb.rpc("admin_save_product", {
      payload: payload as unknown as Json,
    }),
    "saveProduct",
  ) as string;

  const kept = new Set([
    ...payload.images.map((i) => i.url),
    ...payload.core.editorial_blocks
      .map((b) => b.image_url)
      .filter((u): u is string => !!u),
  ]);
  await removeProductImages(previousUrls.filter((u) => !kept.has(u)));

  revalidateStorefront(
    productTags(payload.core.slug, payload.core.category_id, payload.collectionIds),
  );
  return pid;
}

export async function deleteProduct(id: string): Promise<void> {
  const sb = getSupabase();
  // Snapshot identity (for revalidation) + file URLs before the row cascade-deletes them.
  const meta = (
    await sb
      .from("products")
      .select("slug, category_id, product_collections(collection_id)")
      .eq("id", id)
      .maybeSingle()
  ).data;
  const urls = await getImageUrls(id);
  must(await sb.from("products").delete().eq("id", id).select("id"), "deleteProduct");
  await removeProductImages(urls);
  if (meta) {
    revalidateStorefront(
      productTags(
        meta.slug,
        meta.category_id,
        (meta.product_collections ?? []).map((c) => c.collection_id),
      ),
    );
  }
}
