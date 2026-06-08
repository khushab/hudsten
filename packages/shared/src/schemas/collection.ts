import { z } from "zod";
import { COLLECTION_TYPES, GENDERS } from "../constants";
import { optionalText, seoSchema, slugSchema } from "./common";

/**
 * Smart-collection rule shape (stored in collections.rules JSONB).
 * Kept intentionally small for Phase 1: gender + category + tags + price range.
 * The repository layer (packages/db) translates these into a Supabase query.
 * PHASE 2: extend with vendor, created-after, inventory, etc.
 */
export const smartRulesSchema = z.object({
  gender: z.enum(GENDERS).optional(),
  /** category slug to match products.category_id against. */
  category: z.string().optional(),
  /** product must carry ALL of these tag slugs. */
  tags: z.array(z.string()).optional(),
  price_min: z.number().nonnegative().optional(),
  price_max: z.number().nonnegative().optional(),
});

export type SmartRules = z.infer<typeof smartRulesSchema>;

export const collectionSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    slug: slugSchema,
    type: z.enum(COLLECTION_TYPES).default("manual"),
    description: optionalText,
    image_url: optionalText,
    rules: smartRulesSchema.nullable().default(null),
    position: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
  })
  .merge(seoSchema)
  .refine((c) => c.type !== "smart" || !!c.rules, {
    message: "Smart collections need at least one rule",
    path: ["rules"],
  });

export type CollectionInput = z.infer<typeof collectionSchema>;
