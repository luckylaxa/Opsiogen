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

Without any keys the site still runs with the starter content, and contact-form submissions are printed in the terminal instead of being sent.

Production check: `npm run build && npm start`.

### Keys (`.env.local`)

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your live address, e.g. `https://www.opsiogen.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | sanity.io/manage → your project |
| `NEXT_PUBLIC_SANITY_DATASET` | Usually `production` |
| `SANITY_API_WRITE_TOKEN` | sanity.io/manage → API → Tokens → add token with **Editor** permission |
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | A sender on a domain verified in Resend, e.g. `Opsiogen <hello@yourdomain.com>` |
| `ENQUIRY_TO_EMAIL` | The inbox that receives enquiries (comma-separate for several) |

### Connect Sanity (once)

1. Create a project at sanity.io and copy its project ID and an Editor token into `.env.local`.
2. In sanity.io/manage → API → **CORS origins**, add `http://localhost:3000` and your live URL, each with **Allow credentials** ticked. The studio at `/studio` needs this to sign in.
3. Load the starter content and placeholder images: `npm run seed`. It never overwrites documents that already exist, so it is safe to run again.
4. Open `http://localhost:3000/studio`, sign in and start editing.

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

## Deploy from GitHub

The site is a standard Next.js app (`npm run build`, then `npm start`).

**Vercel** (use a Pro plan for a commercial site): import the GitHub repo, add the variables from `.env.local` under Settings → Environment Variables, deploy. Every push to the main branch redeploys.

**Hostinger** (Business or Cloud plan with Node.js web apps): Websites → Add website → Node.js app → connect the GitHub repo. Set Node 20+, build command `npm run build`, start command `npm start`, add the environment variables, deploy.

After the first deploy: set `NEXT_PUBLIC_SITE_URL` to the live address, add that address to Sanity CORS origins (with credentials), and point your domain at the host.

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
