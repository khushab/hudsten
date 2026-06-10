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
import { TrustStripSlim } from "@/components/marketing/TrustStrip";
import { WhyHudsten } from "@/components/marketing/WhyHudsten";
import {
  CollectionTiles,
  type CollectionTile,
} from "@/components/marketing/CollectionTiles";
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
  const [settings, collections] = await Promise.all([
    fetchSettings(),
    fetchActiveCollections(),
  ]);

  // Featured collection (settings) → its products; fall back to is_featured products.
  let featuredTitle = "Featured";
  let featuredHref: string | undefined;
  let products: ProductCard[] = [];

  if (settings?.featured_collection_id) {
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

  // "Shop by" tiles: top collections by position, imaged by their first product.
  // Collections without products are skipped (no empty tiles at launch).
  const tiles: CollectionTile[] = (
    await Promise.all(
      collections.slice(0, 4).map(async (c): Promise<CollectionTile | null> => {
        const items = await fetchProductsForCollection(c);
        const image = items.find((p) => p.primaryImage)?.primaryImage ?? null;
        if (items.length === 0) return null;
        return {
          name: c.name,
          href: `${ROUTES.collection}/${c.slug}`,
          image,
        };
      }),
    )
  )
    .filter((t): t is CollectionTile => t !== null)
    .slice(0, 3);

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

      {/* Risk reversal BEFORE product evaluation — an unknown brand earns the
          scroll with trust, not price. */}
      <TrustStripSlim />

      {tiles.length >= 2 && (
        <Container as="section" className="pt-section-sm sm:pt-section">
          <SectionHeading eyebrow="Find your fit" title="Shop by collection" />
          <CollectionTiles tiles={tiles} />
        </Container>
      )}

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

      <WhyHudsten />

      <Container as="section" className="py-section">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">The launch list</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Be first in line for the drop
          </h2>
          <p className="mt-3 text-stone-600">
            Early access to new releases before they hit the site — and nothing
            else. No spam, unsubscribe anytime.
          </p>
          <div className="mt-6 flex justify-center">
            <NewsletterForm source="home" className="max-w-md" />
          </div>
        </div>
      </Container>
    </main>
  );
}
