import { z } from "zod";
import { optionalText, uuidSchema } from "./common";

export const heroSchema = z.object({
  image_url: optionalText,
  headline: optionalText,
  subtext: optionalText,
  cta_label: optionalText,
  cta_link: optionalText,
});

export const socialLinksSchema = z.object({
  instagram: optionalText,
  facebook: optionalText,
  youtube: optionalText,
  x: optionalText,
});

export const policyBodiesSchema = z.object({
  privacy: optionalText,
  terms: optionalText,
  shipping: optionalText,
  returns: optionalText,
});

/**
 * Single-row site settings (PRD §4). Stored as one row; the WhatsApp number + default
 * template are the conversion-critical fields.
 */
export const settingsSchema = z.object({
  store_name: z.string().min(1).default("Hudsten"),
  logo_url: optionalText,
  announcement_bar: optionalText,
  whatsapp_number: optionalText, // sanitized at link-build time
  whatsapp_default_message_template: optionalText,
  delivery_note: optionalText,
  hero: heroSchema.default({}),
  featured_collection_id: uuidSchema.nullable().optional(),
  contact_email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: optionalText,
  address: optionalText,
  gst_number: optionalText,
  social: socialLinksSchema.default({}),
  policies: policyBodiesSchema.default({}),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
