import type { HudstenClient } from "../supabase/client";
import type {
  HeroSettings,
  PolicyBodies,
  SiteSettings,
  SocialSettings,
} from "../types";
import { unwrap } from "./_shared";

/**
 * Settings is a single row (id = 1). Returns null if not seeded yet so the UI can
 * fall back to sane defaults rather than crash.
 */
export async function getSettings(
  client: HudstenClient,
): Promise<SiteSettings | null> {
  const res = await client
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  const row = unwrap(res, "getSettings");
  if (!row) return null;

  return {
    store_name: row.store_name,
    logo_url: row.logo_url,
    announcement_bar: row.announcement_bar,
    whatsapp_number: row.whatsapp_number,
    whatsapp_default_message_template: row.whatsapp_default_message_template,
    hero: (row.hero ?? {}) as HeroSettings,
    featured_collection_id: row.featured_collection_id,
    contact_email: row.contact_email,
    phone: row.phone,
    address: row.address,
    gst_number: row.gst_number,
    social: (row.social ?? {}) as SocialSettings,
    policies: (row.policies ?? {}) as PolicyBodies,
  };
}
