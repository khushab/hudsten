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
 */
export function createPublicClient(): HudstenClient {
  const { supabaseUrl, supabaseAnonKey } = getStorefrontEnv();
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
