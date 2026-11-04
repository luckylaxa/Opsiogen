import Link from "next/link";
import type { PostCard } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export const postDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Category pill, as the design system labels things. */
export function CategoryPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("w-fit rounded-[4px] border border-ink/25 px-[0.6em] py-[0.15em] text-small text-ink", className)}>
      {children}
    </span>
  );
}

function Meta({ post, className }: { post: PostCard; className?: string }) {
  return (
    <p className={cn("text-small text-mute", className)}>
      <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      {post.readMinutes} min read
    </p>
  );
}

/**
 * The newest post, large: the cover beside the title and excerpt (stacked on
 * phones). The whole card is the link.
 */
export function FeaturedPost({ post, priority }: { post: PostCard; priority?: boolean }) {
  return (
    <article className="group relative grid gap-[clamp(20px,2.2vw,44px)] md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center">
      <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-night">
        <Media
          image={post.cover}
          priority={priority}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col items-start">
        <CategoryPill>{post.category}</CategoryPill>
        <h2 className="mt-[clamp(16px,1.4vw,28px)] text-h2 font-medium text-balance">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h2>
        <p className="mt-[clamp(12px,1vw,20px)] max-w-[44ch] text-lead text-ink-2 text-pretty">{post.excerpt}</p>
        <Meta post={post} className="mt-[clamp(16px,1.4vw,28px)]" />
        <span className="mt-[clamp(20px,1.8vw,36px)] inline-flex items-center gap-2 text-base font-medium">
          <span className="grad-hover underline underline-offset-[0.28em]">Read article</span>
          <ArrowRight className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/** A post in the grid: cover, category and reading time, title, excerpt and date. */
export function PostTile({ post, headingAs: Heading = "h3" }: { post: PostCard; headingAs?: "h2" | "h3" }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-night">
        <Media
          image={post.cover}
          lowPriority
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
          className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-[clamp(16px,1.3vw,24px)] text-small text-mute">
        <span className="text-ink">{post.category}</span>
        <span aria-hidden="true"> · </span>
        {post.readMinutes} min read
      </p>
      <Heading className="mt-2 text-title font-medium text-balance">
        <Link href={`/blog/${post.slug}`} className="grad-hover after:absolute after:inset-0 after:content-['']">
          {post.title}
        </Link>
      </Heading>
      <p className="mt-2 line-clamp-2 text-base text-ink-2">{post.excerpt}</p>
      <p className="mt-auto pt-4 text-small text-mute">
        <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>
      </p>
    </article>
  );
}
