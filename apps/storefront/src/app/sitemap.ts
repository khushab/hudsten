import type { MetadataRoute } from "next";
import { ROUTES } from "@hudsten/shared";
import { absoluteUrl } from "@/lib/env";
import {
  fetchActiveCategories,
  fetchActiveCollections,
  fetchActiveProductSlugs,
} from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, collections, products] = await Promise.all([
    fetchActiveCategories().catch(() => []),
    fetchActiveCollections().catch(() => []),
    fetchActiveProductSlugs().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl(ROUTES.collection),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
    ...["privacy", "terms", "shipping", "returns"].map((p) => ({
      url: absoluteUrl(`/policies/${p}`),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`${ROUTES.category}/${c.slug}`),
    lastModified: c.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: absoluteUrl(`${ROUTES.collection}/${c.slug}`),
    lastModified: c.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`${ROUTES.product}/${p.slug}`),
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...productRoutes,
  ];
}
