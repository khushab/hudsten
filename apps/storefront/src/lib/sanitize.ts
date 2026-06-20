import sanitizeHtmlLib from "sanitize-html";

/**
 * Defense-in-depth for admin-authored HTML (descriptions, policy bodies). RLS already restricts
 * writes to admins, but a compromised admin account must not become stored XSS on the storefront.
 *
 * Uses `sanitize-html` (htmlparser2 — pure JS, no jsdom) so it runs in the Vercel serverless
 * runtime. isomorphic-dompurify's jsdom fails there once pages render on demand (ISR).
 */
const ALLOWED_TAGS = [
  "p", "br", "hr", "span", "div",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup", "mark", "small",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "code", "pre",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
];

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      "*": ["class"],
    },
    // Blocks javascript:/data: URLs.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Tags not listed (script/style/form/input/button/iframe…) are dropped; attributes not listed
    // (style, on*) are dropped too — matching the prior DOMPurify policy, minus jsdom.
    disallowedTagsMode: "discard",
  });
}
