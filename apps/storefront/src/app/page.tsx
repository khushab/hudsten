import type { Metadata } from "next";
import type { ProductCard } from "@hudsten/db";
import { ROUTES } from "@hudsten/shared";
import {
  fetchActiveCollections,
  fetchFeaturedProducts,
  fetchProductsForCollection,
  fetchSettings,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { Hero } from "@/components/marketing/Hero";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { ProductGrid, EmptyProducts } from "@/components/product/ProductGrid";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

// ISR — home rebuilds at most hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  // Self-referencing canonical on the highest-priority page (title/description inherit from layout).
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { url: absoluteUrl("/") },
};

export default async function HomePage() {
  const settings = await fetchSettings();

  // Featured collection (settings) → its products; fall back to is_featured products.
  let featuredTitle = "Featured";
  let featuredHref: string | undefined;
  let products: ProductCard[] = [];

  if (settings?.featured_collection_id) {
    const collections = await fetchActiveCollections();
    const featured = collections.find(
      (c) => c.id === settings.featured_collection_id,
    );
    if (featured) {
      featuredTitle = featured.name;
      featuredHref = `${ROUTES.collection}/${featured.slug}`;
      products = await fetchProductsForCollection(featured);
    }
  }
  if (products.length === 0) {
    products = await fetchFeaturedProducts(8);
    featuredTitle = "Featured";
  }

  const storeName = settings?.store_name ?? "Hudsten";
  const social = settings?.social ?? {};

  return (
    <main>
      <JsonLd
        data={[
          organizationJsonLd(storeName, [
            social.instagram,
            social.facebook,
            social.youtube,
            social.x,
          ]),
          websiteJsonLd(storeName),
        ]}
      />
      <Hero hero={settings?.hero ?? {}} />

      <Container as="section" className="py-section-sm sm:py-section">
        <SectionHeading
          eyebrow="Just dropped"
          title={featuredTitle}
          link={featuredHref ? { label: "View all", href: featuredHref } : undefined}
        />
        {products.length > 0 ? (
          <ProductGrid products={products} priorityCount={4} />
        ) : (
          <EmptyProducts />
        )}
      </Container>

      <TrustStrip />

      <Container as="section" className="py-section">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Stay in the loop</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            First dibs on new drops
          </h2>
          <p className="mt-3 text-stone-600">
            Join the list for early access and the occasional good idea. No spam.
          </p>
          <div className="mt-6 flex justify-center">
            <NewsletterForm source="home" className="max-w-md" />
          </div>
        </div>
      </Container>
    </main>
  );
}
