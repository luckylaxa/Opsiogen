# Opsiogen website

Work-led company website built with Next.js (App Router, TypeScript), Tailwind CSS, Sanity (editing studio at `/studio`), GSAP for motion and Resend for contact-form emails.

Content comes from `website-brief.md`. Until Sanity is connected the site runs on the same starter content (`src/content/seed-data.ts`), so you can review it straight away.

## Run it locally

Needs Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Without a `.env.local` the site still runs with the starter content, and contact-form submissions are printed in the terminal instead of being sent.

Production check: `npm run build && npm start`.

### Keys (`.env.local`)

`.env.example` already holds the Sanity project, dataset and enquiry inbox. Copy it to `.env.local` and add the three secrets:

| Variable | Value / where to get it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live address, e.g. `https://www.opsiogen.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `79m429dl` (already filled in) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (already filled in) |
| `SANITY_API_WRITE_TOKEN` | [sanity.io/manage → project → API → Tokens](https://www.sanity.io/manage/project/79m429dl/api#tokens) → Add API token, permission **Editor** |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | A sender on a domain verified in Resend, e.g. `Opsiogen <hello@yourdomain.com>` |
| `ENQUIRY_TO_EMAIL` | `opsiogen@gmail.com` (already filled in; comma-separate for several) |

### Sanity setup

The site uses the Sanity project **Opsiogen Marketing Website** (`79m429dl`), dataset `production`.

1. In [sanity.io/manage → project → Datasets](https://www.sanity.io/manage/project/79m429dl/datasets), check there is a dataset called `production` set to **Public**. Create it if it is missing.
2. In **API → CORS origins**, add `http://localhost:3000` with **Allow credentials** ticked (and your live address once the site is deployed). The studio at `/studio` needs this to sign in.
3. Load the starter content and placeholder images, either:
   - on your computer, with `SANITY_API_WRITE_TOKEN` in `.env.local`: `npm run seed`, or
   - on GitHub: add the token as the repository secret `SANITY_API_WRITE_TOKEN` (Settings → Secrets and variables → Actions), then Actions → **Seed Sanity** → **Run workflow**.

   Either way it never overwrites documents that already exist, so it is safe to run again.
4. Run `npm run dev`, open `http://localhost:3000/studio`, sign in and start editing.

Until the seed has run, the site shows the starter content from `src/content/seed-data.ts`.

Contact-form enquiries are saved with private IDs, so only signed-in editors can read them even though the dataset is public.

## Edit content in /studio

Go to `yourdomain.com/studio`, make the change and click **Publish**. The live site updates within about a minute.

- **Site settings**: logo, footer line, menu links, header button, email, phone, location, social links, the shared call to action, the featured project on Home, the message shown after the contact form, and default SEO and share image.
- **Pages**: Home, Work, Services, About, Contact, Privacy Policy. Each page is a list of sections (Hero, Featured project, Project grid, Services list, Short text, Promise list, Call to action) that you can add, remove and drag to reorder. To make a new page, create a Page, give it a slug and publish; it appears at `/your-slug`.
- **Projects** and **Services**: see below.
- **Enquiries**: every contact-form submission, read-only.

Layout, colours, fonts and animations are fixed in the code, so edits can't break the design.

## Add a project

1. Studio → **Projects** → **+**.
2. Fill in name (the slug fills itself), client, industry, year, services, a two-to-three-line summary and an order number (lower shows first).
3. Media tab: a cover image (4:3 or wider) and, optionally, a short muted MP4 loop. The image is the video's poster. Then four to eight gallery images, each set to **Full width** or **Half** (two halves sit side by side). Every image needs alt text.
4. Optional: a result (number + label, only if it is real) and a live site link.
5. **Publish**. It shows on Home, Work, the project page and each tagged service page. To feature it on Home, pick it in Site settings → Home.

The six starter projects are neutral placeholders: replace or delete them before launch.

## Hosting now: Vercel (free plan)

Until the Hostinger plan is bought, the site runs on the Vercel project **opsiogen** (team luckylaxas-projects), linked to this repo. Every push to `claude/admiring-einstein-4nf662` redeploys it.

- The Sanity project, dataset, API version and enquiry inbox are already set in Vercel → opsiogen → Settings → Environment Variables.
- Add `SANITY_API_WRITE_TOKEN` there (and `RESEND_API_KEY` / `RESEND_FROM_EMAIL` when you have them), then redeploy: Deployments → latest → ⋯ → Redeploy.
- `NEXT_PUBLIC_SITE_URL` is optional on Vercel; the live address is picked up automatically.
- The free Hobby plan is for non-commercial use, so treat it as a preview until the move.

To move to Hostinger later, follow the next section, point the domain at Hostinger, then delete the Vercel project.

## Deploy on Hostinger

The site runs as a Node.js web app (a Business or Cloud plan). It is a standard Next.js server app: `npm run build`, then `next start`, which listens on the port Hostinger gives it.

1. hPanel → **Websites** → **Add website** → **Node.js Apps**.
2. Choose **Import Git repository**, connect GitHub and pick `luckylaxa/Opsiogen`, branch `claude/admiring-einstein-4nf662` (or `main` once that branch is merged).
   No GitHub? Choose the ZIP upload instead and upload a ZIP of this folder **without** `node_modules`, `.next` and `.env.local`.
3. Check the build settings Hostinger fills in:

   | Setting | Value |
   | --- | --- |
   | Framework | Next.js |
   | Node.js version | 22.x (20.x also works; 18.x does not) |
   | Build command | `npm run build` |
   | Output directory | `.next` |

4. **Environment variables**: add these before the first deploy. Values starting `NEXT_PUBLIC_` are baked in during the build, so if you change one later, redeploy.

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | The live address, e.g. `https://www.opsiogen.com` (used for SEO links, the sitemap and the contact form's security check) |
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | `79m429dl` |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |
   | `NEXT_PUBLIC_SANITY_API_VERSION` | `2026-02-01` |
   | `SANITY_API_WRITE_TOKEN` | Your Sanity Editor token (saves enquiries to the studio) |
   | `RESEND_API_KEY` | From resend.com → API Keys (emails each enquiry) |
   | `RESEND_FROM_EMAIL` | A sender on a domain verified in Resend |
   | `ENQUIRY_TO_EMAIL` | `opsiogen@gmail.com` |

   On the live site the contact form needs at least the Sanity token or the two Resend values; with neither it shows an error instead of pretending to send.
5. **Deploy**. Every later push to the connected branch rebuilds and restarts the site automatically.
6. Connect your domain to the app in hPanel, then in [Sanity → API → CORS origins](https://www.sanity.io/manage/project/79m429dl/api) add the live address with **Allow credentials** ticked, so `/studio` can sign in.

Studio edits reach the live site within a minute; no redeploy is needed for content.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run seed` | Load the starter content into Sanity |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm run placeholders` | Regenerate the neutral placeholder images (needs Python with Pillow, and ffmpeg) |

## Where things live

- `src/app/(site)` – pages; `src/app/(studio)/studio` – the embedded studio
- `src/components` – header, dock, footer, sections, cards, form
- `src/sanity/schemaTypes` – CMS content model; `src/sanity/structure.ts` – studio menu
- `src/lib/data.ts` – content fetching (60-second refresh) and the starter-content fallback
- `src/app/globals.css` – design tokens (colours, type scale, spacing)
