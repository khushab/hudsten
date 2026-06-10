import type { ProductDetail, ReviewSummary } from "@hudsten/db";
import { absoluteUrl } from "@/lib/env";
import { ROUTES } from "@hudsten/shared";

/**
 * Structured-data builders (PRD §9). Product + Offer + BreadcrumbList always;
 * AggregateRating ONLY when real reviews exist (never fabricated).
 */

export function productJsonLd(
  product: ProductDetail,
  reviews: ReviewSummary,
): Record<string, unknown> {
  const url = absoluteUrl(`${ROUTES.product}/${product.slug}`);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      // `||`: empty meta_description must fall through to the stripped body.
      (product.meta_description ||
        product.description?.replace(/<[^>]+>/g, "").slice(0, 300)) ||
      undefined,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Hudsten" },
    sku: product.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
  // AggregateRating only with real reviews.
  if (reviews.count > 0 && reviews.average != null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.average,
      reviewCount: reviews.count,
    };
  }
  return data;
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function organizationJsonLd(
  storeName: string,
  socials?: (string | undefined)[],
): Record<string, unknown> {
  const sameAs = (socials ?? []).filter(
    (s): s is string => Boolean(s) && /^https?:\/\//.test(s as string),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(storeName: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: storeName,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
