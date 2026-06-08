import { z } from "zod";

/** URL-safe slug: lowercase, alphanumeric + single hyphens. Locked URL format (PRD §5). */
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and single hyphens",
  );

export const uuidSchema = z.string().uuid();

/** Generate a slug candidate from a title (client-side convenience; DB still enforces uniqueness). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Optional non-empty string that normalizes "" → undefined (so blank form fields don't overwrite). */
export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const seoSchema = z.object({
  meta_title: optionalText,
  meta_description: optionalText,
});
