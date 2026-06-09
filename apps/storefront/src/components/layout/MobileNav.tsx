"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@hudsten/db";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/** Mobile drawer nav. Slides in/out (kept mounted so the close animation can play). */
export function MobileNav({ items }: { items: NavNode[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close when navigating to a new route.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string | null) =>
    href && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // Portaled to <body> so `fixed` escapes the header's backdrop-filter containing block.
  // Stays mounted; visibility/position are driven by `open` so both directions animate.
  const drawer = mounted
    ? createPortal(
        <div
          className={cn(
            "fixed inset-0 z-[80] lg:hidden",
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
          // `inert` keeps the off-screen drawer out of the tab order + AT tree when closed.
          inert={!open}
          aria-hidden={!open}
        >
          {/* Backdrop fades */}
          <div
            className={cn(
              "absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 ease-lux",
              open ? "opacity-100" : "opacity-0",
            )}
            onClick={() => setOpen(false)}
          />
          {/* Panel slides from the left */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className={cn(
              "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper shadow-lift transition-transform duration-300 ease-lux",
              open ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <span className="font-display text-xl font-bold tracking-tight">
                HUDSTEN
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-stone-100"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.children.length > 0 ? (
                      <details className="group" open>
                        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-base font-medium">
                          {item.label}
                          <span className="text-stone-400 transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <ul className="ml-3 border-l border-stone-200 pl-3">
                          {item.children.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={c.href ?? "#"}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm hover:text-ink",
                                  isActive(c.href) ? "font-medium text-ink" : "text-stone-600",
                                )}
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link
                        href={item.href ?? "#"}
                        className={cn(
                          "block rounded-md px-3 py-2.5 text-base font-medium hover:bg-stone-100",
                          isActive(item.href) && "bg-stone-100",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-ink hover:bg-stone-100"
      >
        <MenuIcon className="h-6 w-6" />
      </button>
      {drawer}
    </div>
  );
}
