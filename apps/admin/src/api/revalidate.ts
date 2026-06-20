import { getSupabase } from "@/lib/supabase";

const STOREFRONT_URL = (
  (import.meta.env.VITE_STOREFRONT_URL as string | undefined) ??
  "https://www.hudsten.in"
).replace(/\/$/, "");

/**
 * After a successful admin write, tell the storefront to revalidate the affected ENTITY tags (e.g.
 * `product:<slug>`, `category-products:<id>`, `home`) so only the impacted pages refresh — not every
 * product. The storefront verifies the admin's Supabase JWT (no secret in this bundle). Best-effort
 * + fire-and-forget: a failure here must never break the save — the hourly ISR backstop covers it.
 */
export function revalidateStorefront(tags: string[]): void {
  if (tags.length === 0) return;
  void (async () => {
    try {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch(`${STOREFRONT_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tags }),
        keepalive: true,
      });
    } catch {
      // best-effort; the hourly ISR backstop covers a missed revalidation
    }
  })();
}
