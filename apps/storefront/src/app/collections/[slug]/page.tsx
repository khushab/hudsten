import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROUTES } from "@hudsten/shared";
import {
  fetchCollectionBySlug,
  fetchColorFacets,
  fetchProductsForCollection,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ListingFilters } from "@/components/filters/ListingFilters";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;

// Generate at runtime (not at build) so on-demand revalidation reliably clears the cache entry.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await fetchCollectionBySlug(slug);
  if (!collection) return { title: "Not found" };
  const title = collection.meta_title ?? collection.name;
  const description =
    collection.meta_description ??
    collection.description ??
    `Shop the ${collection.name} collection at Hudsten.`;
  const canonical = absoluteUrl(`${ROUTES.collection}/${collection.slug}`);
  const ogImage =
    collection.image_url ??
    (await fetchProductsForCollection(collection))[0]?.primaryImage?.url;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImage ?? "/og-default.png" }],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await fetchCollectionBySlug(slug);
  if (!collection) notFound();

  const products = await fetchProductsForCollection(collection);
  // Scope the facets cache to this collection so a product change in it revalidates them too.
  const colorFacets = await fetchColorFacets(
    { ids: products.map((p) => p.id) },
    `collection-products:${collection.id}`,
  );

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: collection.name },
  ];

  return (
    <Container as="main" className="py-8 sm:py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: collection.name, path: `${ROUTES.collection}/${slug}` },
        ])}
      />
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-8 mt-6 max-w-2xl">
        <h1 className="text-3xl font-normal">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-3 text-stone-600">{collection.description}</p>
        )}
      </header>

      <ListingFilters products={products} colorFacets={colorFacets} />
    </Container>
  );
}
