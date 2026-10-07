import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { SectionRenderer, type PageLayout } from "@/components/sections/SectionRenderer";

/** A page built from CMS sections (Home, Work, Services, About, Contact, Privacy and new pages). */
export async function CmsPage({ slug, after, layout }: { slug: string; after?: React.ReactNode; layout?: PageLayout }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} after={after} layout={layout} />;
}

export async function cmsMetadata(slug: string, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPage(slug), getSettings()]);
  if (!page) return {};
  const hero = page.sections.find((s) => s._type === "hero");
  const isHome = slug === "home";
  const meta = buildMetadata({
    title: isHome ? undefined : page.title,
    description: (hero && "text" in hero && hero.text) || settings.seo.description,
    seo: page.seo,
    image: settings.seo.image,
    path,
  });
  if (isHome && !page.seo?.title) meta.title = { absolute: settings.seo.title };
  return meta;
}
