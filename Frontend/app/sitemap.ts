import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import apiClient from "@/lib/api-client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                       lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${baseUrl}/comps`,            lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    { url: `${baseUrl}/tierlist`,         lastModified: new Date(), changeFrequency: "daily",  priority: 0.9 },
    { url: `${baseUrl}/champions`,        lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/items`,            lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/augments`,         lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/traits`,           lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gods`,             lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Champion detail pages
  let championRoutes: MetadataRoute.Sitemap = [];
  try {
    const champions = await apiClient.getChampions();
    championRoutes = champions
      .filter((c) => !!c.slug)
      .map((c) => ({
        url: `${baseUrl}/champions/${c.slug!}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (_e) { /* fallback — don't break build */ }

  // Item detail pages
  let itemRoutes: MetadataRoute.Sitemap = [];
  try {
    const items = await apiClient.getItems();
    itemRoutes = (items as any[])
      .filter((i) => !!i.slug)
      .map((i) => ({
        url: `${baseUrl}/items/${i.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (_e) { /* fallback */ }

  // Trait detail pages
  let traitRoutes: MetadataRoute.Sitemap = [];
  try {
    const traits = await apiClient.getTraits();
    traitRoutes = traits
      .filter((t) => !!t.slug)
      .map((t) => ({
        url: `${baseUrl}/traits/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (_e) { /* fallback */ }

  return [...staticRoutes, ...championRoutes, ...itemRoutes, ...traitRoutes];
}


