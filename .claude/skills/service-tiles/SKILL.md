---
name: service-tiles
description: Make the "What we do" tiles and page-top images for an Opsiogen service page in the Superside style Lucky approved. Use for any service page tile, thumbnail, mockup or page-top image work, and before generating any image.
---

# Service page tiles: the approved way

The owner's rules, collected from every round of feedback. Follow all of them. Do not
experiment on the live site. Mistakes cost the owner money and trust.

## 1. What a tile must look like (Superside reference)

- **One single image per card.** The title and description sit straight on the photo,
  top left, in white. Nothing else: **no panel, no colour band, no shade, no gradient
  overlay, no glow, no blur, no frosted glass, no fade.** Not on desktop, not on phones.
- **Everything in sharp focus.** No bokeh, no depth of field, no soft or out-of-focus
  backgrounds, no haze, no vignette. Never soften or blur a screen or any part of an image.
- **A real photo scene, art directed.** A modern device in a styled setting: velvet
  armchair or sofa, wood-panelled wall, linen with crisp leaf shadows, walnut desk in sun,
  rooftop billboard, cinema or event screen, objects on velvet. Rich, deep, single-colour
  backgrounds that suit the page.
- **Variety on every page.** No two tiles on a page use the same set-up. Mix laptops,
  hand-held phones, phones lying flat, billboards, screens, objects. Laptops on one page
  face different directions (one to the left, one to the right).
- **Modern devices only.** iPhone Pro: natural titanium frame, very thin even bezels,
  pill-shaped Dynamic Island, no notch. Space-grey or silver laptops. Never an old phone.
- **Proper size and placement.** The whole device is visible (never cut by the frame
  edge in a way that hides the screen), large enough to read, and placed low and right.
- **Our own designs on the screens.** Real Opsiogen sample screens from
  `design/tiles/art/` (HTML sources in `design/tiles/screens/`). Text on screens must be
  crisp and readable. No client names, no tool or platform names, no invented claims
  (CLAUDE.md copy rules).
- **Flat cards** (like Design systems) are allowed only where Superside uses one: plain
  flat background colour, no glow, no blur, crisp edges, card low and right.

## 2. Composition (so the text never covers the device)

- Tile file: 1600 × 1200 (4:3), JPEG.
- **The device is big:** its top edge at about 33–38% of the height, filling the right
  55–60% of the width down to the bottom edge (cropped by the bottom edge is fine, never
  the screen). Above it and to its left: empty background. Do NOT ask for the device "in
  the bottom-right quarter": that made devices tiny and left a big empty gap under the text. The empty area must be mid to dark so white text reads
  without any shade.
- Desktop shows the full 4:3 image; text covers roughly the top-left 60% × 38%.
- Phones (below 640px) show a taller crop (planned 4:5, anchored right and bottom), so
  the device must still be clear of the text in the right 60% of the image.
- Before publishing, simulate both views with the real titles and descriptions
  (`design/tiles/py/sim.py`) and look at every tile. If any text touches a device, fix
  the crop. Do not publish and fix afterwards.

## 3. Making scenes (credits)

- Generator: ElevenLabs `creative_generate_image`, model `gpt-image-2.6-sunburst`,
  `generations_count: 1`, ~191 credits per image. Runway is not connected to this session.
- Check the real balance first with `account_get_usage` (character_limit − character_count)
  and quote that number. Do not estimate the balance from your own count.
- Per-page prompts live in `design/tiles/prompts/<slug>.md` so the owner can also run them
  in Runway and upload the results.
- **Ask before spending.** State the number of images, the credits and the balance left,
  and wait for a yes. Never generate test images, never retry a finished generation, never
  regenerate because of a mistake you could have caught by checking first.
- Generate all scenes for a page in one batch, then download them (host
  `elevenlabsusercontent.com` is allowed in the environment) into
  `design/tiles/scenes/<slug>/`.
- Prompt template (fill the brackets):

  > Crisp editorial product photograph, wide landscape, shot at f/11: everything in sharp
  > focus, no bokeh, no blur, no haze, no vignette. [SETTING, e.g. a deep emerald green
  > velvet armchair]. [DEVICE: an open space-grey laptop, screen facing [left/right] at a
  > three-quarter angle | a right hand holds the latest iPhone Pro (natural titanium frame,
  > very thin even black bezels, small pill-shaped Dynamic Island, no notch) upright].
  > Composition rule: the [device] is large: its top edge sits at one third of the frame
  > height and it fills the right 55% of the frame width down to the bottom edge, with
  > nothing in front of the screen; the top third and the left 45% of the frame are an
  > empty, flat, evenly lit, matte [deep colour] [wall/surface]. The screen is completely blank, flat pure white, evenly
  > lit, no content, no reflections. No people's faces, no text, no logos.

- Scenes come out 1280 × 720. Never crop in more than about 1.4× to enlarge a device: the
  photo turns soft and blocky. Upscaling (Topaz) costs ~485 credits an image, more than a
  new scene, so get the composition right in the prompt instead.
- Nothing may sit in front of a screen (a chair arm across a laptop screen breaks the
  screen overlay).
- Look at every downloaded scene before using it.

## 4. Putting our screens on (no AI involved)

- `design/tiles/py/tile.py` → `tile(scene, art, out, fill=(top, right), radius=0)` crops the
  scene first, then puts the screen on at full resolution (use this). Older:
  `design/tiles/py/comp2.py` → `build(scene, art, out, aspect=None, radius=0, xoff=None)`
  finds the white screen, warps the design onto it in perspective, keeps the device's
  dark bezel on top, and crops 4:3. Phones: `radius=34`–`60` for screen corners.
- No softening, no blur, no inpainting (the `padtop` option blurs; do not use it).
- Screens and art: render HTML screens with `node design/tiles/screens/render.cjs`
  (edit its `jobs` list).

## 5. Publishing and checking

1. `python3 design/tiles/py/publish.py <slug> <outdir> '<json: {"tile-x.jpg": "alt"}>'`
   copies tiles into `public/services/<slug>/` and updates alt text in
   `src/content/seed-data.ts`. Alt text describes the scene and the screen.
2. `npm run typecheck`, commit, push.
3. Run the **Seed Sanity** GitHub action (mode `add`) on the branch. Wait until the push
   has finished before triggering it.
4. Code changes also need the Vercel redeploy (CLAUDE.md, staging mode).
5. Verify live: the sha1 of each new file appears in the live page HTML.
6. Screenshot the live page at desktop (1440) and phone (iPhone 13) sizes and look at
   every tile before telling the owner it is done. Send the screenshot.

## 6. Mistakes already made (do not repeat)

- Same layout for every tile; flat floating cards with cut text; empty charts.
- Text running over phones and laptops; old notched phones; tiny devices; a big empty gap
  between the text and the device; soft, over-enlarged photos.
- On phones: a black box, then a blurred band, then a colour panel under the text. The
  owner wants none of these: one image, text on it.
- Blur of any kind: image loading placeholders, frosted menus, out-of-focus scenes,
  softened screens, glow behind flat cards.
- Generating before approval, generating test images, regenerating after avoidable errors.
- Reporting "live" before checking the phone view.

## 7. Pages and status

- **Product design (`ai-product-design`): done.** Scenes `design/tiles/scenes/ai-product-design/r-*.png`,
  final tiles `tile-*.jpg` beside them. Tile settings used: laptops `fill=(0.38, 0.92–0.95)` (handoff `extend=40`);
  phones `fill=(0.36, 0.86–0.97)` with `extend=130–170` (mirrored planks or linen above, sharp)
  and `aspect=0.462` for a phone cut by the bottom edge.
- Card sizes stay as the owner set them: 10:9 on phones, 4:3 from 640px. Do not change card
  sizes. Phones crop the 4:3 tile to 10:9 from the right (hotspot x=1, y=1), so the device must
  sit fully inside the right 83% of the tile (check every tile at 10:9 before publishing). Phone text is
  sized to the screen width (title 5.8vw, description 3.5vw) and ends at about 27% of the 10:9
  card on every phone; desktop text ends at 30%. Device tops (lid or phone edge) must
  be at 35–38%. Measure with Playwright on several phones before publishing.
- Do not `extend` backgrounds with diagonal patterns (window shadows): the seam shows.
- Card code: `BigCard` `plain` (service tiles): no shade, 10:9 on phones, crop from the bottom right,
  vw-sized phone text. Only pages listed in `PLAIN_TILES` (`src/components/services/ServiceFullPage.tsx`)
  get it; every other page keeps the earlier approved card (shade, hotspot 0.74/0.8). Add a slug
  only when that page's tiles are remade in this style.
- To do, one page at a time, with approval for credits each time: MVPs and business apps,
  Automation, Social media, Digital marketing, Video, Creative subscription.
