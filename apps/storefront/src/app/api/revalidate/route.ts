import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

/**
 * On-demand ISR revalidation, called by Supabase Database Webhooks when catalog/content rows
 * change (see supabase/migrations/*_revalidation_webhooks.sql). Path-based + coarse: a table
 * change marks the affected route patterns stale and Next regenerates each lazily on next visit.
 *
 * Gated by a shared secret that lives only server-side (this env + the DB trigger). The admin
 * SPA is never in the loop, so no secret reaches the browser.
 */

// Sentinel: nav + settings render in the root layout, so revalidating it cascades to every page.
const LAYOUT = "__layout__";

// Webhook table → route patterns to invalidate. '[slug]' patterns invalidate every instance.
const TABLE_PATHS: Record<string, string[]> = {
  products: ["/p/[slug]", "/c/[slug]", "/collections/[slug]", "/collections", "/", "/sitemap.xml"],
  product_variants: ["/p/[slug]", "/c/[slug]", "/collections/[slug]", "/"], // price/stock on cards
  product_images: ["/p/[slug]", "/c/[slug]", "/collections/[slug]", "/"],
  product_collections: ["/collections/[slug]", "/collections", "/", "/sitemap.xml"], // membership
  collections: ["/collections/[slug]", "/collections", "/", "/sitemap.xml"],
  categories: ["/c/[slug]", "/p/[slug]", "/sitemap.xml"], // category pages + PDP breadcrumb/related
  navigation_menu: [LAYOUT],
  settings: [LAYOUT],
};

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { table?: string; type?: string };
  try {
    body = (await req.json()) as { table?: string; type?: string };
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const paths = TABLE_PATHS[body.table ?? ""];
  if (!paths) {
    return NextResponse.json({ revalidated: false, reason: `untracked table: ${body.table}` });
  }

  const done: string[] = [];
  for (const path of paths) {
    if (path === LAYOUT) {
      revalidatePath("/", "layout"); // cascades to all routes under the root layout
      done.push("/ (layout)");
    } else if (path.includes("[")) {
      revalidatePath(path, "page"); // dynamic segment → all instances
      done.push(path);
    } else {
      revalidatePath(path);
      done.push(path);
    }
  }

  return NextResponse.json({ revalidated: true, table: body.table, type: body.type, paths: done });
}
