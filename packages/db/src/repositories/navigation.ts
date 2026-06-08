import type { HudstenClient } from "../supabase/client";
import type { NavNode } from "../types";
import { byPosition, resolveNavHref, unwrap } from "./_shared";

/**
 * Build the data-driven navbar tree (PRD §3). One query; assembled into parent →
 * children in memory. RLS already filters to is_active = true.
 */
export async function getNavigation(
  client: HudstenClient,
): Promise<NavNode[]> {
  const res = await client
    .from("navigation_menu")
    .select("id, label, link_type, link_target, parent_id, position")
    .order("position", { ascending: true });
  const rows = unwrap(res, "getNavigation") ?? [];

  const nodes = new Map<string, NavNode>();
  for (const r of rows) {
    nodes.set(r.id, {
      id: r.id,
      label: r.label,
      link_type: r.link_type,
      link_target: r.link_target,
      position: r.position,
      href: resolveNavHref(r.link_type, r.link_target),
      children: [],
    });
  }

  const roots: NavNode[] = [];
  for (const r of rows) {
    const node = nodes.get(r.id)!;
    if (r.parent_id && nodes.has(r.parent_id)) {
      nodes.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (list: NavNode[]) => {
    list.sort(byPosition);
    list.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}
