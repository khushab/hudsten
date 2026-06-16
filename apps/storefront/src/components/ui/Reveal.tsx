"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Fades children up (small translateY + opacity) once when scrolled into view.
 * IntersectionObserver fires a single time, then disconnects. Honors
 * prefers-reduced-motion: reduced users skip the transform entirely (content
 * renders visible immediately — no animation, no layout shift).
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  /** Delay in ms before the reveal transition starts (for subtle stagger). */
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  // Default to visible: SSR markup + reduced-motion + no-JS all render in place.
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return; // leave shown=true; no animation

    const el = ref.current;
    if (!el) return;

    // Arm the hidden state only once we know JS + motion are in play.
    setShown(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-lux motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
