import { getSupabase } from "@/lib/supabase";
import { must, slugify } from "./_util";

/** Lightweight lists for form dropdowns / pickers. */
export interface RefItem {
  id: string;
  name: string;
}

export async function listCategoryRefs(): Promise<RefItem[]> {
  const sb = getSupabase();
  const rows =
    must(await sb.from("categories").select("id, name").order("position"), "catRefs") ?? [];
  return rows as RefItem[];
}

export async function listCollectionRefs(): Promise<RefItem[]> {
  const sb = getSupabase();
  const rows =
    must(await sb.from("collections").select("id, name").order("position"), "colRefs") ?? [];
  return rows as RefItem[];
}

export async function listProductRefs(): Promise<RefItem[]> {
  const sb = getSupabase();
  const rows = must(
    await sb.from("products").select("id, name:title").order("position"),
    "prodRefs",
  ) ?? [];
  return rows as RefItem[];
}

export interface TagRef {
  id: string;
  name: string;
  slug: string;
}

export async function listTags(): Promise<TagRef[]> {
  const sb = getSupabase();
  return (must(await sb.from("tags").select("id, name, slug").order("name"), "listTags") ??
    []) as TagRef[];
}

/** Find-or-create a tag by name; returns its id. */
export async function ensureTag(name: string): Promise<string> {
  const sb = getSupabase();
  const slug = slugify(name);
  const existing = must(
    await sb.from("tags").select("id").eq("slug", slug).maybeSingle(),
    "ensureTag.find",
  ) as { id: string } | null;
  if (existing) return existing.id;
  const row = must(
    await sb.from("tags").insert({ name, slug }).select("id").single(),
    "ensureTag.create",
  ) as { id: string };
  return row.id;
}
