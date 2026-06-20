import type { Tables, TablesInsert } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { must } from "./_util";
import { revalidateStorefront } from "./revalidate";

export type NavRow = Tables<"navigation_menu">;
export type NavInput = Omit<TablesInsert<"navigation_menu">, "id"> & { id?: string };

const COLS =
  "id, label, link_type, link_target, parent_id, position, is_active, created_at, updated_at";

export async function listNav(): Promise<NavRow[]> {
  const sb = getSupabase();
  return (must(
    await sb.from("navigation_menu").select(COLS).order("position", { ascending: true }),
    "listNav",
  ) ?? []) as NavRow[];
}

export async function upsertNavItem(input: NavInput): Promise<string> {
  const sb = getSupabase();
  const row = must(
    await sb.from("navigation_menu").upsert(input).select("id").single(),
    "upsertNavItem",
  ) as { id: string };
  revalidateStorefront(["nav"]);
  return row.id;
}

export async function deleteNavItem(id: string): Promise<void> {
  const sb = getSupabase();
  must(await sb.from("navigation_menu").delete().eq("id", id).select("id"), "deleteNavItem");
  revalidateStorefront(["nav"]);
}

export async function reorderNav(
  updates: { id: string; position: number; parent_id: string | null }[],
): Promise<void> {
  const sb = getSupabase();
  for (const u of updates) {
    must(
      await sb
        .from("navigation_menu")
        .update({ position: u.position, parent_id: u.parent_id })
        .eq("id", u.id)
        .select("id"),
      "reorderNav",
    );
  }
  revalidateStorefront(["nav"]);
}
