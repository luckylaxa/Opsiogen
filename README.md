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
3. Load the starter content and images, either:
   - on your computer, with `SANITY_API_WRITE_TOKEN` in `.env.local`: `npm run seed`, or
   - on GitHub: add the token as the repository secret `SANITY_API_WRITE_TOKEN` (Settings → Secrets and variables → Actions), then Actions → **Seed Sanity** → **Run workflow**.

   By default it never overwrites edits: existing documents keep their content, and it only fills in new service fields that are still empty and adds the How we work, Comparison and Video card sections to a page that has none. To replace the starter services, case studies and the Work and Services pages with the current `src/content/seed-data.ts`, run it with `SEED_MODE=overwrite` (on GitHub, pick **overwrite** when you run the workflow). Home, About, Contact, Privacy and Site settings stay as they are, apart from the featured project and the starter share image.
4. Run `npm run dev`, open `http://localhost:3000/studio`, sign in and start editing.

Until the seed has run, the site shows the starter content from `src/content/seed-data.ts`.

Contact-form enquiries are saved with private IDs, so only signed-in editors can read them even though the dataset is public.

## Edit content in /studio

Go to `yourdomain.com/studio`, make the change and click **Publish**. The live site updates within about a minute.

- **Site settings**: logo, footer line, menu links, header button, email, phone, location, social links (each shows as an icon picked from its address; placeholders until you add yours), the shared call to action, the featured project on Home, the message shown after the contact form, and default SEO and share image.
- **Pages**: Home, Work, Services, About, Contact, Privacy Policy. Each page is a list of sections (Hero, Featured project, Project grid, Video card, Services list, Short text, Promise list, How we work, Comparison, Call to action) that you can add, remove and drag to reorder. On Work, the Video card always sits between the title and the projects: swap its MP4 (and the optional WebM copy) and poster in Studio → Pages → Work. To make a new page, create a Page, give it a slug and publish; it appears at `/your-slug`.
- **Projects** and **Services**: see below. A service with a **Page sections → Hero** image (so far AI Websites & Revamps) uses the full page: the giant title with the image in a dark frame, clients, one big statement, numbers on big cards, What we do and the work as big cards (each What we do item takes a 4:3 **Card image**), how we work and questions. Its images live in `public/services/<slug>/` until replaced in Studio. Other service pages show, in order: the hero with the service’s first project, its clients, **Why it matters** and **Benefits**, **What we do** (or **What’s included** when that is empty), its projects, the **How we work** steps and the **Comparison** table from the Services page, the service’s **Questions**, the other services in its group and the call to action.
- **Enquiries**: every contact-form submission, read-only.

Layout, colours, fonts and animations are fixed in the code, so edits can't break the design.

### Sample service page

AI Product Design & Design Systems (`/services/ai-product-design`) uses a sample layout, to review before it goes to every service: a dark hero banner with the service picture and a strip of its services, scrolling client names, why it matters, results taken from the case studies tagged with the service, the services as big cards (text on top, picture behind), why teams choose Opsiogen, how we work, a picture banner, related work and questions in two columns. The text comes from the service in Studio; its pictures are set in `src/content/service-sample.ts` for now.

## Add a project

1. Studio → **Projects** → **+**.
2. Fill in name (the slug fills itself), client, industry, location, year, services, a one-line **tagline**, a two-to-three-line summary and an order number (lower shows first).
3. Media tab: a cover image (4:3 or wider), a **card image** (a 1600 × 1200 mockup of the work that fills the big project card; keep the lower third quiet, the title sits there) and, optionally, a short muted MP4 loop. The cover is the video's poster. Then six to ten **gallery** images of the work, shown as big cards with the same margins as the rest of the site. The first is the big image under the name: wide (16:9, 2400 × 1350), shown square on phones, so keep the work in the middle. The rest: squares (1400 × 1400) set to **Half**, two per row (one per row on phones), with an optional caption. Every image needs alt text.
4. Optional: up to four **Results** (number + label, only if they are real) and a live site link.
5. **Publish**. It shows on Home, Work and each tagged service page.

A project link inside the site opens the case study as a full-screen pop-up over the current page, with previous and next buttons (or the arrow keys) and Close (or Escape, or Back) to return. Its address is the project's own, so it can be shared; opening that address shows the same case study as a full page. Case studies stay short: the name and tagline, a few facts beside the summary, results, then the work as big mockup cards and the next two projects. A project without gallery images shows its card image and cover instead.

The starter case studies come from the content document. Their covers in `public/covers` are generated title cards in the design-system style, and their card images in `public/cards` show each case-study page on a laptop and a phone: swap in real mockups of the work as you get them. Surgo Health, Care Connect, Meetingful, Rxlive, Oh My Glam, Carlton Noble and Engel & Völkers also have their tagline, location, year and results from the client case studies.

Every project shows the same **sample mockups** for now (`public/work/samples`: a wide image and eight squares with neutral screens, no names or copy). Replace them with each project's real work in Studio → Projects → Media → Gallery. The seed only swaps a gallery it wrote itself, never one changed in Studio.

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
| `npm run seed` | Load the starter content into Sanity (`SEED_MODE=overwrite npm run seed` replaces it) |
| `npm run lint` / `npm run typecheck` | Code checks |

## Where things live

- `src/app/(site)` – pages; `src/app/(studio)/studio` – the embedded studio
- `src/components` – header, dock, footer, sections, cards, form
- `src/sanity/schemaTypes` – CMS content model; `src/sanity/structure.ts` – studio menu
- `src/lib/data.ts` – content fetching (60-second refresh) and the starter-content fallback
- `src/app/globals.css` – design tokens (colours, type scale, spacing)
