import type { Tables, TablesInsert } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { must } from "./_util";
import { revalidateStorefront } from "./revalidate";

export type Category = Tables<"categories">;
export type CategoryInput = Omit<TablesInsert<"categories">, "id"> & { id?: string };

const COLS =
  "id, name, slug, parent_id, description, image_url, meta_title, meta_description, position, is_active, created_at, updated_at";

export async function listCategories(): Promise<Category[]> {
  const sb = getSupabase();
  return (must(
    await sb.from("categories").select(COLS).order("position", { ascending: true }),
    "listCategories",
  ) ?? []) as Category[];
}

export async function upsertCategory(input: CategoryInput): Promise<string> {
  const sb = getSupabase();
  const row = must(
    await sb.from("categories").upsert(input).select("id").single(),
    "upsertCategory",
  ) as { id: string };
  revalidateStorefront([
    `category:${input.slug}`,
    `category-products:${row.id}`,
    "categories-list",
  ]);
  return row.id;
}

export async function deleteCategory(id: string): Promise<void> {
  const sb = getSupabase();
  const slug = (
    await sb.from("categories").select("slug").eq("id", id).maybeSingle()
  ).data?.slug;
  must(await sb.from("categories").delete().eq("id", id).select("id"), "deleteCategory");
  revalidateStorefront([
    ...(slug ? [`category:${slug}`] : []),
    `category-products:${id}`,
    "categories-list",
  ]);
}

/** Persist new positions / parents after a drag-reorder. */
export async function reorderCategories(
  updates: { id: string; position: number; parent_id: string | null }[],
): Promise<void> {
  const sb = getSupabase();
  for (const u of updates) {
    must(
      await sb
        .from("categories")
        .update({ position: u.position, parent_id: u.parent_id })
        .eq("id", u.id)
        .select("id"),
      "reorderCategories",
    );
  }
  revalidateStorefront(["categories-list"]);
}
