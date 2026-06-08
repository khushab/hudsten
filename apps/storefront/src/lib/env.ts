/**
 * Storefront env access. Only NEXT_PUBLIC_* vars (safe for the browser). The
 * service-role key is intentionally absent — the storefront is read-only via the
 * anon key + RLS.
 */
export interface StorefrontEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
  ga4Id?: string;
  metaPixelId?: string;
}

export function getStorefrontEnv(): StorefrontEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.",
    );
  }
  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ga4Id: process.env.NEXT_PUBLIC_GA4_ID || undefined,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined,
  };
}

/** Absolute URL helper for canonical/OG/sitemap/JSON-LD. */
export function absoluteUrl(path = ""): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
