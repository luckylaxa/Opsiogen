/**
 * Parts of the site that can be switched off without deleting their code.
 *
 * `blog`: off since 26 November 2026 (the owner: "delete now blog, later we can add, keep designs in code").
 * While it is off, /blog, every post and /blog/preview answer 404, and the footer link and the sitemap entries are
 * gone. The pages, components, Studio type and starter posts (`src/content/blog.ts`) stay as they are: set it to
 * true to bring the whole blog back.
 */
export const FEATURES = {
  blog: false,
} as const;
