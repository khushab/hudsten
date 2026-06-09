"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@hudsten/db";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Variant-image gallery (PRD §6 — the differentiator).
 *  • Selecting a Color filters the gallery to that color's images.
 *  • Size selection does NOT touch images (the parent only passes activeColorId).
 *  • ALL images are rendered + eager-loaded (preload all color sets → no flicker on switch).
 *  • The active index/angle is PRESERVED across a color switch (clamped to the new set).
 *  • Falls back to product-level (untagged) images when a color has none.
 */
export function Gallery({
  images,
  activeColorId,
  title,
}: {
  images: GalleryImage[];
  activeColorId: string | null;
  title: string;
}) {
  // Product-level fallback = images tagged to no color; if none, all images.
  const fallback = useMemo(() => {
    const untagged = images.filter((i) => i.optionValueIds.length === 0);
    return untagged.length > 0 ? untagged : images;
  }, [images]);

  const visible = useMemo(() => {
    if (!activeColorId) return fallback;
    const set = images.filter((i) => i.optionValueIds.includes(activeColorId));
    return set.length > 0 ? set : fallback;
  }, [images, activeColorId, fallback]);

  const [index, setIndex] = useState(0);
  // Preserve angle across color switch: keep the index, clamp to the new set length.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, visible.length - 1)));
  }, [visible]);

  const [zoom, setZoom] = useState(false);
  const active = visible[index] ?? visible[0] ?? null;

  // Zoom lightbox a11y: Esc to close, scroll lock, focus the close button on open and
  // restore focus on close. Tab is trapped to the close button (the only control).
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!zoom) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "Tab") {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocusRef.current?.focus();
    };
  }, [zoom]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-dim">
        {/* All images stacked + eager-loaded so a color switch is instant (no fetch flicker). */}
        {images.map((img, i) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt_text ?? title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            loading="eager"
            priority={i === 0}
            className={cn(
              "object-cover transition-opacity duration-200",
              img.id === active?.id ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        {active && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Zoom image"
            className="absolute bottom-3 right-3 rounded-full bg-paper/85 px-3 py-1.5 text-xs font-medium text-ink shadow-subtle backdrop-blur hover:bg-paper"
          >
            Zoom
          </button>
        )}
      </div>

      {/* Thumbnails — only the active color set. */}
      {visible.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {visible.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md bg-paper-dim ring-offset-2 transition",
                i === index ? "ring-2 ring-ink" : "ring-1 ring-stone-200 hover:ring-stone-400",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                loading="eager"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom lightbox */}
      {zoom && active && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(false)}
        >
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Close zoom"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper/10 text-paper hover:bg-paper/20"
            onClick={() => setZoom(false)}
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          <div
            className="relative h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.url}
              alt={active.alt_text ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
