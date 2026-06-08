import type { Tables, TablesUpdate } from "@hudsten/db";
import { getSupabase } from "@/lib/supabase";
import { must } from "./_util";

export type SettingsRow = Tables<"settings">;

export async function getSettingsRow(): Promise<SettingsRow | null> {
  const sb = getSupabase();
  return must(
    await sb.from("settings").select("*").eq("id", 1).maybeSingle(),
    "getSettingsRow",
  ) as SettingsRow | null;
}

/** Single-row settings (id = 1). Upsert so it works even before the row is seeded. */
export async function updateSettings(
  patch: TablesUpdate<"settings">,
): Promise<void> {
  const sb = getSupabase();
  must(
    await sb
      .from("settings")
      .upsert({ id: 1, ...patch })
      .select("id")
      .single(),
    "updateSettings",
  );
}
