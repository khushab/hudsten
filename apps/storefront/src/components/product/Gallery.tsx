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
 *  • Optional product video renders as the last slide (PRD §6: zoom + video).
 *  • Mobile swipe + keyboard arrows navigate slides.
 */

/** YouTube URL → privacy-friendly embed URL; null means "treat as a direct video file". */
function youTubeEmbedUrl(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export function Gallery({
  images,
  activeColorId,
  title,
  videoUrl = null,
}: {
  images: GalleryImage[];
  activeColorId: string | null;
  title: string;
  videoUrl?: string | null;
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

  // The video (color-independent) is one extra slide after the color's images.
  const total = visible.length + (videoUrl ? 1 : 0);

  const [index, setIndex] = useState(0);
  // Preserve angle across color switch: keep the index, clamp to the new set length.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, total - 1)));
  }, [total]);

  const isVideo = videoUrl != null && index === visible.length;
  const active = isVideo ? null : (visible[index] ?? visible[0] ?? null);
  const embedUrl = videoUrl ? youTubeEmbedUrl(videoUrl) : null;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  // Swipe: horizontal drags advance slides; vertical-dominant gestures stay scrolls.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  const [zoom, setZoom] = useState(false);

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
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} — media ${index + 1} of ${total}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") prev();
          if (e.key === "ArrowRight") next();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-xl bg-paper-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
      >
        {/* All images stacked + eager-loaded so a color switch is instant (no fetch
            flicker). Above ~24 images the preload cost outweighs the flicker win, so
            only the active color set stays in the DOM. */}
        {(images.length > 24 ? visible : images).map((img, i) => (
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
              !isVideo && img.id === active?.id ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        {/* Video slide — mounted only when active (no hidden autobuffering). */}
        {isVideo && videoUrl && (
          <div className="absolute inset-0 bg-ink">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${title} — video`}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <video
                src={videoUrl}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              />
            )}
          </div>
        )}

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

      {/* Thumbnails — the active color set (+ video). */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {visible.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={!isVideo && i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md bg-paper-dim ring-offset-2 transition",
                !isVideo && i === index
                  ? "ring-2 ring-ink"
                  : "ring-1 ring-stone-200 hover:ring-stone-400",
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
          {videoUrl && (
            <button
              type="button"
              onClick={() => setIndex(visible.length)}
              aria-label="Play video"
              aria-current={isVideo}
              className={cn(
                "relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-ink text-paper ring-offset-2 transition",
                isVideo
                  ? "ring-2 ring-ink"
                  : "ring-1 ring-stone-200 hover:ring-stone-400",
              )}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </button>
          )}
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
