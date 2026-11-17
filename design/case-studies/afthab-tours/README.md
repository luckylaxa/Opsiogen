# Afthab Tours case study mockups (waiting for the owner's approval)

Twelve mockups for the Afthab Tours case study, in the Rohde & Schwarz gallery size (1440 x 917).
They follow Afthab's own brand guideline for social (Ink, Mist, Afthab Blue, Lime; Inter headlines with
one Playfair Display Italic accent word; flat colour, real photography) and use their real creatives.

- Figma, editable layers: https://www.figma.com/design/He1PJJM1tQZ3m8ln7Q9PEg
- Source of the creatives and the guideline: https://www.figma.com/design/tMzU0AAU0W0etPKCiEVqcM
- `mock.html` is the source of the twelve layouts; `render.cjs` renders each `.m` section at 2x into `out/`
  (it needs the Inter and Playfair Display font files: `npm i @fontsource/inter @fontsource/playfair-display`
  in a `fonts/` folder next to it).
- `cut/` holds the creatives used, `src/` the logo and its mark, `preview/` the current renders.

The website is not changed yet. After approval: export at 2x, add the gallery to the Afthab Tours
case study and replace its placeholder sample images, cover and summary.

Owner's notes so far (17 Nov): UAE Flag Day is an occasion greeting, not a seasonal campaign; the seasonal
campaign is the UAE National Day holiday packages (frame 05). The LinkedIn frames (08, 09) were redesigned
with a LinkedIn post layout and richer pages (itinerary, boarding pass, route) from Afthab's concept library.
Frame 10 (brand system) was replaced by the brand film and reels: a 16:9 player with the film's title in
its own title style and a strip of stills, and two reel phones. The film itself sits in Afthab's video
library, which this account cannot open, so the stills are their destination photos, not frames from the film.
Then the owner asked for no small texts and no shadows (to avoid an AI feel), and one standard font and
colour across the set: every frame is now Mist with an Inter headline in Ink, and nothing else around the work.
The rebuilt LinkedIn pages inside frames 08 and 09 keep Afthab's own LinkedIn type (Playfair accent, IBM Plex
Mono labels) because that is their brand. `render.cjs` also needs `@fontsource/ibm-plex-mono`.

To check with Afthab before publishing: the Meta ads show real package prices and a phone number.
