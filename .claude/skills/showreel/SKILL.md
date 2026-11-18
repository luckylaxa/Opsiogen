---
name: showreel
description: Create the Opsiogen showreel video (the 60-second "our work in motion" film for the Work page) from the script and plan Lucky saved on 16 Nov 2026. Use when asked to create, build, render, update or re-cut the showreel, or for its storyboard or music.
---

# Opsiogen showreel: the saved script and plan

Lucky reviewed this script and plan on 16 Nov 2026 and said: "Save this. When I ask to create
showreel you can create it." So when he asks for the showreel, build it from this file. Do not
rewrite the concept or ask him to approve the script again.

## Before building (check these first)

1. **Afthab's work goes in first.** Lucky said: "we have to put afthab work as well before video
   creation." This is most likely the Afthab Tours case study (`/work/afthab-tours`), which
   still uses sample images (see LAUNCH-CHECKLIST.md). If its real designs are not in the repo
   or the Figma files yet, ask for its Figma link and which chapter it belongs in. Do not start the video without it unless he says so.
2. **Credits need approval.** The build below needs no image or video credits. Music and any AI
   motion shot do: quote the cost and wait for a yes. He approves spend per request and wants
   `generations_count` 1.
3. **Storyboard before render.** Send one still per shot for approval, then the music options,
   then build.
4. Open points he has not answered (use the default until he does):
   - Client names or logos on the end card: **leave out** (site rule: client names stay inside
     their own case studies).
   - Made-up brands (Torvi, Oriel and the other samples): shown as our design work, **never
     labelled as clients**.

## Reference (pace and energy only, never copied)

The "Superside Showreel 2025" on superside.com/our-work, about 65 seconds:
- A new shot every half second to one second.
- Six seconds of large moving text on one flat colour to open.
- Five single-word chapter cards that split the work into groups.
- Phones, post grids, illustration, film, billboards and brand systems, never two similar shots
  in a row.
- One closing line, client names cycling, then the logo.

Lucky's rule: "dont copy same. it will look like copied." Keep our own words, layout, colours
and structure. Do not reuse their chapter words, their closing line or their lime-on-green look.

## Concept

One sentence that builds through the film, each part opening a chapter of our work:

**You bring the idea. We design it. We build it. We brand it. We launch it.**

Our colours, the Outfit font (`src/fonts`), and the Opsiogen logo (`src/assets/opsiogen-logo-on-dark.png`,
`opsiogen-logo-on-light.png`, `opsiogen-mark.png`).

## Script (60 seconds, 1920 x 1080, 30 fps)

| Time | Words on screen | What we see |
|---|---|---|
| 0:00-0:05 | "You bring the idea." then "We take it from here." | Dark screen, large type, the Opsiogen ribbon mark draws in |
| 0:05-0:07 | none | Six very fast flashes, one from each chapter, as a teaser |
| 0:07-0:09 | "We design it." | Full-screen word card |
| 0:09-0:20 | none | App and product screens: Oh My Glam's lipstick try-on, the health and meeting products, phones side by side, taps changing the screen |
| 0:20-0:22 | "We build it." | Word card |
| 0:22-0:33 | none | Websites scrolling in laptops and phones: Cabot, BigTapp, Carlton Noble and others, the Oriel laptop shot, dashboards and booking screens |
| 0:33-0:35 | "We brand it." | Word card |
| 0:35-0:46 | none | The Torvi story in five quick beats (logo drawn, colours, guidelines, posts, rider on the bike), then the SandLogic bottle, packaging, stationery and the Norsecom booth |
| 0:46-0:48 | "We launch it." | Word card |
| 0:48-0:56 | none | Social post grids, ad versions, posters, email and video frames, cut fastest of all |
| 0:56-1:00 | "Your idea. Designed. Built. Branded. Launched." then the logo and "Let's make yours." | Every cover pulls back into one wall, then the logo on dark |

Fix the exact client shot list in the storyboard from each case study's category (check
`src/content/seed-data.ts`); only the placements named above are decided.

## Copy rules (from CLAUDE.md, they apply to every word on screen)

- Write as "we". Never "team", never "Fineart".
- No company names except clients, no tool or platform names, no free offers.
- No invented claims or numbers. The 7-day timeline is only for basic websites, so no "in days"
  line over the whole reel.

## Where the shots come from

**Use the clean set first.** On 18 Nov Lucky asked for a separate Figma file for the video with every
case study design and no case study text: https://www.figma.com/design/IvBwN7mWNV3Tiod6BcZ1WT
("Opsiogen · Showreel designs", one section per chapter, one frame per client, 202 designs, no text
layers). `design/showreel/clean.py` makes the same set from `public/work/` (it cuts away the label
panels and the client name above each screen); Afthab's frames without their headings come from
`design/case-studies/afthab-tours/mock-notext.html` (`render-notext.cjs`). The storyboard is
`design/showreel/storyboard.html` (shots in `shots.json`).


- Case studies: `public/work/<client>/` (gallery mockups, and `<client>-flow.mp4` /
  `-flow-phone.mp4` screen walkthroughs, about 17 seconds each).
- Service tiles and covers: `public/services/<slug>/` (`tile-*.jpg`, `page.jpg`, `card.jpg`).
- Source designs: `design/tiles/out/` (for example `figma-brand/` for Torvi with its rider and
  bike cutouts in `ai/`, `figma-print/`, `websites/site-oriel.png`).
- Figma: tiles file `2IAvyNuE4vcPRiuFT9vwD6` (pages "Brand tiles" and "Torvi · brand"), websites
  file `c7n5PDvCibn3Fuc6t8Yvo6`. Export frames with `get_screenshot` at full size.
- Afthab's work: location to be confirmed (see above).

## How to build it

**The build lives in `design/showreel/build/`** (18 Nov): `reel.html` is the whole 60-second timeline
(`window.setT(seconds)` draws any moment), `sheet.cjs` makes check stills, `render.cjs` renders the
1,800 frames, then ffmpeg joins them. Its images are the raw designs with no mockup backgrounds:
`raw/product/` (screens exported from the product Figma files: Oh My Glam, Meetingful, RxLive, Care
Connect, Surgo), websites and brand photos from `clean.py` (into `raw/clean`), the Torvi tiles and
Afthab's creatives. `python3 clean.py raw/clean` then `python3 build/assets.py` rebuild `build/a`.

- Every shot from the sources above, animated in code: pans, zooms, sliding grids and moving
  type on an HTML page, captured frame by frame with the pre-installed Playwright Chromium and
  joined with ffmpeg. No image or video credits.
- Mockups keep the owner's rules: realistic, no glitches, no real brand logos on made-up work,
  no drop shadows on flat mockups.
- Optional, only if approved: two or three AI motion shots (for example the Torvi rider
  cycling). Quote credits first.
- Music: an original instrumental from the ElevenLabs music node (`eleven_music_v2_5`,
  instrumental, about 60 seconds), cut to the beat. Not a copyrighted song. Quote the cost,
  give two options.
- Cut on the beat; chapter cards land on the strong beats.

## Lucky's notes on the first cut (18 Nov)

- It must be **very snappy and fast**, like the reference: most shots under a second, hard cuts, quick pop-in.
- Mix the work with **short service lines** (our own service names, such as "AI Product Design & Design
  Systems"), so the same kind of screen never runs on and on.
- **Nothing blurred**: never show an image larger than its own size; product screens are exported at 2x.
- **The logo keeps its own shape**: real size (800 x 132), only fading in. No turning, scaling or redrawing.
- **Our character presents**: in the opening, on each chapter card and beside the logo at the end
  (`build/character.cjs` cuts its poses out of the live Home hero; the artwork is never redrawn).

## Music (18 Nov)

Lucky supplied two library tracks in `design/showreel/music/`: `fast-percussion.mp3` (140 beats a minute) and
`fast-dynamic-rhythmic.mp3` (134). The film's shots are whole half-beats of the track, so render it at the
track's tempo: set `REEL_QUERY` for `cuts.cjs`, `sheet.cjs` and `render.cjs` (nothing for the first track,
`?bpm=134&pad=-2` for the second), then `python3 track.py CUTS.json percussion|rhythmic OUT.wav`. track.py
starts on the track's first beat, repeats it on bar lines and puts its last hit on the logo; if the cut
changes length it says by how many half-beats to move the logo (change `pad`). The music tools had no
credits, so no generated track was used.

## The car brand (18 Nov)

Lucky asked for "the new car work" in the film: Vaelo, our made-up car brand from the Home journey designs
(Figma `U7fxv5ipzHrCeX7kmJf2bv`, exports in `design/showreel/raw/vaelo`). It runs through all four chapters
and gives "AI Automation" its picture (the test-drive booking flow). Like Torvi, it is our design work and
is never labelled as a client.

## Rule from 18 Nov: Figma first, no video work without a yes

**Read `design/showreel/EDIT-PLAN.md` first:** the reference studied frame by frame, the fresh shot list, the
stock picks (free Adobe Stock, one or two people, nothing crowded) and every decision Lucky made on 18 Nov.

Cut six was rejected and cut five restored as the current version. Before any more rendering:
1. Build the video artboards in Figma (1920 x 1080, one per shot), customised for the film from the original
   work in the Figma links Lucky gave. No case study images with their backgrounds, no service tiles, no
   sample designs he has not approved for the reel.
2. Lucky approves the artboards in Figma.
3. Only then render (he switches the model for that step).

## Lucky's notes on cut five (18 Nov)

- Variety over repeats: every design once (the closing wall aside), never a run of similar white screens.
- Do not use the case study gallery mockups (designs sitting on photo backgrounds) as they are: take the
  original work from Figma. Websites come from the sites' own films (`build/a/clips`, cut from
  `public/work/<slug>/<slug>-flow.mp4`, played frame by frame on a canvas); Cabot only once.
- Mix in brand, logo, print and video work: the SandLogic guideline and rebrand pages (Figma
  `r1PdI95t8BLarsJ9ubPMCW`, in `raw/sl`, without pages showing placeholder text or another company's name),
  Torvi, Vaelo, and our own service artwork (`design/tiles/out/figma-*`). Afthab only a little.
- Do not redesign client screens (no recoloured versions).
- Do not use the hero concept renders (character line-up, ribbon and lobby scenes) as illustration. New
  illustration only if made for this, otherwise none.

## Cut 7 (18 Nov): how the motion is built

The motion language is in `design/showreel/EDIT-PLAN.md` ("Cut 7"). Everything below is in `design/showreel/build`:
1. `node frames.cjs OUT` saves the approved stills, one per shot (the walls reuse them). They never move.
2. `python3 film.py OUT ../out/opsiogen-showreel-vN.mp4` makes the film. `render-anim.cjs` draws every still shot
   frame by frame from `frames.html` (address `#i|OUT|under|anim`: the motion block at its end runs only then), each
   one revealing itself over the true last frame of the shot before; `|alpha` draws only the character, which is
   laid over the stock clips it joins (`OVER` in film.py). Stock clips get a punch-in, or the push up after a
   chapter card. Cuts land on the 140 bpm beat and `track.py` puts the track's last hit on the logo.
3. The character: `character.cjs` cuts its poses from the live Home hero into `a/ch-*.png` (never redrawn);
   `ball.py` splits each into the ball and its glow, all one size (`a/ball-*.png`). Since cut 10 the moving shots
   draw it live from the hero's 3D model instead (`character3d.js` loads `public/home/character.glb` with three.js
   from `node_modules`, with the hero's studio, lights and materials): it turns right round, tilts, looks about and
   blinks its light, and never changes shape. `ch3d-test.html` draws six poses side by side as a quick check.
   `pieces.py` finds the separate pieces in flat-colour images (`a/pieces.js`) so each can move on its own;
   `screens.py` lifts the screens out of the latest case-study designs (`a/scr-*.jpg`, `a/screens.js`) for the
   single-screen shots, pairs and walls, cut past the design's frame with clean corners (no lines at the edges);
   `clean_panels.py` paints the tile colour left round the phones and cards of the service artwork frames
   (`a/svc-*.jpg`) in the frame's colour, then `pieces.py` runs again; `logo.py` builds the logo for the end (`a/logo.js`, `a/logo-ring.png`), sharp
   however large it is shown. `build/a` is not in git; these scripts rebuild it.

## What to deliver

1. The 60-second film with sound.
2. A short silent loop for the Work page, so the page stays fast.
3. Optional vertical cut for social, only if asked.

## Publishing

The Work page reel is the `showreel` section in `src/content/seed-data.ts`:
`/work/showreel.mp4`, `/work/showreel.webm` and the poster `/work/showreel.jpg` (1920 x 1080, with
alt text). Since 18 Nov (Lucky: "for time being you can put this video in website") it is the whole
showreel with its music (now cut 11): the card plays it muted and shows a sound button (`sound: true`), and is
16:9 on phones too, so no edge of the film is cut. Web copies: H.264 CRF 26 with AAC (about 19 MB)
and VP9 CRF 36 with Opus (about 20 MB). The poster is the burst grid with our character facing us.
To change it, replace the three files under the same names (add mode swaps a re-made video card
in while Studio still holds the seeded file), update the poster alt, then follow "Staging mode"
in CLAUDE.md (typecheck, commit, push, Seed Sanity in add mode, deploy through the Vercel API)
and check the live Work page on desktop and phone.

## Order of work

1. Confirm Afthab's work is in.
2. Storyboard: one still per shot, for approval.
3. Music options, with the credit cost.
4. Build and send for review.
5. Publish and check live.
