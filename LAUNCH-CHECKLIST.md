# Launch checklist: what's still pending

Last updated: 19 November 2026. Ask "what's pending" and Claude reads this file.
Tick items as they are done.

## Before moving to Hostinger (the site is a staging site until then)

- [ ] Run the full checks in CLAUDE.md: lint, types, build, `npm run audit`, Lighthouse on mobile and desktop. (Run on the staging site on 16 November 2026, results below. Run them once more on Hostinger after the move.)
- [x] Phone speed on pagespeed.web.dev (target 97+), 17 November, after each page's main image moved to the site's own address: `/work` 97, `/services/ai-websites` 96, `/work/cabot-solutions` 96 (were 95, 90 and 94); desktop 100 on all three. A score moves a point or two between runs. Putting the styles inside each page (`inlineCss`) was tried and undone: it made phones slower.
- [ ] Phone speed on Home since the first-visit character intro went live (19 November): not measured yet, as pagespeed.web.dev's free daily limit was used up that day. Test a first visit (the intro plays once per visit, when it starts on Home); target 97+. If it falls short, the intro's two pictures (85 KB, `public/intro`) are the first thing to look at.
- [ ] On Hostinger, check the main images still load fast: they now come through the site's own image service (`/_next/image`), which Vercel caches worldwide and a single server does not.

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

- [ ] Afthab Tours still uses sample images, which search engines treat as thin pages. Send its Figma link or hide it until it's ready.
- [ ] Case-study mockups for BigTapp and Cabot show a "Webflow" tag (a tool name) inside the images; edit the Figma frames if it should go.
- [ ] Blog: the four demo posts show only on /blog/preview. Delete them in Studio (Blog) when they're no longer needed, or untick Demo on one to publish it after rewriting it.

## Home hero (decision pending, 17 November 2026)

- [ ] First plan: the studio tour on scroll. Six rooms are drawn in one style with our designs on the screens (`design/hero/rooms-all.jpg`, made by `design/hero/rooms.py`). Waiting for the owner's yes on the direction, then the video.
- [ ] Backup plan, only after the owner confirms: keep the earlier big heading that fills the first screen and put moving work behind it. Two rows of our work tiles (images and short silent loops, mixed widths, one height) drift slowly sideways on the dark band, as on the reference the owner shared (Envato's AI video page). Use our own work and our own layout, not theirs. No image or video credits needed.
- [ ] Also tried, waiting for the owner's pick: a ribbon of our work cards that lands on a tilted board on scroll (working prototype in `design/hero/cards-proto`, no credits needed), and our own character running through the studio rooms, each room one service (`design/hero/character-lineup.png`, `character-hero-mock.jpg`; needs video credits).
- [ ] Latest direction from the owner (17 Nov): outdoors only, no studio. A floating sphere character with one glass eye flies through five outdoor worlds, one per service (`design/hero/orb-character-sheet.png`, `orb-hero-mock.jpg`, `worlds-all.jpg`). The worlds were drawn with an earlier octopus stand-in and need redrawing with the sphere. Needs video credits.
- [ ] Owner's notes on that direction (17 Nov): the character looks ahead at the location while the page scrolls and turns to face the visitor when scrolling stops (working prototype in `design/hero/orb-proto`); no logo on the character: the character is the owner's artwork shown exactly as supplied (`design/hero/character`): front view when stopped, back view while travelling, the three-quarter view for the moment between, a light-style blink, and a rainbow light tail from its back. Wrapping the views round a ball and a redrawn 3D model were both tried and rejected by the owner (17 Nov): do not redraw the character. A smooth turn needs a short turn clip made from the artwork, which needs video credits; AI-made people are acceptable in the scenes; nothing of ours is shown along the road, only at the stops; no designs on roadside screens, each location shows a service as it appears in real life (`scene-brand-cyclist.png`, `scene-booth.png`).
- [ ] Character built as a real 3D model and approved by the owner (17 Nov): `design/hero/character/model` (built by `build.py`), drawn live in `design/hero/orb-proto` (`page.html` is the source, `make.py` builds `index.html`). Still to do before it goes on the site: slim the model file (about 2.4 MB now) and load it after the first screen.
- [ ] Scroll script and scene plan for the journey, waiting for the owner's yes: `design/hero/journey-script` (the launch day of our own electric supercar, through six outdoor stops; the owner chose the car on 17 Nov, a low wedge supercar of our own design, no real maker; travel legs blur with speed and the light tail uses our colours only). Order of work is in the plan: the journey in plain colours first (no credits), then the booth stop for real.
- [ ] The car for the journey (17 Nov): 3D model built by us in `design/hero/car/model` (`build.py`) under the working name Vaelo (name not yet checked against trademarks). The owner first asked for a Lamborghini-type wedge, found the hand-built wedge did not look real, then shared a soft concept-car picture as the idea; the model is now one smooth pearl body with a glass canopy, wheels ringed with light and a light blade in our colours (`design/hero/car/hero.jpg`). The reference is another designer's concept, used for mood only, never copied. Later the same day the owner shared an advert with a green Porsche Taycan and a serif headline and asked for that font and car: the Figma headlines now use the closest serif we are free to use (DM Serif Display); the Porsche itself cannot be our brand's car, so the owner still has to choose between our own model in that mood, an original real-looking car once image credits are back, or a licensed 3D model. Car views and the launch brand designs (brand board, build-your-car page, owner app, billboard, shelter poster, social post, show stand panels) are in Figma: https://www.figma.com/design/U7fxv5ipzHrCeX7kmJf2bv. The image credits ran out on 17 Nov (they reset on 5 Dec), so the scene pictures wait for the reset or a top-up.
- [x] On staging now (17 Nov, the owner's latest direction, no paid credits needed): the Home hero is the original big centred heading and button on the page's own white or black (it follows the theme toggle), with soft pools of colour rising behind it (`src/components/sections/HeroGlow.tsx`) and our character at the lower right, drawn live (`HeroCharacter.tsx`, model in `public/home/character.glb`, loaded after the page). The character follows the pointer; a press anywhere on the first screen turns it to face the press, then it sprays a soft fog of rainbow light that way (blurred, see-through, fading with distance, as in the owner's reference) and the pools turn to the next of four colour sets from our mark; a press on the character itself gives one full turn on the spot first. Links and buttons are left alone. Checked locally at 1440px in light and dark and at 390px. Still to do: the owner's own sample of the background effect (promised, not yet received), a real phone check and PageSpeed on the new hero.
- [ ] Parked (17 Nov): the scroll journey with the concept car brand Vaelo. Tried on staging the same day: a coast road, a café, the show stand with the car, and a brand launch pavilion carrying our Figma brand designs, with points the character looked at and explained, and a rainbow speed trail on scroll. The scenes and build script are kept in `design/hero/car/scenes`; the journey code is still in `Hero.tsx` (`HeroJourney`) and `HeroCharacter.tsx`, unused. It needs video credits and a trademark check on the name Vaelo before it comes back.
- [ ] Live preview to try (19 November): on a computer, open `/?preview=character`. It plays the new intro and turns on the character pointer and its dock for the rest of the visit (sessionStorage `op-cursor`; a new tab is a new visit). Waiting for the owner's feedback, then the decision on the intro and the pointer together.
- [ ] Cursor and dock concept (19 November, the owner's current direction; the two earlier cursor ideas below are set aside): the main character itself is the mouse pointer on computers, scaled down (about 36 px), with filled ripples of our colours over links and work ("View" over work). A click on empty hero space turns its eye to the spot, sprays light and changes the hero's colours (the real `hero:pulse`, as the big character does today). Its home is a dock at the lower right, where it lands after the new intro: hovering the dock brings it back at full size while a small dot points; moving away sends it back to the pointer. Concept video only, nothing on the site: `design/cursor/out/opsiogen-cursor-dock-concept.mp4` (`dock_bg.cjs`, `dock_timeline.py`, `dock_film.py`). The owner decides on the new intro (now behind `?intro=land`) together with this, for continuity.
- [ ] Cursor concept (19 November), waiting for the owner's decision: on a computer with a mouse, the main character opens its underside (the base panel slides back round the body, light comes down) and lowers a mini of itself, which rolls out and flies to the pointer to become the cursor (about 36 px; over links, ripples in our colours instead of today's ring; on a click, it turns its eye down to what it clicks and sprays the main character's rainbow colours onto it, then turns back). A second version, the owner's idea (the latest; `concept_timeline.py` now makes this one): the mini floats beside the pointer as a guide, below right at rest and swinging round behind it while it moves, and a beam of light from its eye is the pointer, ending in a small bright dot with a halo of our colours; the ripples and the click's spray come from that dot (`opsiogen-cursor-guide-*.mp4`; the first version's videos are `opsiogen-cursor-concept-*.mp4`). Concept renders only, nothing on the site: `design/cursor` (`door3d.js`, `concept_timeline.py`), board and two videos in `design/cursor/out`. The character's file stays unchanged: the door is the model's own base panel, moved only while it is open, and with it shut the renders match today's pixel for pixel.
- Home today shows the trial picture of the glass studio (day in the light theme, night in the dark theme).

## Already done (4 November 2026)

- Server rendering, sitemap, robots.txt (only /studio blocked), canonicals, meta descriptions, one H1 per page.
- No noindex tags, no redirect chains, no broken internal links, a real 404 page.
- Alt text, AVIF images, no layout shift, main content in about 1s.
- Structured data: organisation, website, services, case studies, breadcrumbs and FAQs.
- Full-width desktop mockups and story text for Sifio Health, Rohde & Schwarz, Surgo Health, Care Connect, RxLive, Meetingful and Oh My Glam.

## Restore points

To go back to one of these, ask Claude to "restore the site to the <date> restore point". Two ways, both keep later work in history:
the code is put back from the commit and redeployed, or the listed Vercel deployment is promoted again (instant).
Text and images edited in the Studio are not part of a restore point; the starter content in `src/content` is.

| Date | What it is | Commit | Vercel deployment |
|---|---|---|---|
| 17 November 2026 | The site before the lake studio picture went into the home hero | `78173a2` | `dpl_2N9PwFHHn7pkG12SH1VE3G8R5fAR` |
| 19 November 2026 | The site before the character intro replaced the counter loader on Home | `4798c48` | `dpl_CHR5etUb64E5GCQSfpF8np5WUhbK` |

## Checks run on 16 November 2026 (staging site)

- Lint, types, production build and `npm run audit`: all pass. The Quality check on GitHub is green again (it had been failing on helper scripts in `design/`, now left out of lint).
- Audit of the live site: 32 pages, 32 internal links, 201 KB of JavaScript up front (limit 225 KB).
- Every page in the sitemap, plus /blog/preview and the 404 page, at phone (iPhone 13) and desktop (1440px) widths: no sideways scroll, no broken images, no image without alt text, one H1 each, no script errors.
- Working parts: phone menu, theme switch, Services menu, search, Work filters and Load more, case-study pop-up, contact form steps and its checks (no enquiry sent), 404 page, keyboard focus, videos.
- Lighthouse on 12 key pages: accessibility, best practices and SEO 100 on all, phone and desktop. Desktop performance 98 to 100. Phone performance 95 to 99 on Home, Services, About, Contact and Blog; 84 to 90 on service detail pages, Work and case studies (see the unticked item above).
- 17 November: each page's main image now comes from the site's own address, and the Work poster is requested at the width it is shown on phones.
- Speed fixes made: videos at the top of a page now wait until the page has loaded, and case-study walkthrough posters load at the right size, only for the version shown, and only when near the screen.
- Not tested: sending a real enquiry (it would save a test entry in the Studio and Resend is not set up yet).
