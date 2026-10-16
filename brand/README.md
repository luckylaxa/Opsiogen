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

From the design system: a custom cursor (a dot that becomes a ring over links and a “View” disc over work), headings that rise from a mask, cards that fade up as they scroll in, and buttons that press in slightly. All of it switches off for touch screens and for visitors who ask for reduced motion.

## Colours

Tokens live at the top of `src/app/globals.css`; dark values are in the `[data-theme="dark"]` block. Visitors switch theme with the sun/moon button in the header and phone menu, and the choice is remembered on their device.

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

The brand gradient (`--gradient-brand`: `#00D2FF → #0A4BFF → #6A00F0 → #C800C8 → #FF1A8C`) is for type only: dark button labels turn into it on hover, and `.text-gradient` applies it to a display word. Never use it as a background, line or glow.

**Accent word.** Every giant title shows one word in the gradient, as in the design system (“We remove the DRAG.”). It is the last word by default; to pick another, fill in **Word in colour** on the Hero, Project grid or Services list section in Studio. Keep it to one gradient word per screen.
