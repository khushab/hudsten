import type { Metadata } from "next";
import Image from "next/image";
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
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ReviewsEmpty } from "@/components/product/ReviewsEmpty";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Faq } from "@/components/product/Faq";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/jsonld";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/cn";

export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;

// Generate at runtime (not at build): on-demand revalidation reliably clears runtime cache entries,
// not build-time ones. Pages are still statically cached/ISR after the first request.
export async function generateStaticParams() {
  return [];
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

  const editorial = product.editorialBlocks;

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
          ...(product.faqs.length > 0 ? [faqJsonLd(product.faqs)] : []),
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

      {/* Below the fold — free-form rich-text sections + per-product FAQ. */}
      <Container className="max-w-4xl space-y-2 border-t border-stone-200 pt-8">
        {product.description && (
          <Accordion title="Description" defaultOpen>
            <div
              className="prose prose-sm prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </Accordion>
        )}

        {product.details && (
          <Accordion title="Details">
            <div
              className="prose prose-sm prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.details) }}
            />
          </Accordion>
        )}

        {product.specifications && (
          <Accordion title="Specifications">
            <div
              className="prose prose-sm prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.specifications) }}
            />
          </Accordion>
        )}
      </Container>

      {/* Editorial — full-bleed alternating image/text rows (admin-editable). */}
      {editorial.length > 0 && (
        <section className="mt-12">
          {editorial.map((b, i) => (
            <Reveal
              key={i}
              className={cn("grid md:grid-cols-2")}
            >
              <div
                className={cn(
                  "relative min-h-[340px] bg-paper-dim md:min-h-[480px]",
                  i % 2 === 1 && "md:order-2",
                )}
              >
                {b.image_url && (
                  <Image
                    src={b.image_url}
                    alt={b.heading || ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16",
                  i % 2 === 1 && "md:order-1",
                )}
              >
                {b.heading && (
                  <h2 className="text-ink text-xl font-normal uppercase tracking-caps sm:text-2xl">
                    {b.heading}
                  </h2>
                )}
                {b.body && (
                  <p className="mt-4 max-w-md text-sm uppercase leading-[1.7] tracking-caps text-ink">
                    {b.body}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </section>
      )}

      {/* FAQ — its own block, separate from the Description/Details/Specifications group. */}
      {product.faqs.length > 0 && (
        <Container className="max-w-4xl py-12">
          <Faq items={product.faqs} />
        </Container>
      )}

      {/* Reviews */}
      <Container className="max-w-4xl py-12">
        <h2 className="mb-5 text-2xl font-normal">Reviews</h2>
        {reviewList.length === 0 ? (
          <ReviewsEmpty />
        ) : (
          <ul className="space-y-6">
            {reviewList.map((r) => (
              <li key={r.id} className="border-b border-stone-200 pb-6">
                <p className="text-ink" aria-hidden="true">
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

      {/* Related products — MW grey band, centered heading. */}
      {related.length > 0 ? (
        <section className="mt-12 bg-[#EFEFEF] py-14">
          <Container>
            <Reveal>
              <h2 className="mb-8 text-center text-2xl font-normal uppercase tracking-caps">
                Related products
              </h2>
              <ProductGrid products={related} />
            </Reveal>
          </Container>
        </section>
      ) : (
        <Container className="py-12">
          <div className="border border-stone-200 bg-paper-dim px-6 py-8 text-center">
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
