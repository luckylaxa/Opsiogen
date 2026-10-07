# Brand

- **Logo mark**: `opsiogen-mark-1024.png` is the master. The site uses a 512px copy (`src/assets/opsiogen-mark.png`) on its own in the header, phone menu and footer, on the floating menu tile, and as the slowly turning mark at the end of giant titles. Browser icons are `src/app/icon.png` and `src/app/apple-icon.png`. To replace it, swap these files at the same sizes. Uploading a logo in Studio → Site settings → Brand replaces the mark in the header, footer and menu.
- **Colours**: a neutral palette taken from the design reference. To change it, edit the tokens at the top of `src/app/globals.css`.
- **Light and dark theme**: visitors switch with the sun/moon button in the header (and in the phone menu). The site opens in the light theme and remembers a visitor’s choice on their device. Dark values live in the `[data-theme="dark"]` block in `src/app/globals.css`; dark cards, the dock and the menu look the same in both themes.

| Token | Value | Used for |
| --- | --- | --- |
| `page` | `#f8f8f8` | Page background |
| `band` | `#e9e9e9` | Hero band, light buttons |
| `ink` | `#222222` | Text, dark buttons, cards |
| `ink-2` | `#444444` | Secondary text |
| `mute` | `#6f6f6f` | Small grey text |
| `night` | `#121619` | Featured project and cover frames |

Font: Inter Tight (Google Fonts), weights 400–600.
