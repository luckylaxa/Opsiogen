/**
 * Load the starter content into Sanity.
 *
 *   npm run seed
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local.
 * Safe to run more than once: documents that already exist are left as they are,
 * so it never overwrites edits made in the studio.
 */
import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient, type SanityClient } from "@sanity/client";
import {
  FEATURED_PROJECT_SLUG,
  PAGES,
  PROJECTS,
  SERVICES,
  SETTINGS,
} from "../src/content/seed-data";

nextEnv.loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local first.");
  process.exit(1);
}

const client: SanityClient = createClient({ projectId, dataset, token, apiVersion: "2026-02-01", useCdn: false });
const PUBLIC_DIR = path.join(process.cwd(), "public");
const uploaded = new Map<string, string>();

async function upload(kind: "image" | "file", publicPath: string) {
  const cached = uploaded.get(publicPath);
  if (cached) return cached;
  const file = path.join(PUBLIC_DIR, publicPath);
  const asset = await client.assets.upload(kind, fs.createReadStream(file), {
    filename: path.basename(file),
  });
  uploaded.set(publicPath, asset._id);
  console.log(`  uploaded ${publicPath}`);
  return asset._id;
}

async function image(publicPath: string, alt: string, extra: Record<string, unknown> = {}) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: await upload("image", publicPath) },
    alt,
    ...extra,
  };
}

const key = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || Math.random().toString(36).slice(2, 10);
const slug = (current: string) => ({ _type: "slug", current });
const link = (l: { label: string; href: string }, k?: string) => ({ _type: "link", ...(k ? { _key: k } : {}), label: l.label, href: l.href });

async function run() {
  const tx = client.transaction();

  console.log("Services");
  for (const s of SERVICES) {
    tx.createIfNotExists({
      _id: s._id,
      _type: "service",
      name: s.name,
      slug: slug(s.slug),
      group: s.group,
      shortName: s.shortName,
      order: s.order,
      tagline: s.tagline,
      description: s.description,
      included: s.included,
      ...(s.note ? { note: s.note } : {}),
    });
  }

  console.log("Projects");
  for (const p of PROJECTS) {
    const cover = await image(p.cover.url, p.cover.alt);
    const coverVideo = p.coverVideo
      ? { _type: "file", asset: { _type: "reference", _ref: await upload("file", p.coverVideo.url) } }
      : undefined;
    const gallery = [];
    for (const g of p.gallery) gallery.push({ _key: g._key, ...(await image(g.url, g.alt, { size: g.size })) });
    tx.createIfNotExists({
      _id: p._id,
      _type: "project",
      name: p.name,
      slug: slug(p.slug),
      client: p.client,
      industry: p.industry,
      year: p.year,
      order: p.order,
      summary: p.summary,
      services: p.services.map((s) => ({
        _type: "reference",
        _key: key(s.slug),
        _ref: SERVICES.find((x) => x.slug === s.slug)!._id,
      })),
      cover,
      ...(coverVideo ? { coverVideo } : {}),
      gallery,
    });
  }

  console.log("Pages");
  for (const page of PAGES) {
    tx.createIfNotExists({
      _id: page._id,
      _type: "page",
      title: page.title,
      slug: slug(page.slug),
      sections: page.sections.map((section) => {
        const out: Record<string, unknown> = { ...section };
        delete out.project;
        if ("button" in out && out.button) out.button = link(out.button as { label: string; href: string });
        if ("link" in out && out.link) out.link = link(out.link as { label: string; href: string });
        if (section._type === "callToAction") out.shared = true;
        return out;
      }),
    });
  }

  console.log("Site settings");
  const featured = PROJECTS.find((p) => p.slug === FEATURED_PROJECT_SLUG)!;
  tx.createIfNotExists({
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: SETTINGS.siteTitle,
    footerLine: SETTINGS.footerLine,
    menu: SETTINGS.menu.map((m) => link(m, m._key)),
    headerButton: link(SETTINGS.headerButton),
    socialLinks: [],
    cta: { heading: SETTINGS.cta.heading, button: link(SETTINGS.cta.button) },
    enquirySuccessMessage: SETTINGS.enquirySuccessMessage,
    featuredProject: { _type: "reference", _ref: featured._id },
    seo: {
      title: SETTINGS.seo.title,
      description: SETTINGS.seo.description,
      image: await image(SETTINGS.seo.image!.url, SETTINGS.seo.image!.alt),
    },
  });

  await tx.commit({ visibility: "async" });
  console.log("Done. Open /studio to edit the content.");
}

run().catch((err) => {
  if (err?.statusCode === 401 || err?.statusCode === 403) {
    console.error(
      `\nSanity refused the token (${err.statusCode}). Use an API token created in this project: ` +
        `https://www.sanity.io/manage/project/${projectId}/api#tokens → Add API token → Editor.\n` +
        `Sanity said: ${err.details?.description ?? err.message}`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
