import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

/**
 * The one typed Supabase client type used everywhere. Repository functions accept
 * a `HudstenClient` so they're agnostic to HOW it was created — the admin SPA builds
 * a browser client (below), the storefront builds server/browser clients via
 * @supabase/ssr (app-level, since those need next/headers). All are SupabaseClient<Database>.
 *
 * This indirection is the portability seam (PRD coding standards): a future move off
 * Supabase only touches this package, not the apps.
 */
export type HudstenClient = SupabaseClient<Database>;

/**
 * Browser client for the admin SPA (and storefront client components). Persists the
 * session so an authenticated admin's JWT rides along — RLS authorizes from there.
 * NEVER pass a service-role key here.
 */
export function createBrowserSupabaseClient(
  url: string,
  anonKey: string,
): HudstenClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase URL and anon key are required to create the client.",
    );
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
