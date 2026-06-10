import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ROUTES } from "@hudsten/shared";
import { summarizeReviews } from "@hudsten/db";
import {
  fetchCategoryBreadcrumb,
  fetchProductBySlug,
  fetchProductsForCrossSell,
  fetchPublishedReviews,
  fetchSettings,
  fetchActiveProductSlugs,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { SpecsTable } from "@/components/product/SpecsTable";
import { WhatsInBox } from "@/components/product/WhatsInBox";
import { ReviewsEmpty } from "@/components/product/ReviewsEmpty";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await fetchActiveProductSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Not found" };
  const title = product.meta_title ?? product.title;
  // `||` (not `??`): an empty description must fall through to the next option.
  // ~160 chars is the SERP truncation point.
  const description = (
    product.meta_description ||
    stripHtml(product.description ?? "") ||
    `Shop ${product.title} at Hudsten.`
  ).slice(0, 160);
  const canonical = absoluteUrl(`${ROUTES.product}/${product.slug}`);
  const image = product.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: image ?? "/og-default.png" }],
    },
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const settings = await fetchSettings();
  const productUrl = absoluteUrl(`${ROUTES.product}/${product.slug}`);

  const [reviewList, trail, related] = await Promise.all([
    fetchPublishedReviews(product.id),
    product.category
      ? fetchCategoryBreadcrumb(product.category.slug)
      : Promise.resolve([]),
    product.category
      ? fetchProductsForCrossSell(product.category.id, product.id)
      : Promise.resolve([]),
  ]);
  const reviews = summarizeReviews(reviewList);

  // Breadcrumb: Home / [category trail] / Product
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    ...trail.map((c) => ({ name: c.name, path: `${ROUTES.category}/${c.slug}` })),
    { name: product.title },
  ];

  // FAQ assembled from real data (specs + policies) — no fabricated content.
  const faqItems = [
    product.specs.care
      ? { q: "How do I care for it?", a: String(product.specs.care) }
      : null,
    product.specs.warranty
      ? { q: "Is there a warranty?", a: String(product.specs.warranty) }
      : null,
    {
      q: "Shipping & delivery?",
      a:
        stripHtml(settings?.policies.shipping ?? "") ||
        "Free shipping across India, typically 3–7 business days.",
    },
    {
      q: "Returns & exchanges?",
      a:
        stripHtml(settings?.policies.returns ?? "") ||
        "7-day easy returns on unused items in original condition.",
    },
  ].filter((x): x is { q: string; a: string } => x !== null);

  const whatsInBox = product.specs.whats_in_box;

  return (
    <main className="pb-24 lg:pb-0">
      <JsonLd
        data={[
          productJsonLd(product, reviews),
          breadcrumbJsonLd(
            crumbs.map((c) => ({
              name: c.name,
              path: c.path ?? `${ROUTES.product}/${product.slug}`,
            })),
          ),
        ]}
      />

      <Container className="py-6">
        <Breadcrumbs crumbs={crumbs} />
      </Container>

      <Container className="pb-12">
        <ProductBuyBox
          product={product}
          settings={settings}
          productUrl={productUrl}
          reviews={reviews}
        />
      </Container>

      {/* Below the fold */}
      <Container className="max-w-4xl space-y-2 border-t border-stone-200 pt-8">
        {product.description && (
          <Accordion title="Description" defaultOpen>
            <div
              className="prose prose-sm prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </Accordion>
        )}

        <Accordion title="Specifications" defaultOpen>
          <SpecsTable schema={product.specSchema} specs={product.specs} />
        </Accordion>

        {Array.isArray(whatsInBox) && whatsInBox.length > 0 && (
          <Accordion title="What's in the box">
            <WhatsInBox items={whatsInBox} />
          </Accordion>
        )}

        {faqItems.map((item) => (
          <Accordion key={item.q} title={item.q}>
            <p>{item.a}</p>
          </Accordion>
        ))}
      </Container>

      {/* Reviews */}
      <Container className="max-w-4xl py-12">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Reviews</h2>
        {reviewList.length === 0 ? (
          <ReviewsEmpty />
        ) : (
          <ul className="space-y-6">
            {reviewList.map((r) => (
              <li key={r.id} className="border-b border-stone-200 pb-6">
                <p className="text-brass-600" aria-hidden="true">
                  {"★".repeat(r.rating)}
                </p>
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-stone-600">{r.body}</p>}
                <p className="mt-2 text-xs text-stone-600">— {r.author_name}</p>
              </li>
            ))}
          </ul>
        )}
      </Container>

      {/* Pairs well with (cross-sell) — with a fallback so the page never dead-ends. */}
      {related.length > 0 ? (
        <Container className="py-12">
          <SectionHeading eyebrow="Complete the kit" title="Pairs well with" />
          <ProductGrid products={related} />
        </Container>
      ) : (
        <Container className="py-12">
          <div className="rounded-lg border border-stone-200 bg-paper-dim px-6 py-8 text-center">
            <p className="font-display text-lg font-medium">
              Want to see what else we make?
            </p>
            <p className="mx-auto mt-1 max-w-prose text-sm text-stone-600">
              More pieces are on the way — browse the collection or come back
              soon.
            </p>
            <Link
              href={
                product.category
                  ? `${ROUTES.category}/${product.category.slug}`
                  : "/"
              }
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-ink"
            >
              {product.category
                ? `Explore ${product.category.name}`
                : "Back to home"}{" "}
              →
            </Link>
          </div>
        </Container>
      )}
    </main>
  );
}
