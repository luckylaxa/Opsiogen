# Launch checklist: what's still pending

Last updated: 4 November 2026. Ask "what's pending" and Claude reads this file.
Tick items as they are done.

## Before moving to Hostinger (the site is a staging site until then)

- [ ] Run the full checks in CLAUDE.md: lint, types, build, `npm run audit`, Lighthouse on mobile and desktop.

## When you connect the real domain

- [ ] Connect the domain in Vercel (Project → Settings → Domains), with www or without, and redirect the other version to it.
- [ ] In Vercel, set `NEXT_PUBLIC_SITE_URL` to the live address (e.g. `https://www.opsiogen.com`), then redeploy. Canonicals, the sitemap, robots.txt and the structured data all use it.
- [ ] Add the live address in Sanity → API → CORS origins with **Allow credentials** ticked, so `/studio` can sign in.
- [ ] Check `/sitemap.xml` and `/robots.txt` on the live domain show the live address.

## Contact form

- [ ] Verify the sending domain in Resend.
- [ ] Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel, then redeploy. These aren't set yet, so enquiries are saved in the Studio but not emailed to `ENQUIRY_TO_EMAIL`.
- [ ] Send a test enquiry from the live site.

## SEO (from the checklist video)

- [ ] Add the site to Google Search Console and submit `/sitemap.xml`. Bing Webmaster Tools can import it from Search Console.
- [ ] Replace the placeholder social links (e.g. `https://www.linkedin.com/`) in Studio → Settings with the real Opsiogen profiles.
- [ ] Get backlinks: client sites, directories, guest articles, press.
- [ ] Author bio: only if a blog is added. Each post then needs an author.
- [ ] Optional: show breadcrumbs on the page. They're already in the structured data.

## Content

- [ ] 8 case studies still use sample images, which search engines treat as thin pages. Send the Figma links or hide them until they're ready: bigtapp, sandlogic, engel-volkers, amphenol, norsecom, afthab-tours, cabot-solutions, carlton-noble.
- [ ] Sifio Health: add the website UI mockups (only the app UI is in now).
- [ ] Blog: the four demo posts show only on /blog/preview. Delete them in Studio (Blog) when they're no longer needed, or untick Demo on one to publish it after rewriting it.

## Already done (4 November 2026)

- Server rendering, sitemap, robots.txt (only /studio blocked), canonicals, meta descriptions, one H1 per page.
- No noindex tags, no redirect chains, no broken internal links, a real 404 page.
- Alt text, AVIF images, no layout shift, main content in about 1s.
- Structured data: organisation, website, services, case studies, breadcrumbs and FAQs.
- Full-width desktop mockups and story text for Sifio Health, Rohde & Schwarz, Surgo Health, Care Connect, RxLive, Meetingful and Oh My Glam.
