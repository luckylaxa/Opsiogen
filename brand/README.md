# Brand

The site follows the Opsiogen design system: its font, logo files and colours.

## Logo

`logo/` holds the design system's logo files exactly as supplied: the master vector, the full logo for light and dark backgrounds, one-colour versions, and the ribbon symbol (`opsiogen-symbol.png`) with its one-colour versions.

- The header, footer and phone menu show the full logo: `src/assets/opsiogen-logo-on-light.png` in the light theme and `src/assets/opsiogen-logo-on-dark.png` in the dark theme (copies of the files in `logo/`).
- The floating menu tile uses the symbol (`src/assets/opsiogen-mark.png`, a copy of `logo/opsiogen-symbol.png`), and the browser icons (`src/app/icon.png`, `src/app/apple-icon.png`) are made from it.
- A logo uploaded in Studio → Site settings → Brand replaces the full logo in the header, footer and menu.

## Font

Outfit (SIL Open Font License, licence in `src/fonts/OFL.txt`), self-hosted as one variable file, `src/fonts/Outfit-Variable.woff2`, covering weights 100–900. Giant titles use 700 with tight tracking; headings 500–600; body 400.

## Motion

From the design system: a first-visit preloader (the symbol in an orbiting arc, a gradient counter, then a wipe; once per visit), a custom cursor (a dot that becomes a ring over links and a “View” disc over work), headings that rise from a mask, cards that fade up as they scroll in, buttons that press in slightly, and links and button labels that turn into the brand gradient on hover. The cursor and preloader switch off for touch screens or for visitors who ask for reduced motion, and so does the movement.

## Navigation

The floating menu is Opsiogen’s own: one dark capsule with the symbol, the current page and a line that fills as you scroll, a Menu button that opens the full-screen menu (big numbered links, services, search, contact and social icons) and Start a project.

## Theme

Dark is the default. Visitors can switch to light with the sun/moon button, and the choice is remembered.

## Colours

Tokens live at the top of `src/app/globals.css`; dark values are in the `[data-theme="dark"]` block. The site opens in the dark theme; visitors switch with the sun/moon button in the header and menu, and the choice is remembered on their device.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `page` | `#F8F6F8` Paper | `#0A090D` Ink | Page background |
| `band` | `#EDEAED` | `#121115` | Hero band, light buttons |
| `field` | `#EDEAED` | `#1B1A1E` | Search and form fields |
| `surface` | `#FFFFFF` | `#121115` | Light cards, menus |
| `ink` | `#0A090D` | `#F8F6F8` | Text, dark buttons |
| `ink-2` | `#403F44` | `#CCC9CE` | Secondary text |
| `mute` | `#5B5A60` | `#A2A0A6` | Small grey text |
| `coal` | `#0A090D` | `#1B1A1E` | Dark cards, menu, scroll button |
| `night` | `#121115` | `#050407` | Featured project and cover frames |
| `focus` | `#D41BE8` | `#EE61FF` | Focus ring |
| `accent` | `#B800CA` | `#EE61FF` | Link hover |

The brand gradient (`--gradient-brand`: `#00D2FF → #0A4BFF → #6A00F0 → #C800C8 → #FF1A8C`) is for type only: link and button labels turn into it on hover (`.link-accent`, `.grad-hover`, `.btn-label`), social icons take it on their lines, and `.text-gradient` applies it to a display word. Never use it as a background, line or glow.

**Accent word.** Every giant title shows one word in the gradient, as in the design system (“We remove the DRAG.”). It is the last word by default; to pick another, fill in **Word in colour** on the Hero, Project grid or Services list section in Studio. Keep it to one gradient word per screen.
