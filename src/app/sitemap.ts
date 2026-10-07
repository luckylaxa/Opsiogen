import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { pages, projects, services } = await getSitemapData();
  const entry = (path: string, updated?: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: updated ? new Date(updated) : undefined,
    changeFrequency: "weekly",
    priority,
  });

  return [
    ...pages.map((p) => entry(p.slug === "home" ? "/" : `/${p.slug}`, p._updatedAt, p.slug === "home" ? 1 : 0.8)),
    ...services.map((s) => entry(`/services/${s.slug}`, s._updatedAt)),
    ...projects.map((p) => entry(`/work/${p.slug}`, p._updatedAt)),
  ];
}
