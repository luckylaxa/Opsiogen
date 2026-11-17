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
Frame 10 (brand system) is to be replaced by video mockups of the corporate brand film, "Travel beyond
boundaries" (83 s, 16:9). The film sits in Afthab's video library, which this account cannot open, so that
frame waits for the video file or a few stills from the owner. `render.cjs` also needs
`@fontsource/ibm-plex-mono` for the mono labels.

To check with Afthab before publishing: the Meta ads show real package prices and a phone number.
