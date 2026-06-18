import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge reads its own defaults, not tailwind.config — so our custom theme
// easing `ease-lux` is unknown to it and won't de-dupe against another `ease-*`.
// Register it so conflicting timing-function utilities resolve to the last one.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { ease: [{ ease: ["lux"] }] } },
});

/** Merge conditional classes and de-dupe conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
