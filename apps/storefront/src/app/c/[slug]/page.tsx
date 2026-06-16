import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROUTES } from "@hudsten/shared";
import {
  fetchActiveCategories,
  fetchCategoryBreadcrumb,
  fetchCategoryBySlug,
  fetchColorFacets,
  fetchListingCards,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/env";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ListingFilters } from "@/components/filters/ListingFilters";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await fetchActiveCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { title: "Not found" };
  const title = category.meta_title ?? category.name;
  const description =
    category.meta_description ??
    category.description ??
    `Shop ${category.name} at Hudsten.`;
  const canonical = absoluteUrl(`${ROUTES.category}/${category.slug}`);
  // OG image: category image, else the first product's image (cached — reused by the page).
  const ogImage =
    category.image_url ??
    (await fetchListingCards({ categoryId: category.id }))[0]?.primaryImage?.url;
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) notFound();

  const [trail, products, colorFacets] = await Promise.all([
    fetchCategoryBreadcrumb(slug),
    fetchListingCards({ categoryId: category.id }),
    fetchColorFacets({ categoryId: category.id }),
  ]);

  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    ...trail.map((c, i) => ({
      name: c.name,
      path: i < trail.length - 1 ? `${ROUTES.category}/${c.slug}` : undefined,
    })),
  ];

  return (
    <Container as="main" className="py-8 sm:py-12">
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((c) => ({ name: c.name, path: c.path ?? `${ROUTES.category}/${slug}` })),
        )}
      />
      <Breadcrumbs crumbs={crumbs} />

      <header className="mb-8 mt-6 max-w-2xl">
        <h1 className="text-4xl font-normal sm:text-5xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 text-stone-600">{category.description}</p>
        )}
      </header>

      <ListingFilters products={products} colorFacets={colorFacets} />
    </Container>
  );
}
