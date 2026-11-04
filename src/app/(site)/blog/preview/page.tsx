import type { Metadata } from "next";
import { getPosts, getSettings } from "@/lib/data";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";

export const revalidate = 60;

/** Kept out of search and the sitemap: it exists to see the layout with demo posts. */
export const metadata: Metadata = {
  title: "Blog preview",
  robots: { index: false, follow: false },
};

/** The blog with demo posts included, to see how the layout looks with more posts. */
export default async function BlogPreviewPage() {
  const [posts, settings] = await Promise.all([getPosts({ includeDemo: true }), getSettings()]);
  return (
    <>
      <BlogIndex
        posts={posts}
        notice={
          <p className="mx-gutter mb-[clamp(32px,2.6vw,56px)] rounded-card border border-dashed border-line px-5 py-4 text-center text-base text-ink-2">
            Preview: posts marked Demo in the Studio show only on this page. Visitors see the published posts at /blog.
          </p>
        }
      />
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
