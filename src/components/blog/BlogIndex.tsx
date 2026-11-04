import type { PostCard } from "@/lib/types";
import { POST_CATEGORIES } from "@/lib/types";
import { BLOG } from "@/content/blog";
import { GiantHeading } from "@/components/ui/Headings";
import { CategoryFilter } from "./CategoryFilter";
import { FeaturedPost, PostTile } from "./PostCards";

/**
 * The blog page: the giant title, category chips (once there are posts in
 * more than one), the newest post large, then the rest three to a row.
 */
export function BlogIndex({ posts, notice }: { posts: PostCard[]; notice?: React.ReactNode }) {
  const [first, ...rest] = posts;
  const categories = POST_CATEGORIES.filter((c) => posts.some((p) => p.category === c));
  return (
    <>
      <GiantHeading
        as="h1"
        label={BLOG.label}
        labelStyle="pill"
        heading={BLOG.heading}
        text={BLOG.text}
        className="pb-[clamp(40px,calc(2.6vw+30px),88px)] pt-[clamp(48px,calc(3.4vw+35px),110px)]"
      />
      {notice}
      <div id="posts" className="px-gutter">
        {categories.length > 1 && (
          <div className="mb-[clamp(32px,calc(2.2vw+24px),72px)] flex justify-center">
            <CategoryFilter categories={categories} target="posts" />
          </div>
        )}
        {first ? (
          <>
            <div data-category={first.category}>
              <FeaturedPost post={first} priority />
            </div>
            {rest.length > 0 && (
              <>
                <h2 className="sr-only">More posts</h2>
                <ul className="mt-[clamp(48px,calc(3vw+36px),112px)] grid gap-x-gap gap-y-[clamp(40px,3vw,64px)] sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <li key={p._id} data-category={p.category}>
                      <PostTile post={p} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p className="text-center text-lead text-ink-2">New posts are on the way.</p>
        )}
      </div>
    </>
  );
}
