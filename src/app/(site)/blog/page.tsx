import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getSettings } from "@/lib/data";
import { FEATURES } from "@/lib/features";
import { buildMetadata } from "@/lib/metadata";
import { blogSchema, breadcrumbSchema } from "@/lib/schema";
import { BLOG } from "@/content/blog";
import { JsonLd } from "@/components/site/JsonLd";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  if (!FEATURES.blog) return {};
  const settings = await getSettings();
  return buildMetadata({
    title: BLOG.label,
    description: BLOG.description,
    image: settings.seo.image,
    path: "/blog",
    fallback: settings.seo.description,
  });
}

/** The blog: published posts only (demo posts show on /blog/preview). Linked from the footer. */
export default async function BlogPage() {
  if (!FEATURES.blog) notFound();
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  return (
    <>
      <JsonLd
        items={[blogSchema(`${settings.siteTitle} ${BLOG.label}`, BLOG.description, posts), breadcrumbSchema([{ name: BLOG.label, path: "/blog" }])]}
      />
      <BlogIndex posts={posts} />
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
