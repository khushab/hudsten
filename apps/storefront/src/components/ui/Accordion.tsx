"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Disclosure with a reliable open AND close animation. Driven by React state — NOT the
 * native <details> toggle, which hides its content instantly on close (so it can't
 * animate out, and behaves inconsistently). The content stays mounted; height animates
 * via the grid-template-rows 1fr↔0fr trick. Accessible (button[aria-expanded] controls a
 * labelled region) + reduced-motion-safe. Content stays in the DOM = still SEO-visible.
 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <div className={cn("border-b border-stone-200", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left font-display text-sm font-medium uppercase tracking-caps"
      >
        {title}
        <svg
          className={cn(
            "h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 ease-lux",
            open && "rotate-45",
          )}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {/* grid-template-rows 1fr↔0fr animates height without a fixed value; inner wrapper
          must be overflow-hidden so the content clips while collapsing. */}
      <div
        id={bodyId}
        role="region"
        className="grid transition-[grid-template-rows] duration-300 ease-lux motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pt-1 text-sm leading-relaxed text-stone-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
