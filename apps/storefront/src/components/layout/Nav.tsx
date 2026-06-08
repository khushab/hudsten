import Link from "next/link";
import type { NavNode } from "@hudsten/db";
import { ChevronDown } from "@/components/icons";

/**
 * Desktop primary nav (PRD §3). Dropdowns are CSS-only: they open on hover AND on
 * focus-within, so keyboard users can tab to the parent and into the submenu without JS.
 */
export function Nav({ items }: { items: NavNode[] }) {
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({ item }: { item: NavNode }) {
  const linkCls =
    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-stone-100";

  if (item.children.length > 0) {
    return (
      <li className="group relative">
        <button
          type="button"
          aria-haspopup="true"
          className={linkCls}
        >
          {item.label}
          <ChevronDown className="h-3.5 w-3.5 text-stone-400 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
        </button>
        <ul className="invisible absolute left-0 top-full z-50 min-w-[14rem] translate-y-1 rounded-lg border border-stone-200 bg-paper p-1.5 opacity-0 shadow-card transition-all duration-150 ease-lux group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {item.children.map((child) => (
            <li key={child.id}>
              <Link
                href={child.href ?? "#"}
                className="block rounded-md px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100 hover:text-ink"
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
        {item.label}
      </Link>
    </li>
  );
}
