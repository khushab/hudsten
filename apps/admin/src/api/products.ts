import type { Enums, TablesInsert, TablesUpdate } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";

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
    product_type_id: string;
    category_id: string | null;
    gender: Enums<"gender_enum">;
    price: number;
    compare_at_price: number | null;
    currency: string;
    status: Enums<"product_status">;
    in_stock: boolean;
    specs: Record<string, unknown>;
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
        `id, title, slug, description, product_type_id, category_id, gender, price, compare_at_price,
         currency, status, in_stock, specs, whatsapp_message_template, amazon_url, is_featured, badges,
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
      product_type_id: data.product_type_id,
      category_id: data.category_id,
      gender: data.gender,
      price: data.price,
      compare_at_price: data.compare_at_price,
      currency: data.currency,
      status: data.status,
      in_stock: data.in_stock,
      specs: (data.specs ?? {}) as Record<string, unknown>,
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
  product_type_id: string;
  category_id: string | null;
  gender: Enums<"gender_enum">;
  price: number;
  compare_at_price: number | null;
  currency: string;
  status: Enums<"product_status">;
  in_stock: boolean;
  specs: Record<string, unknown> | null;
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
 * Create/update a product and REPLACE its entire option/variant/image graph.
 * Replace-all (delete then re-insert) keeps the save logic simple and correct given the
 * form holds the complete desired state. Sequence of statements, not a transaction —
 * PHASE 2: move to a Postgres RPC for atomicity.
 */
export async function saveProduct(payload: ProductEditorPayload): Promise<string> {
  const sb = getSupabase();

  // 1) Upsert core. Cast our view-model core to the generated insert/update types
  // (specs is Record<string,unknown> vs the column's Json — structurally compatible).
  const coreInsert = payload.core as unknown as TablesInsert<"products">;
  const coreUpdate = payload.core as unknown as TablesUpdate<"products">;
  let productId = payload.id;
  if (productId) {
    must(
      await sb.from("products").update(coreUpdate).eq("id", productId).select("id").single(),
      "update product",
    );
  } else {
    const row = must(
      await sb.from("products").insert(coreInsert).select("id").single(),
      "insert product",
    ) as { id: string };
    productId = row.id;
  }
  const pid = productId!;

  // 2) Clear existing graph (cascades handle children).
  await sb.from("product_options").delete().eq("product_id", pid);
  await sb.from("product_variants").delete().eq("product_id", pid);
  await sb.from("product_images").delete().eq("product_id", pid);
  await sb.from("product_collections").delete().eq("product_id", pid);
  await sb.from("product_tags").delete().eq("product_id", pid);

  // 3) Options + values → build key → new id map.
  const valueIdByKey = new Map<string, string>();
  for (const opt of payload.options) {
    const optRow = must(
      await sb
        .from("product_options")
        .insert({ product_id: pid, name: opt.name, position: opt.position })
        .select("id")
        .single(),
      "insert option",
    ) as { id: string };
    if (opt.values.length) {
      const inserted = must(
        await sb
          .from("product_option_values")
          .insert(
            opt.values.map((v) => ({
              option_id: optRow.id,
              value: v.value,
              color_hex: v.color_hex,
              position: v.position,
            })),
          )
          .select("id, value, position"),
        "insert option values",
      ) as { id: string; value: string; position: number }[];
      // Map by original key using order (value+position is stable within the option).
      opt.values.forEach((v) => {
        const match = inserted.find(
          (i) => i.value === v.value && i.position === v.position,
        );
        if (match) valueIdByKey.set(v.key, match.id);
      });
    }
  }

  // 4) Variants + composition.
  for (const variant of payload.variants) {
    const vRow = must(
      await sb
        .from("product_variants")
        .insert({
          product_id: pid,
          title: variant.title,
          sku: variant.sku,
          price: variant.price,
          compare_at_price: variant.compare_at_price,
          in_stock: variant.in_stock,
          position: variant.position,
        })
        .select("id")
        .single(),
      "insert variant",
    ) as { id: string };
    const resolved = variant.valueKeys.map((k) => valueIdByKey.get(k));
    // A stale key (option value removed/replaced without regenerating variants) must NOT
    // be silently dropped — that would persist an unreachable/partial-composition variant.
    if (resolved.some((id) => !id)) {
      throw new Error(
        `Variant "${variant.title}" references a removed option value. Click "Generate variants" after changing options, then save again.`,
      );
    }
    const links = resolved.map((option_value_id) => ({
      variant_id: vRow.id,
      option_value_id: option_value_id!,
    }));
    if (links.length) {
      must(
        await sb.from("variant_option_values").insert(links).select("variant_id"),
        "insert variant_option_values",
      );
    }
  }

  // 5) Images + color tags.
  for (const img of payload.images) {
    const iRow = must(
      await sb
        .from("product_images")
        .insert({
          product_id: pid,
          url: img.url,
          alt_text: img.alt_text,
          position: img.position,
        })
        .select("id")
        .single(),
      "insert image",
    ) as { id: string };
    const colorValueId = img.colorKey ? valueIdByKey.get(img.colorKey) : null;
    if (colorValueId) {
      must(
        await sb
          .from("image_option_values")
          .insert({ image_id: iRow.id, option_value_id: colorValueId })
          .select("image_id"),
        "insert image_option_values",
      );
    }
  }

  // 6) Collections + tags.
  if (payload.collectionIds.length) {
    must(
      await sb
        .from("product_collections")
        .insert(
          payload.collectionIds.map((collection_id, i) => ({
            product_id: pid,
            collection_id,
            position: i,
          })),
        )
        .select("product_id"),
      "insert product_collections",
    );
  }
  if (payload.tagIds.length) {
    must(
      await sb
        .from("product_tags")
        .insert(payload.tagIds.map((tag_id) => ({ product_id: pid, tag_id })))
        .select("product_id"),
      "insert product_tags",
    );
  }

  return pid;
}

export async function deleteProduct(id: string): Promise<void> {
  const sb = getSupabase();
  must(await sb.from("products").delete().eq("id", id).select("id"), "deleteProduct");
}
