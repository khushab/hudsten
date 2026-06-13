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

/**
 * Optional text field. Accepts string | null | undefined (DB nullable columns come back as
 * null) and normalizes null/"" → undefined so blank fields don't overwrite and validation
 * never throws "Expected string, received null".
 */
export const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v == null || v === "" ? undefined : v));

export const seoSchema = z.object({
  meta_title: optionalText,
  meta_description: optionalText,
});
