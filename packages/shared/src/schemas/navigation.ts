import { z } from "zod";
import { NAV_LINK_TYPES } from "../constants";
import { optionalText, uuidSchema } from "./common";

export const navItemSchema = z
  .object({
    label: z.string().min(1, "Label is required"),
    link_type: z.enum(NAV_LINK_TYPES),
    /** slug (category/collection) or absolute/relative URL; null for dropdown_parent. */
    link_target: optionalText,
    parent_id: uuidSchema.nullable().optional(),
    position: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
  })
  .refine(
    (n) => n.link_type === "dropdown_parent" || !!n.link_target,
    { message: "This link type needs a target", path: ["link_target"] },
  );

export type NavItemInput = z.infer<typeof navItemSchema>;
