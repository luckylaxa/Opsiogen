import { notFound } from "next/navigation";
import { CmsPage, cmsMetadata } from "@/components/CmsPage";
import { getPageSlugs } from "@/lib/data";

/** Pages added later in the CMS, served at /<slug>. */
const BUILT_IN = ["home", "work", "services", "about", "contact", "privacy"];

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return slugs.filter((s) => !BUILT_IN.includes(s)).map((s) => ({ slug: [s] }));
}

async function resolve(params: Promise<{ slug: string[] }>) {
  const { slug } = await params;
  if (slug.length !== 1 || BUILT_IN.includes(slug[0])) return null;
  return slug[0];
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">) {
  const slug = await resolve(params);
  return slug ? cmsMetadata(slug, `/${slug}`) : {};
}

export default async function Page({ params }: PageProps<"/[...slug]">) {
  const slug = await resolve(params);
  if (!slug) notFound();
  return <CmsPage slug={slug} />;
}
