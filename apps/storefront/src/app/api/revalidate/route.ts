import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

/**
 * On-demand ISR revalidation, called by Supabase DB webhooks (see
 * supabase/migrations/*_revalidate_by_tag.sql). Storefront reads are tagged `sb:<table>` in
 * lib/supabase/server.ts; the webhook sends the changed table and we revalidateTag('sb:<table>'),
 * which clears every page that read that table (tags are reliably invalidated; revalidatePath is
 * not, for supabase-js fetches). Cross-table deps resolve automatically because each page is
 * tagged by every table it reads (e.g. a product change clears the PDP, all listings, home, sitemap).
 * Secret-gated; the secret lives only server-side (this env + the DB trigger).
 */
const TRACKED = new Set([
  "products",
  "product_collections",
  "collections",
  "categories",
  "settings",
  "navigation_menu",
]);

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let table: unknown;
  try {
    ({ table } = (await req.json()) as { table?: unknown });
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof table !== "string" || !TRACKED.has(table)) {
    return NextResponse.json({ revalidated: false, reason: `untracked: ${String(table)}` });
  }

  const tag = `sb:${table}`;
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
