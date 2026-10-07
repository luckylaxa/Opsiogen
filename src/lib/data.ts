import "server-only";
import { cache } from "react";
import type { QueryParams } from "next-sanity";
import { getClient } from "@/sanity/lib/client";
import { REVALIDATE_SECONDS } from "@/sanity/env";
import {
  PAGE_QUERY,
  PAGE_SLUGS_QUERY,
  PROJECTS_QUERY,
  PROJECT_QUERY,
  SERVICES_QUERY,
  SETTINGS_QUERY,
  SITEMAP_QUERY,
} from "@/sanity/lib/queries";
import {
  FEATURED_PROJECT_SLUG,
  PAGES,
  PROJECTS,
  SERVICES,
  SETTINGS,
} from "@/content/seed-data";
import type { Page, Project, ProjectCard, Service, SiteSettings } from "./types";

/**
 * Fetch published content. Results are cached and refreshed every
 * REVALIDATE_SECONDS, so Studio changes reach the live site within a minute.
 * Returns undefined when no Sanity project is configured.
 */
async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T | undefined> {
  const client = getClient();
  if (!client) return undefined;
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: ["sanity"] },
  });
}

const toCard = (p: Project): ProjectCard => ({
  _id: p._id,
  name: p.name,
  slug: p.slug,
  client: p.client,
  industry: p.industry,
  year: p.year,
  services: p.services,
  cover: p.cover,
  coverVideo: p.coverVideo,
  order: p.order,
});

/** Drop null/undefined/empty values so defaults can fill the gaps. */
function present<T extends object>(obj: T | null | undefined): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)),
  ) as Partial<T>;
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const data = await sanityFetch<Partial<SiteSettings> | null>(SETTINGS_QUERY);
  const s = present(data);
  return {
    ...SETTINGS,
    ...s,
    socialLinks: s.socialLinks ?? [],
    menu: s.menu ?? SETTINGS.menu,
    headerButton: { ...SETTINGS.headerButton, ...present(s.headerButton) },
    cta: {
      heading: s.cta?.heading || SETTINGS.cta.heading,
      button: { ...SETTINGS.cta.button, ...present(s.cta?.button) },
    },
    seo: {
      ...SETTINGS.seo,
      ...present(s.seo),
      image: s.seo?.image?.url ? s.seo.image : SETTINGS.seo.image,
    },
  };
});

/** Published CMS projects that have a cover image. */
const getCmsProjects = cache(async (): Promise<ProjectCard[]> => {
  const data = await sanityFetch<ProjectCard[]>(PROJECTS_QUERY);
  return (data ?? []).filter((p) => p.cover?.url);
});

/** CMS projects, or the starter projects until the dataset has been seeded. */
export const getProjects = cache(async (): Promise<ProjectCard[]> => {
  const projects = await getCmsProjects();
  return projects.length ? projects : PROJECTS.map(toCard);
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  if ((await getCmsProjects()).length === 0) return PROJECTS.find((p) => p.slug === slug) ?? null;
  const data = await sanityFetch<Project | null>(PROJECT_QUERY, { slug });
  if (!data) return null;
  return { ...data, services: data.services ?? [], gallery: (data.gallery ?? []).filter((g) => g.url) };
});

/** CMS services, or the services from the brief until the dataset has been seeded. */
export const getServices = cache(async (): Promise<Service[]> => {
  const data = await sanityFetch<Service[]>(SERVICES_QUERY);
  return data?.length ? data : SERVICES;
});

export const getService = cache(async (slug: string): Promise<Service | null> => {
  const services = await getServices();
  return services.find((s) => s.slug === slug) ?? null;
});

function fallbackPage(slug: string): Page | null {
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) return null;
  const featured = PROJECTS.find((p) => p.slug === FEATURED_PROJECT_SLUG);
  return {
    ...page,
    sections: page.sections.map((section) =>
      section._type === "featuredProject" && !section.project && featured
        ? { ...section, project: toCard(featured) }
        : section,
    ),
  };
}

/** A page by slug. Built-in pages fall back to the starter content until they exist in the CMS. */
export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const data = await sanityFetch<Page | null>(PAGE_QUERY, { slug });
  if (data) return { ...data, sections: data.sections ?? [] };
  return fallbackPage(slug);
});

export const getPageSlugs = cache(async (): Promise<string[]> => {
  const data = await sanityFetch<string[]>(PAGE_SLUGS_QUERY);
  return data ?? PAGES.map((p) => p.slug);
});

type SitemapEntry = { slug: string; _updatedAt?: string };

export async function getSitemapData(): Promise<{
  pages: SitemapEntry[];
  projects: SitemapEntry[];
  services: SitemapEntry[];
}> {
  const data = await sanityFetch<{ pages: SitemapEntry[]; projects: SitemapEntry[]; services: SitemapEntry[] }>(SITEMAP_QUERY);
  if (data) return data;
  return {
    pages: PAGES.map((p) => ({ slug: p.slug })),
    projects: PROJECTS.map((p) => ({ slug: p.slug })),
    services: SERVICES.map((s) => ({ slug: s.slug })),
  };
}
