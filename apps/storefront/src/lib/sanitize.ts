import DOMPurify from "isomorphic-dompurify";

/**
 * Defense-in-depth for admin-authored HTML (descriptions, policy bodies).
 * RLS already restricts writes to admins, but a compromised admin account
 * must not become stored XSS on the storefront.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "style"],
  });
}
