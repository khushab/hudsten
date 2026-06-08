import { z } from "zod";
import { GENDERS, PRODUCT_STATUSES } from "../constants";
import { optionalText, seoSchema, slugSchema, uuidSchema } from "./common";

/** Hex color for swatches, e.g. "#111111". Nullable for non-color option values (sizes). */
export const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Use a hex color like #111111");

export const productOptionValueSchema = z.object({
  id: uuidSchema.optional(),
  value: z.string().min(1), // "Black", "M"
  color_hex: hexColorSchema.nullable().optional(),
  position: z.number().int().min(0).default(0),
});

export const productOptionSchema = z.object({
  id: uuidSchema.optional(),
  name: z.string().min(1), // "Color", "Size"
  position: z.number().int().min(0).default(0),
  values: z.array(productOptionValueSchema).min(1),
});

export const productVariantSchema = z
  .object({
    id: uuidSchema.optional(),
    title: z.string().min(1), // "Black / M"
    sku: optionalText,
    price: z.number().nonnegative().nullable().optional(),
    compare_at_price: z.number().nonnegative().nullable().optional(),
    in_stock: z.boolean().default(true),
    position: z.number().int().min(0).default(0),
    /** option_value_ids (or temp client ids) that compose this variant. */
    option_value_ids: z.array(z.string()).default([]),
  })
  // Honest discount at the variant tier too: a variant compare-at must exceed its price
  // (variant price falls back to the product price, validated by the caller).
  .refine(
    (v) =>
      v.compare_at_price == null ||
      v.compare_at_price === 0 ||
      v.price == null ||
      v.compare_at_price > v.price,
    {
      message: "Variant compare-at must be higher than its price (no fake discounts)",
      path: ["compare_at_price"],
    },
  );

export const productImageSchema = z.object({
  id: uuidSchema.optional(),
  url: z.string().url(),
  alt_text: optionalText,
  position: z.number().int().min(0).default(0),
  /** option_value_ids this image is tagged to (the variant-image engine; usually Color values). */
  option_value_ids: z.array(z.string()).default([]),
});

/** Core product form (excludes the relational builders above, which save separately). */
export const productCoreSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    slug: slugSchema,
    description: optionalText,
    product_type_id: uuidSchema,
    category_id: uuidSchema.nullable().optional(),
    gender: z.enum(GENDERS).default("unisex"),
    price: z.number().nonnegative(),
    compare_at_price: z.number().nonnegative().nullable().optional(),
    currency: z.string().default("INR"),
    status: z.enum(PRODUCT_STATUSES).default("draft"),
    in_stock: z.boolean().default(true),
    /** Validated loosely here; validated against the type's spec_schema at save time. */
    specs: z.record(z.unknown()).default({}),
    whatsapp_message_template: optionalText,
    amazon_url: z.union([z.string().url(), z.literal("")]).nullable().optional(),
    is_featured: z.boolean().default(false),
    badges: z.array(z.string()).default([]),
    position: z.number().int().min(0).default(0),
  })
  .merge(seoSchema)
  .refine(
    (p) =>
      p.compare_at_price == null ||
      p.compare_at_price === 0 ||
      p.compare_at_price > p.price,
    {
      message: "Compare-at price must be higher than the price (no fake discounts)",
      path: ["compare_at_price"],
    },
  );

/** Full editor payload: core + relational builders. */
export const productEditorSchema = z.object({
  core: productCoreSchema,
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  images: z.array(productImageSchema).default([]),
  collection_ids: z.array(uuidSchema).default([]),
  tag_ids: z.array(uuidSchema).default([]),
});

export type ProductCoreInput = z.infer<typeof productCoreSchema>;
export type ProductOptionInput = z.infer<typeof productOptionSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductEditorInput = z.infer<typeof productEditorSchema>;
