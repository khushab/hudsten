import { z } from "zod";
import { SPEC_FIELD_TYPES } from "../constants";

/** Validates a single product_type spec_schema field definition. */
export const specFieldSchema = z
  .object({
    key: z
      .string()
      .min(1)
      .regex(/^[a-z0-9_]+$/, "Key must be snake_case (a-z, 0-9, _)"),
    label: z.string().min(1),
    type: z.enum(SPEC_FIELD_TYPES),
    unit: z.string().trim().optional(),
    group: z.string().trim().optional(),
    options: z.array(z.string().min(1)).optional(),
    help: z.string().trim().optional(),
  })
  .refine(
    (f) => f.type !== "select" || (f.options && f.options.length > 0),
    { message: "Select fields need at least one option", path: ["options"] },
  );

export const specSchemaSchema = z.array(specFieldSchema);

/** product_types row form. */
export const productTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  spec_schema: specSchemaSchema.default([]),
});

export type ProductTypeInput = z.infer<typeof productTypeSchema>;
