/**
 * WhatsApp click-to-chat link builder (PRD §6 — the PRIMARY CTA).
 *
 * Produces `https://wa.me/<number>?text=<encoded>` where the message pre-fills
 * product name + selected variant + product URL (+ price). Lives here in @hudsten/shared
 * so the storefront PDP and any future surface (admin preview, emails) build links identically.
 *
 * Template precedence is the CALLER's job (so this stays pure):
 *   product.whatsapp_message_template ?? settings.whatsapp_default_message_template ?? DEFAULT_WHATSAPP_TEMPLATE
 *
 * PHASE 2: when migrating to the WhatsApp Business API (catalog/automation), this builder
 * is the single swap point — keep the {placeholder} contract stable.
 */

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Hi Hudsten 👋 I'd like to order:\n\n*{product}*{variant}\n{price}\n\n{url}\n\nIs this in stock?";

/** Placeholders supported in any whatsapp message template. */
export interface WhatsAppTemplateVars {
  /** Product title, e.g. "Atlas Gym Duffel". */
  product: string;
  /** Human-readable selected variant, e.g. "Black / Large". Empty string if none selected. */
  variant?: string;
  /** Formatted price, e.g. "₹2,499". Optional. */
  price?: string;
  /** Absolute, canonical product URL. */
  url: string;
}

export interface BuildWhatsAppUrlInput extends WhatsAppTemplateVars {
  /** Raw whatsapp number from settings (may contain +, spaces, dashes). */
  phoneNumber: string;
  /** Resolved template (see precedence note above). Falls back to DEFAULT if blank. */
  template?: string | null;
}

/** wa.me requires digits only, including country code, no '+' or separators. */
export function sanitizePhoneNumber(raw: string): string {
  return (raw ?? "").replace(/[^\d]/g, "");
}

/**
 * Interpolate {placeholders}. The `variant` placeholder is special: when present it renders
 * with a leading separator (" — Black / Large") and collapses to "" when absent, so the
 * default template reads naturally with or without a variant. Unknown tokens are left intact.
 */
export function renderTemplate(
  template: string,
  vars: WhatsAppTemplateVars,
): string {
  const variantText = vars.variant?.trim() ? ` — ${vars.variant.trim()}` : "";
  const replacements: Record<string, string> = {
    product: vars.product ?? "",
    variant: variantText,
    price: vars.price ?? "",
    url: vars.url ?? "",
  };
  return template
    .replace(/\{(product|variant|price|url)\}/g, (_m, key: string) =>
      key in replacements ? replacements[key]! : _m,
    )
    .replace(/\n{3,}/g, "\n\n") // collapse gaps left by empty optional lines
    .trim();
}

/**
 * Build the full wa.me URL. Returns null when the phone number is unusable, so the UI can
 * disable/hide the CTA rather than render a broken link (e.g. before the admin sets a number).
 */
export function buildWhatsAppUrl(input: BuildWhatsAppUrlInput): string | null {
  const phone = sanitizePhoneNumber(input.phoneNumber);
  if (phone.length < 8) return null; // not a plausible international number

  const template = input.template?.trim() || DEFAULT_WHATSAPP_TEMPLATE;
  const message = renderTemplate(template, input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
