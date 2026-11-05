@AGENTS.md

# Opsiogen website: standards for every change

Every new page, section or change keeps these. `npm run audit` and the
**Quality** GitHub check enforce most of them; the rest are for review.
Launch to-dos live in `LAUNCH-CHECKLIST.md`.

## Copy
- The company is **Opsiogen**. Write as "we". Never "team", never "Fineart".
- No other company names except clients in their own case studies. No tool or
  platform names, no founder details, no free offers.
- The 7-day timeline is only for basic websites.
- Short text, no invented claims or numbers. Don't copy reference sites.

## SEO (every page)
- Server-rendered. Metadata from `buildMetadata()` (`src/lib/metadata.ts`) with
  the page's `path` (gives the canonical) and `fallback: settings.seo.description`.
- A unique title (65 characters or fewer) and a description of 50 to 165 characters.
- Exactly one `<h1>` (e.g. `GiantHeading as="h1"`); sections use h2/h3 in order.
- Listed in `src/app/sitemap.ts` and linked from somewhere on the site (no orphans).
  Internal links go to the final address (no trailing slash, no redirects).
- Structured data with `<JsonLd>` and `src/lib/schema.ts`: breadcrumbs on detail
  pages, `faqSchema` wherever FAQs show, `serviceSchema` / `projectSchema` as fitting.
  Organization and WebSite come from the layout.
- noindex only on purpose (Studio `seo.noIndex`), never on a page in the sitemap.
- Every `<img>` has `alt`: describe content images; `alt=""` only when decorative.

## Performance (PageSpeed 97+ mobile, 99+ desktop)
- Images go through `Media` (`src/components/ui/Media.tsx`): CMS images come straight
  from Sanity's CDN at the needed width, with their preview while loading.
  - `priority` on the page's main (LCP) image only. Everything below it is lazy
    (`lowPriority` for galleries): images loading alongside the main one slow it
    down on phones. Long galleries add `<LoadAhead>` (`src/components/media`), which
    starts each image about two screens ahead once the page has loaded, and skip
    the scroll fade-up (`data-reveal`) on images so they show as soon as they're in.
  - Accurate `sizes`, and a box with a fixed aspect ratio so nothing shifts.
- No new library in every page's first load. Heavy code is imported when used,
  e.g. `import("@/lib/gsap")` near the screen (see `ProcessSteps`). Prefer CSS for
  animation (see `.site-menu` in `globals.css`). `prefersReducedMotion` is in
  `src/lib/motion.ts`, so importing it loads nothing else.
- Respect `prefers-reduced-motion` in every animation.
- One font: the Latin subset of Outfit in `src/fonts`. No other font files.
- The audit holds first-load JavaScript to 225 KB compressed per page (about 200 KB today).

## Blog
- Posts are Studio documents (`post`); starter posts live in `src/content/blog.ts`.
- `/blog` is linked from the footer only, never the header or menu.
- Posts marked Demo show only on `/blog/preview` (noindex, not in the sitemap).
- Every post: a 16:10 cover with alt text, an excerpt of 50 to 160 characters, a
  category, and h2 headings (they make the contents list). Same copy rules as above.

## Before pushing
1. `npm run lint` and `npm run typecheck`.
2. `npm run build`, `npm start`, then `npm run audit` in another terminal.
3. For layout or image changes, run Lighthouse on mobile and desktop for the
   changed page, and check phone (390px) and desktop (1440px) widths.

Pushing this branch deploys production on Vercel. CMS content and images go live
through the **Seed Sanity** action (add mode).
