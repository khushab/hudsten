import { z } from "zod";
import { optionalText, seoSchema, slugSchema, uuidSchema } from "./common";

export const categorySchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    slug: slugSchema,
    parent_id: uuidSchema.nullable().optional(),
    description: optionalText,
    image_url: optionalText,
    position: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    // NOTE: PRD §3 mentions a "show in nav" toggle. There is no such column (§4);
    // nav is data-driven via navigation_menu. The admin exposes that toggle as a
    // shortcut that creates/removes a navigation_menu row, not a category column.
  })
  .merge(seoSchema);

export type CategoryInput = z.infer<typeof categorySchema>;
