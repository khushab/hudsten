import type { Metadata } from "next";
import { ROUTES } from "@hudsten/shared";
import {
  fetchActiveCollections,
  fetchProductsForCollection,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import {
  CollectionTiles,
  type CollectionTile,
} from "@/components/marketing/CollectionTiles";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Browse every Hudsten collection — curated edits of premium gym bags and lifestyle goods.",
  alternates: { canonical: absoluteUrl(ROUTES.collection) },
  openGraph: {
    title: "Collections",
    url: absoluteUrl(ROUTES.collection),
    images: ["/og-default.png"],
  },
};

/**
 * Collections index — without it, collections outside the navbar are
 * unreachable (discovery + internal linking).
 */
export default async function CollectionsIndexPage() {
  const collections = await fetchActiveCollections();

  const tiles: CollectionTile[] = (
    await Promise.all(
      collections.map(async (c): Promise<CollectionTile | null> => {
        const items = await fetchProductsForCollection(c);
        if (items.length === 0) return null;
        return {
          name: c.name,
          href: `${ROUTES.collection}/${c.slug}`,
          image: items.find((p) => p.primaryImage)?.primaryImage ?? null,
        };
      }),
    )
  ).filter((t): t is CollectionTile => t !== null);

  return (
    <Container as="main" className="py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Collections", path: ROUTES.collection },
        ])}
      />
      <Breadcrumbs
        crumbs={[{ name: "Home", path: "/" }, { name: "Collections" }]}
      />
      <h1 className="mt-6 text-3xl font-normal">Collections</h1>
      <p className="mt-2 max-w-prose text-stone-600">
        Curated edits of the range — built around how you train, travel and
        carry.
      </p>
      <div className="mt-8">
        {tiles.length > 0 ? (
          <CollectionTiles tiles={tiles} />
        ) : (
          <p className="rounded-lg border border-dashed border-stone-300 bg-paper-dim p-8 text-center text-stone-500">
            Collections are being stocked — check back soon.
          </p>
        )}
      </div>
    </Container>
  );
}
