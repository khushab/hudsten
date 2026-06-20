import { createClient } from "@supabase/supabase-js";
import type { Database, HudstenClient } from "@hudsten/db";
import { getStorefrontEnv } from "@/lib/env";

/**
 * Public, anon Supabase client for storefront Server Components.
 *
 * Deliberately session-less (persistSession: false): the storefront only reads
 * public/active rows via RLS, and a stateless client keeps catalog pages cacheable
 * for SSG/ISR (no per-request cookies → no forced dynamic rendering). Auth/cookies
 * are not needed here; the admin app handles authenticated access.
 *
 * Caching/revalidation is handled in lib/data.ts via `unstable_cache` (tags) — NOT by tagging
 * this client's fetch, because supabase-js bypasses Next's patched fetch (supabase-js#917).
 */
export function createPublicClient(): HudstenClient {
  const { supabaseUrl, supabaseAnonKey } = getStorefrontEnv();
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
