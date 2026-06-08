import type { Tables, TablesInsert } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { must } from "./_util";

export type Collection = Tables<"collections">;
export type CollectionInput = Omit<TablesInsert<"collections">, "id"> & { id?: string };

const COLS =
  "id, name, slug, type, rules, description, image_url, meta_title, meta_description, position, is_active, created_at, updated_at";

export async function listCollections(): Promise<Collection[]> {
  const sb = getSupabase();
  return (must(
    await sb.from("collections").select(COLS).order("position", { ascending: true }),
    "listCollections",
  ) ?? []) as Collection[];
}

export async function upsertCollection(input: CollectionInput): Promise<string> {
  const sb = getSupabase();
  const row = must(
    await sb.from("collections").upsert(input).select("id").single(),
    "upsertCollection",
  ) as { id: string };
  return row.id;
}

export async function deleteCollection(id: string): Promise<void> {
  const sb = getSupabase();
  must(await sb.from("collections").delete().eq("id", id).select("id"), "deleteCollection");
}

export async function getCollectionProductIds(collectionId: string): Promise<string[]> {
  const sb = getSupabase();
  const rows = (must(
    await sb
      .from("product_collections")
      .select("product_id, position")
      .eq("collection_id", collectionId)
      .order("position", { ascending: true }),
    "getCollectionProductIds",
  ) ?? []) as { product_id: string }[];
  return rows.map((r) => r.product_id);
}

/** Replace the manual membership of a collection. */
export async function setManualProducts(
  collectionId: string,
  productIds: string[],
): Promise<void> {
  const sb = getSupabase();
  must(
    await sb.from("product_collections").delete().eq("collection_id", collectionId).select("product_id"),
    "clear collection products",
  );
  if (productIds.length) {
    must(
      await sb
        .from("product_collections")
        .insert(
          productIds.map((product_id, i) => ({
            collection_id: collectionId,
            product_id,
            position: i,
          })),
        )
        .select("product_id"),
      "set collection products",
    );
  }
}
