import type { HudstenClient } from "../supabase/client";
import type { Category, CategoryNode } from "../types";
import { byPosition, unwrap } from "./_shared";

const CATEGORY_COLS =
  "id, name, slug, parent_id, description, image_url, meta_title, meta_description, position, is_active, created_at, updated_at";

/** All active categories, flat, position-ordered. */
export async function getActiveCategories(
  client: HudstenClient,
): Promise<Category[]> {
  const res = await client
    .from("categories")
    .select(CATEGORY_COLS)
    .order("position", { ascending: true });
  return (unwrap(res, "getActiveCategories") ?? []) as Category[];
}

/** Active categories assembled into a parent → children tree (for nav / listings). */
export async function getCategoryTree(
  client: HudstenClient,
): Promise<CategoryNode[]> {
  const flat = await getActiveCategories(client);
  const nodes = new Map<string, CategoryNode>(
    flat.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    if (c.parent_id && nodes.has(c.parent_id)) {
      nodes.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sort = (list: CategoryNode[]) => {
    list.sort(byPosition);
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export async function getCategoryBySlug(
  client: HudstenClient,
  slug: string,
): Promise<Category | null> {
  const res = await client
    .from("categories")
    .select(CATEGORY_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return unwrap(res, `getCategoryBySlug(${slug})`) as Category | null;
}

/** Breadcrumb trail root → leaf for a category (walks parent_id in memory). */
export async function getCategoryBreadcrumb(
  client: HudstenClient,
  slug: string,
): Promise<Category[]> {
  const all = await getActiveCategories(client);
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const byId = new Map(all.map((c) => [c.id, c]));
  const trail: Category[] = [];
  let current = bySlug.get(slug) ?? null;
  // Guard against cycles with a visited set (defensive — DB has a self-parent check).
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    trail.unshift(current);
    current = current.parent_id ? (byId.get(current.parent_id) ?? null) : null;
  }
  return trail;
}
