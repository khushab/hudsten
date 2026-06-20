import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

// Sentinel: nav + settings live in the root layout, so revalidating it cascades to every page.
const LAYOUT = "__layout__";

/**
 * On-demand ISR revalidation, called by Supabase DB webhooks (see
 * supabase/migrations/*_revalidate_exact_paths.sql). The DB trigger resolves the affected slugs and
 * sends CONCRETE paths (e.g. /p/the-slug) — dynamic-pattern revalidation
 * (revalidatePath('/p/[slug]','page')) does NOT reliably purge prerendered pages in Next 15, so we
 * always revalidate exact paths. Secret-gated; the secret lives only server-side (this env + the trigger).
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let paths: unknown;
  try {
    ({ paths } = (await req.json()) as { paths?: unknown });
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!Array.isArray(paths) || !paths.every((p) => typeof p === "string")) {
    return NextResponse.json({ error: "no paths" }, { status: 400 });
  }

  const done: string[] = [];
  for (const path of new Set(paths as string[])) {
    if (path === LAYOUT) {
      revalidatePath("/", "layout"); // cascade to all routes under the root layout
      done.push("/ (layout)");
    } else {
      revalidatePath(path);
      done.push(path);
    }
  }

  return NextResponse.json({ revalidated: true, paths: done });
}
