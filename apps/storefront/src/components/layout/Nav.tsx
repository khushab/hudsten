"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@hudsten/db";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Desktop primary nav (PRD §3). Dropdowns are CSS-only: they open on hover AND on
 * focus-within, so keyboard users can tab to the parent and into the submenu without JS.
 * Active item is highlighted from the current pathname.
 */
export function Nav({ items }: { items: NavNode[] }) {
  const pathname = usePathname();

  const hrefActive = (href: string | null) =>
    !!href && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // A direct top-level link wins. A dropdown parent highlights only for routes NOT
  // already covered by a sibling link (e.g. /c/gym-bags via "All Gym Bags") — so the
  // current page never lights up two top-level items at once.
  const directActiveExists = items.some((i) => hrefActive(i.href));
  const itemActive = (item: NavNode) =>
    item.href
      ? hrefActive(item.href)
      : !directActiveExists && item.children.some((c) => hrefActive(c.href));

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <NavItem key={item.id} item={item} active={itemActive(item)} hrefActive={hrefActive} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({
  item,
  active,
  hrefActive,
}: {
  item: NavNode;
  active: boolean;
  hrefActive: (href: string | null) => boolean;
}) {
  const linkCls = cn(
    "inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-stone-100",
    active ? "text-ink" : "text-stone-600",
  );

  if (item.children.length > 0) {
    return (
      <li className="group relative">
        <button type="button" aria-haspopup="true" className={linkCls}>
          <span className={cn(active && "underline decoration-brass decoration-2 underline-offset-8")}>
            {item.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-stone-400 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
        </button>
        <ul className="invisible absolute left-0 top-full z-50 min-w-[14rem] translate-y-1 rounded-lg border border-stone-200 bg-paper p-1.5 opacity-0 shadow-card transition-all duration-150 ease-lux group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {item.children.map((child) => (
            <li key={child.id}>
              <Link
                href={child.href ?? "#"}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-stone-100 hover:text-ink",
                  hrefActive(child.href) ? "bg-stone-100 text-ink" : "text-stone-700",
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li>
      <Link href={item.href ?? "#"} className={linkCls}>
        <span className={cn(active && "underline decoration-brass decoration-2 underline-offset-8")}>
          {item.label}
        </span>
      </Link>
    </li>
  );
}
