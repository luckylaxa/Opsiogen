# Launch checklist: what's still pending

Last updated: 20 November 2026. Ask "what's pending" and Claude reads this file.
Tick items as they are done.

## Before moving to Hostinger (the site is a staging site until then)

- [ ] Run the full checks in CLAUDE.md: lint, types, build, `npm run audit`, Lighthouse on mobile and desktop. (Run on the staging site on 16 November 2026, results below. Run them once more on Hostinger after the move.)
- [x] Phone speed on pagespeed.web.dev (target 97+), 17 November, after each page's main image moved to the site's own address: `/work` 97, `/services/ai-websites` 96, `/work/cabot-solutions` 96 (were 95, 90 and 94); desktop 100 on all three. A score moves a point or two between runs. Putting the styles inside each page (`inlineCss`) was tried and undone: it made phones slower.
- [x] The "View" cursor is back (25 November, the owner approved it from a picture): a dot that follows the mouse, a ring over links and buttons, a "View" disc over work; computers with a mouse only, the normal pointer for touch screens and reduced motion (`src/components/motion/Cursor.tsx`). The character's bottom is a real panel in a cut (the owner, from four reference pictures: "it has a cutting ... this bottom rack will open ... inside that cutting that light gradient light comes in"): the cut is one flat cut across the bottom of the ball, tilted back 20 degrees (the owner: "it should be very perfect cutting ... you cut straight cut ... with a slight elevation"), so it is a perfect circle on the ball: one even arc from the front, a straight, gentle rise from the side, never a bend, with the same gap all the way round (the owner: "all the side cutting gaps should be the same"); the panel is part of the same ball as the shell, so the outline stays a perfect circle (the owner: "there will be only the cutting in between the perfect circle"), with rounded edges and walls down into a dark slot, and the gradient light is inside the cut, on the panel's edge, spilling onto the panel and the walls, dark across the back; no soft halo, and the shell is shaded as a true ball (`bottomCut` in `src/lib/character3d.js`). The loader pictures, the Home still and the showreel (cut 21, with its poster) are re-rendered with it.
- [x] Home speed with the backflip loader (25 November, the owner's pagespeed.web.dev run, a first visit with the loader): phone 97, desktop 97; accessibility, best practices and SEO 100. The loader hides the page for about 1.5 s on purpose, which is what keeps desktop off 100 (100 with it skipped in our own test). On 26 November the owner's phone run showed 78: PageSpeed's test machines have no graphics chip, so when a run lasted past the six quiet seconds, the hero's 3D started and drew each frame in software, about a second each, and the page stopped answering (we reproduced it: about 60 with a longer wait). The 3D now runs only where WebGL is drawn on a graphics chip; elsewhere the still picture stays (`drawsOnGpu` in `HeroCharacter.tsx`). The owner's phone run after the fix: 97, and 100 for accessibility, best practices and SEO.
- [x] Phone speed on Home since the first-visit character intro went live (19 November): pagespeed.web.dev on 20 November (the owner's run, a first visit with the intro): phone 98, desktop 98; accessibility, best practices and SEO 100. Lighthouse in the test environment gave 97 to 99 (50 before that day's fixes). Desktop is a point under the 99 goal: what is left is the intro covering the first screen while it plays; repeat visits skip it.
- [x] Firefox (20 November): Firefox 160 from Mozilla's own package source (the owner allowed `packages.mozilla.org` in the test environment). Every page at phone, tablet and desktop widths (102 page loads) and the click-through checks: all fine. Fixed on the way: a case study's website address wrapped mid-word on phones ("cabotsolutions.co / m"); it now breaks before the ending ("cabotsolutions / .com").
- [x] Windows (20 November): Edge on Windows uses Chrome's engine, so the Chrome tests cover it; on top of that every page was checked with Windows-style scrollbars (which take page width) at 1280x720, 1366x768, 1536x864 and 1920x1080 (136 page loads, all fine), and in Windows High Contrast mode, where the client logos vanished (fixed: they now draw in the system text colour). Internet Explorer is retired by Microsoft (June 2022; Windows opens Edge instead) and is not supported, like most modern sites.
- [ ] On Hostinger, send HSTS (`Strict-Transport-Security: max-age=63072000`) from the server or proxy. Vercel adds it by itself; the other security headers are in `next.config.ts` and go wherever the site runs.
- [ ] On Hostinger, check the main images still load fast: they now come through the site's own image service (`/_next/image`), which Vercel caches worldwide and a single server does not.

## Going live: the plan agreed on 20 November 2026

Hosting: Hostinger **Unlimited** web hosting (Node.js web app), data centre **India** (most clients are in India and Dubai;
the CDN serves files to Canada, the US and Europe). The domain, **opsiogen.com**, stays at **GoDaddy**; email stays on **Google Workspace**
(3 addresses). The site's address is `https://opsiogen.com`, with `www.opsiogen.com` redirecting to it. Vercel's free plan is personal use only, so the Vercel copy is switched off once Hostinger is live.

- [x] Buy Hostinger Unlimited (48 months). In hPanel: Websites → Add website → Node.js web app → connect GitHub →
      `luckylaxa/Opsiogen`, branch `claude/admiring-einstein-4nf662` (or `main` once merged), Node 22.x, redeploy on push.
      Build `npm run build`, start `npm start`. One Hostinger plan connects to one GitHub account: keep hosted repos there.
      Done 26 November: the plan (order 1010426709) is active; the website **opsiogen.com** was made through Hostinger's API
      in the India (Mumbai) data centre (hosting account `u459929531`), and the owner linked GitHub in hPanel. The plan
      cannot change a website's main domain later, so it was set up on opsiogen.com straight away instead of a temporary
      address. Hostinger's own build failed: its build servers' Linux (glibc older than 2.29) can't run Next.js 16's
      compiler. So GitHub builds the site (`.github/workflows/hostinger.yml`, on every push to the working branch, the same
      build as the Quality check) and pushes the finished site to the `hostinger` branch; Hostinger deploys that branch on
      every push (`npm install`, the `hostinger-build` script does nothing, then `next start`). `next.config.ts` became
      `next.config.mjs` so starting the site needs no compiling.
- [ ] Environment variables in Hostinger: `NEXT_PUBLIC_SANITY_PROJECT_ID` (79m429dl), `NEXT_PUBLIC_SANITY_DATASET`
      (production), `NEXT_PUBLIC_SANITY_API_VERSION` (2026-02-01), `ENQUIRY_TO_EMAIL` (contact@opsiogen.com), `NEXT_PUBLIC_SITE_URL` (the temporary
      hostingersite.com address first, then the live domain; the contact form needs it behind Hostinger's proxy), and a new
      `SANITY_API_WRITE_TOKEN` (sanity.io/manage → API → Tokens, Editor; Vercel keeps the old one hidden).
      26 November: the six that are not secret are set (`NEXT_PUBLIC_SITE_URL` is `https://opsiogen.com` from the start,
      and `SMTP_USER` is contact@opsiogen.com). The owner adds `SMTP_PASS` and `SANITY_API_WRITE_TOKEN` in hPanel. Hostinger's
      API replaces the whole set at once, so after the owner's two are in, change variables in hPanel only.
- [ ] Test on the temporary address before the domain moves (within Hostinger's 30-day refund): build fits the plan, every
      page in Chrome, Safari and Firefox, PageSpeed, security headers, a real test enquiry.
- [ ] GoDaddy DNS: change only the website records, `@` (A record) and `www` (CNAME), to the values Hostinger shows under
      Connect domain. Do **not** change the nameservers and do not touch the MX, SPF, DKIM or verification records:
      they keep Google Workspace email working. Remove any GoDaddy forwarding or parked page on `@`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to `https://opsiogen.com`, redeploy. Canonicals, the sitemap, robots.txt and the structured
      data all use it. Redirect the www or non-www twin to it.
- [ ] Add the live address in Sanity → API → CORS origins with **Allow credentials** ticked, so `/studio` can sign in.
- [ ] Check `/sitemap.xml` and `/robots.txt` on the live domain show the live address; send HSTS from Hostinger.
- [ ] Switch off the Vercel copy (opsiogen.vercel.app) so Google sees one site.

## Contact form

- [x] Enquiry emails go out through our own Google Workspace mailbox (decided 20 November: no other email service, no DNS
      changes). Working since 20 November: 2-Step Verification on for contact@opsiogen.com, its app password is
      `SMTP_PASS` in Vercel, `SMTP_USER` is `contact@opsiogen.com`; the test enquiry arrived in the Inbox.
      At the move, add both to Hostinger too.
- [x] Enquiries go to contact@opsiogen.com (Google Workspace), decided 20 November; set in Vercel and as the code's default.
- [x] Send a test enquiry from the live site (20 November; five test enquiries named "Website test…" to delete in the Studio).

## SEO (from the checklist video)

- [ ] Add the site to Google Search Console and submit `/sitemap.xml`. Bing Webmaster Tools can import it from Search Console.
- [ ] Replace the placeholder social links (e.g. `https://www.linkedin.com/`) in Studio → Settings with the real Opsiogen profiles.
- [ ] Get backlinks: client sites, directories, guest articles, press.
- [ ] Author bio: only if a blog is added. Each post then needs an author.
- [ ] Optional: show breadcrumbs on the page. They're already in the structured data.

## Content

- [x] Privacy Policy (/privacy): the real policy replaced the placeholder on 20 November, approved by the owner (Opsiogen Pvt Ltd, Kochi, Kerala, India; contact@opsiogen.com). Update it if visitor statistics or any cookies are added later. It lives in Studio (Pages → Privacy Policy) and in `src/content/seed-data.ts`.

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
- [x] On for everyone (20 November, the owner's call): the new intro (the character jumps into the page and lands on the hero's own character) is Home's first-visit loader. Since 25 November (the owner: "Mouse hover we can keep normal mouse curser") the mouse pointer is the normal one again on every page: the character pointer, its dock and the dot cursor are removed. Phones get the intro too; reduced motion never sees it. `?intro` replays it.
- [x] The version 3 character on the site (25 November, the owner's three expressions): Home's character and the intro show it, drawn live by `src/lib/character3d.js` from `public/home/character.glb` (made by `design/hero/character/v3/webexport.py`). It smiles at rest and its ring always turns; its hands rest below the ring and float gently, and never go into the ring, the body or the ears whatever the pose (the owner, 25 November: the ring went through the hands); it waves hello when it comes alive, and it always keeps its shape (the owner: "Keep solid only"); poked it is surprised ("!!", hands on its cheeks), a press anywhere else on the first screen gets a wink and a finger gun with sparks as it sprays its colour that way, and left alone it thinks ("?", a finger on its chin, the back of the hand to us). The intro's pictures come from `design/hero/character/v3/web/intro.cjs` and `intro_pictures.py`.
- [x] New first-visit loader (25 November, the owner's idea: "character jumping in black screen and flip and fly towards audience, zoom effect open to page. No need character jumping to right side"; approved from the preview: "Video looks good. Publish it"): on a black screen the character pops in, crouches, jumps and does a backflip (pictures with motion blur), comes out of it facing the visitor, then flies at the screen and the page opens through its visor. It no longer lands on the hero's character. 1.6 s, once per visit when it starts on Home; a tap or a key skips it, reduced motion never sees it, `?intro` replays it. Three pictures in `public/intro` (`flip.webp`, `shell.webp`, `face.webp`, 76 KB together, a little under the old intro); the backdrop is pure black so the flip's pictures, drawn on black, show no square. The rules come from `design/showreel/build/intro_css.py`.
- [x] Cursor and dock concept (19 November, the owner's current direction; the two earlier cursor ideas below are set aside): the main character itself is the mouse pointer on computers, scaled down (about 36 px), with filled ripples of our colours over links and work ("View" over work). A click on empty hero space turns its eye to the spot, sprays light and changes the hero's colours (the real `hero:pulse`, as the big character does today). Its home is a dock at the lower right, where it lands after the new intro: hovering the dock brings it back at full size while a small dot points; moving away sends it back to the pointer. Concept video only, nothing on the site: `design/cursor/out/opsiogen-cursor-dock-concept.mp4` (`dock_bg.cjs`, `dock_timeline.py`, `dock_film.py`). The owner decides on the new intro (now behind `?intro=land`) together with this, for continuity.
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
| 20 November 2026 | The site before the security update (Next.js 16.4.6, Sanity 6.24, security headers) | `a3eef26` | `dpl_ADEqZjiNSoQjpW3mGZEBTUyEVvTW` |
| 20 November 2026 | The site before the landing intro and the character pointer went on for everyone (and before Safari's big titles changed to "pretty" wrapping) | `57f7d72` | `dpl_3NzvnTaYeStZXJSPhsCXBsmfG8tQ` |
| 25 November 2026 | The site before the version 3 character went onto Home, the intro and the showreel, and before the normal mouse cursor came back | `e7f7e29` | `dpl_CfQh1tzcr39koM2qDEBZihw9egbv` |
| 25 November 2026 | The site before the character's hands moved below the ring (with the hello wave and the new thinking and surprised hands) and before showreel cut 16 | `6d71192` | `dpl_FSABPGWdFhfRXEZfjcRSk64ETikw` |
| 25 November 2026 | The site before the backflip loader replaced the landing intro (showreel cut 17, the thin button ring) | `a639762` | `dpl_5tbTMAT6jKbraPShhi2WnSt1JCzd` |

## Checks run on 20 November 2026 (staging site)

- Security update: Next.js 16.4.3 to 16.4.6 (two advisories fixed), Sanity 6.18 to 6.24 and other packages within their ranges. Every response now has security headers: other sites can't frame ours, browsers don't guess file types, links to other sites carry only our domain, camera, microphone and location are off, and the "Powered by Next.js" header is gone. 18 advisories remain, all in Sanity's command-line tools (used on a computer, never by the site's visitors); no fixed version yet, check again at the next Sanity update. Contact form: one-line fields can't carry line breaks into the email.
- Browsers and devices: every sitemap page (32: 6 main pages, 10 services, 14 case studies, the blog and its post) plus /blog/preview and the 404 page; the four demo posts (linked only from /blog/preview) were checked in all three browsers too. Chrome's engine at 14 sizes from 320px phones to 2560px screens (284 page loads), and WebKit 2.52, Safari's engine, at phone, tablet and desktop widths (102 page loads; script errors checked on 68). No sideways scroll (after the 320px fixes below), no broken images or videos, alt text everywhere, one H1 each, no script errors. Click-through in both: the intro, menu, theme switch, search (header and inside the phone menu), Services menu, Work filters and Load more, project pop-up, contact form steps (nothing sent), video, back to top; in Chrome also the About photo hover, reduced motion and the light theme. Firefox was tested the same day once its download source was allowed (see the ticked item above). Not tested: real phones (emulated only).
- Fixed: on 320px phones (small or zoomed displays) the top bar's Menu button and the case-study website links pushed the page sideways.
- Speed fixes: main images inside `<picture>` (case-study covers, service and hero images with a phone version) are preloaded from the head, one per screen size; Home's showreel poster and About's founder photos load first (they are in the first screen); the hero character's 3D starts on the first move or after six quiet seconds; the client logos load after the page.
- Lighthouse in the test environment after the fixes, phone / desktop: Home 97-99 / 97-99, About 100 / 100, Services 96 / 100, AI Websites 99 / 100, AI Brand Services 98 / 100, AI Print & Collateral 97 / 100, Work 99-100 / 100, Cabot Solutions 99 / 100, Oh My Glam 100 / 100, Contact 100 / 100, Blog 100 / 100, blog post 100 / 100. Accessibility, best practices and SEO 100 on all. Same morning, before the fixes: Home 50 on a phone, Work and Cabot Solutions 93.
- Audit (`npm run audit`), lint, types and production build pass; 211 KB of JavaScript up front at most (limit 225 KB).

## Checks run on 16 November 2026 (staging site)

- Lint, types, production build and `npm run audit`: all pass. The Quality check on GitHub is green again (it had been failing on helper scripts in `design/`, now left out of lint).
- Audit of the live site: 32 pages, 32 internal links, 201 KB of JavaScript up front (limit 225 KB).
- Every page in the sitemap, plus /blog/preview and the 404 page, at phone (iPhone 13) and desktop (1440px) widths: no sideways scroll, no broken images, no image without alt text, one H1 each, no script errors.
- Working parts: phone menu, theme switch, Services menu, search, Work filters and Load more, case-study pop-up, contact form steps and its checks (no enquiry sent), 404 page, keyboard focus, videos.
- Lighthouse on 12 key pages: accessibility, best practices and SEO 100 on all, phone and desktop. Desktop performance 98 to 100. Phone performance 95 to 99 on Home, Services, About, Contact and Blog; 84 to 90 on service detail pages, Work and case studies (see the unticked item above).
- 17 November: each page's main image now comes from the site's own address, and the Work poster is requested at the width it is shown on phones.
- Speed fixes made: videos at the top of a page now wait until the page has loaded, and case-study walkthrough posters load at the right size, only for the version shown, and only when near the screen.
- Not tested: sending a real enquiry (it would save a test entry in the Studio and Resend is not set up yet).
