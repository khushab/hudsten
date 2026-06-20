/**
 * Analytics event helpers (PRD §9). Safe to call anywhere: they no-op until the GA4 /
 * Meta Pixel scripts have loaded (which only happens after cookie consent — see
 * components/analytics). The two conversion-critical events are the WhatsApp + Amazon
 * CTA clicks, plus `view_item` on the PDP.
 */

type GtagFn = (...args: unknown[]) => void;
type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
    dataLayer?: unknown[];
  }
}

function ga(event: string, params: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

function fbq(event: string, params: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export interface ProductEventInput {
  id: string;
  name: string;
  price: number;
  currency: string;
  variant?: string;
}

/** Fired on PDP view (GA4 ecommerce `view_item` + Pixel `ViewContent`). */
export function trackViewItem(p: ProductEventInput): void {
  ga("view_item", {
    currency: p.currency,
    value: p.price,
    items: [{ item_id: p.id, item_name: p.name, price: p.price }],
  });
  fbq("ViewContent", {
    content_ids: [p.id],
    content_name: p.name,
    content_type: "product",
    value: p.price,
    currency: p.currency,
  });
}

/** PRIMARY CTA click → high-intent lead signal. */
export function trackWhatsAppClick(p: ProductEventInput): void {
  ga("whatsapp_click", {
    currency: p.currency,
    value: p.price,
    item_id: p.id,
    item_name: p.name,
    variant: p.variant,
  });
  // Mirror to GA4's recommended lead event so it shows in conversions.
  ga("generate_lead", { currency: p.currency, value: p.price });
  fbq("Contact", {
    content_ids: [p.id],
    content_name: p.name,
    value: p.price,
    currency: p.currency,
  });
}

/** Product share (native share sheet or copy-link). GA4 has a recommended `share` event. */
export function trackShare(id: string, name: string): void {
  ga("share", { method: "web_share", item_id: id, item_name: name });
}

/** SECONDARY CTA click (Amazon outbound). */
export function trackAmazonClick(p: ProductEventInput): void {
  ga("amazon_click", {
    currency: p.currency,
    value: p.price,
    item_id: p.id,
    item_name: p.name,
    variant: p.variant,
  });
  fbq("Lead", {
    content_ids: [p.id],
    content_name: p.name,
    value: p.price,
    currency: p.currency,
  });
}

export function trackNewsletterSignup(source: string): void {
  ga("sign_up", { method: "newsletter", source });
  fbq("Lead", { content_name: "newsletter" });
}
