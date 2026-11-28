/**
 * Parts of the site that can be switched off without deleting their code.
 *
 * `blog`: on again since 28 November 2026 with six real articles (the owner, after reading them: "after this you
 * can publish"); it was off from 26 November ("delete now blog, later we can add, keep designs in code").
 * While it is off, /blog, every post and /blog/preview answer 404, and the footer link and the sitemap entries are
 * gone. The pages, components, Studio type and starter posts (`src/content/blog.ts`) stay as they are either way.
 */
export const FEATURES = {
  blog: true,
} as const;
