import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getPosts, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { breadcrumbSchema, postSchema } from "@/lib/schema";
import { BLOG } from "@/content/blog";
import { JsonLd } from "@/components/site/JsonLd";
import { Mark } from "@/components/site/Mark";
import { Media } from "@/components/ui/Media";
import { ArrowRight } from "@/components/ui/Icons";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { CategoryPill, PostTile, postDate } from "@/components/blog/PostCards";
import { PostBody, postHeadings } from "@/components/blog/PostBody";

export const revalidate = 10;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts({ includeDemo: true });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) return {};
  const meta = buildMetadata({
    title: post.title,
    description: post.excerpt,
    seo: post.seo,
    image: post.cover,
    path: `/blog/${post.slug}`,
    fallback: settings.seo.description,
  });
  // Demo posts are examples for the preview page, never for search.
  if (post.demo) meta.robots = { index: false, follow: false };
  meta.openGraph = { ...meta.openGraph, type: "article", publishedTime: post.publishedAt };
  return meta;
}

/**
 * A blog post: the way back to the blog, category, title, excerpt and byline,
 * the cover, then the text with a contents list beside it on wide screens,
 * who wrote it, more posts and the call to action.
 */
export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) notFound();

  // Demo posts sit with the other demo posts; published ones only with published ones.
  const related = (await getPosts({ includeDemo: Boolean(post.demo) }))
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);
  const headings = postHeadings(post.body);
  const blogHref = post.demo ? "/blog/preview" : "/blog";

  return (
    <>
      <JsonLd
        items={[
          postSchema(post),
          breadcrumbSchema([
            { name: BLOG.label, path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article>
        <header className="px-gutter pt-[clamp(32px,calc(2.6vw+22px),88px)]">
          <nav aria-label="Breadcrumb" className="text-small text-mute">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href={blogHref} className="link-accent">
                  {BLOG.label}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink-2">{post.category}</li>
            </ol>
          </nav>
          <div className="mt-[clamp(28px,calc(2.2vw+20px),72px)] max-w-[1100px]">
            <CategoryPill>{post.category}</CategoryPill>
            <h1 className="mt-[clamp(16px,1.4vw,28px)] text-[length:clamp(36px,calc(3.2vw+24px),92px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              {post.title}
            </h1>
            <p className="mt-[clamp(16px,1.6vw,32px)] max-w-[52ch] text-lead text-ink-2 text-pretty">{post.excerpt}</p>
            <p className="mt-[clamp(20px,1.8vw,36px)] flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-ink-2">
              <span className="font-medium text-ink">By {settings.siteTitle}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readMinutes} min read</span>
            </p>
          </div>
        </header>

        <div className="mt-[clamp(32px,calc(2.6vw+22px),88px)] px-gutter">
          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-night md:aspect-[21/10]">
            <Media image={post.cover} priority sizes="100vw" />
          </div>
        </div>

        <div className="mt-[clamp(40px,calc(3vw+28px),112px)] grid gap-y-10 px-gutter lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)_minmax(0,2fr)] lg:gap-x-gap">
          {headings.length > 1 ? (
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-[calc(var(--header-h)+24px)]">
                <p className="text-small uppercase tracking-[0.18em] text-mute">On this page</p>
                <ol className="mt-4 flex flex-col gap-3 border-l border-line">
                  {headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="link-accent -ml-px block border-l border-transparent pl-4 text-base text-ink-2 hover:border-ink hover:text-ink">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div className="min-w-0 max-w-[68ch]">
            <PostBody body={post.body} />

            <aside aria-label="About the author" className="mt-[clamp(48px,3.4vw,80px)] flex gap-5 rounded-card border border-line p-[clamp(20px,1.8vw,32px)]">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-night">
                <Mark className="size-8" />
              </span>
              <div>
                <p className="text-small uppercase tracking-[0.18em] text-mute">Written by</p>
                <p className="mt-1 text-title font-medium">{settings.siteTitle}</p>
                <p className="mt-2 text-base text-ink-2">{settings.footerLine}</p>
                <Link href="/about" className="mt-3 inline-flex items-center gap-2 text-base font-medium">
                  <span className="grad-hover underline underline-offset-[0.28em]">About us</span>
                  <ArrowRight className="size-[1.1em]" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Block>
          <div className="px-gutter">
            <div className="mb-[clamp(32px,calc(2.6vw+22px),72px)] flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2 font-medium">More from the blog</h2>
              <Link href={blogHref} className="inline-flex items-center gap-2 text-base font-medium">
                <span className="grad-hover underline underline-offset-[0.28em]">All posts</span>
                <ArrowRight className="size-[1.1em]" />
              </Link>
            </div>
            <ul className="grid gap-x-gap gap-y-[clamp(40px,3vw,64px)] sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p._id}>
                  <PostTile post={p} />
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
