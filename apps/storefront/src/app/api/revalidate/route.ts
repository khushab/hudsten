import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getStorefrontEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * On-demand ISR revalidation, called by the ADMIN after a successful write. The admin sends its
 * Supabase session JWT (verified here — no secret in the admin bundle) plus the ENTITY-LEVEL tags
 * affected by the edit (e.g. ["product:weekender", "category-products:<id>", "home"]). We
 * revalidateTag each, which clears exactly the pages that read that entity (see lib/data.ts) — so
 * editing one product never invalidates every product.
 */

// Tags the admin may request: fixed set + entity prefixes. Anything else is ignored (anti-abuse).
const EXACT = new Set([
  "settings",
  "nav",
  "home",
  "listings",
  "collections-list",
  "categories-list",
  "products-list",
]);
const PREFIXES = [
  "product:",
  "product-reviews:",
  "category:",
  "category-products:",
  "collection:",
  "collection-products:",
];
const isAllowed = (t: string) =>
  t.length <= 200 && (EXACT.has(t) || PREFIXES.some((p) => t.startsWith(p)));

const ALLOWED_ORIGINS = new Set([
  "https://hudsten-admin.vercel.app",
  "http://localhost:5173",
]);
function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    origin && ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://hudsten-admin.vercel.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
    Vary: "Origin",
  };
}

export function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));

  const token = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  // The admin app is the only thing that authenticates (no public signup), so a valid Supabase
  // session is an admin; this endpoint only triggers cache revalidation (no data exposed).
  const { supabaseUrl, supabaseAnonKey } = getStorefrontEnv();
  const sb = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  let tags: unknown;
  try {
    ({ tags } = (await req.json()) as { tags?: unknown });
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400, headers });
  }

  const list = Array.isArray(tags)
    ? [...new Set(tags.filter((t): t is string => typeof t === "string" && isAllowed(t)))]
    : [];
  if (list.length === 0) {
    return NextResponse.json({ revalidated: false, reason: "no valid tags" }, { headers });
  }

  for (const t of list) revalidateTag(t);
  return NextResponse.json({ revalidated: true, tags: list }, { headers });
}
