import { createClient } from "@supabase/supabase-js";
import type { Database, HudstenClient } from "@hudsten/db";
import { getStorefrontEnv } from "@/lib/env";

type NextRequestInit = RequestInit & {
  next?: { tags?: string[]; revalidate?: number | false };
};

/**
 * Tag every storefront REST read by its base table (e.g. `sb:products`). supabase-js fetches land
 * in Next's Data Cache, and on-demand invalidation only works reliably via EXPLICIT tags —
 * revalidatePath does NOT clear untagged supabase fetches, so a changed product would stay stale
 * until the cache TTL. The /api/revalidate webhook calls revalidateTag('sb:<table>') to clear them.
 */
function taggedFetch(
  input: RequestInfo | URL,
  init?: NextRequestInit,
): Promise<Response> {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const table = url.match(/\/rest\/v1\/([a-z_]+)/i)?.[1];
  // Only tag cacheable reads (GET selects); leave writes/storage/auth untouched.
  if (table && (init?.method ?? "GET").toUpperCase() === "GET") {
    return fetch(input, { ...init, next: { tags: [`sb:${table}`, "sb:all"] } });
  }
  return fetch(input, init);
}

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
    global: { fetch: taggedFetch },
  });
}
