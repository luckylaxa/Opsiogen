/**
 * Load the starter content into Sanity.
 *
 *   npm run seed                         add what is missing, change nothing else
 *   SEED_MODE=overwrite npm run seed     also replace the starter content
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local.
 *
 * The default is safe to run more than once: it never overwrites edits made in
 * the studio. Documents that already exist keep their content; it only fills
 * in service fields that are still empty (Why it matters, Benefits, What we do,
 * Questions and the page sections), gives What we do items their card images,
 * adds new questions, updates starter text that changed (only where it is
 * still the old text), rewrites service cards and lists that were redone
 * (only where Studio still holds the earlier seeded version), and adds the
 * How we work and Comparison sections to a page that has none, just before
 * its call to action.
 *
 * Overwrite brings existing documents in line with src/content/seed-data.ts:
 * it rewrites the services, the case studies and the Work and Services pages
 * (their SEO settings are kept), points the Home feature at the new featured
 * project, swaps the starter share image, and removes the first placeholder
 * projects and their images. Home, About, Contact, Privacy and everything else
 * in Site settings are left alone.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { createClient, type SanityClient } from "@sanity/client";
import {
  FEATURED_PROJECT_SLUG,
  PAGES,
  PROJECTS,
  RETIRED_PROJECT_IDS,
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

const OVERWRITE = process.env.SEED_MODE === "overwrite";
/** Pages whose starter content changed; overwrite replaces only these. */
const OVERWRITE_PAGES = ["page-work", "page-services"];
/** File name of the first starter share image, replaced on overwrite. */
const STARTER_SHARE_FILE = "share-default.jpg";
/** Service fields added after the first seed; add mode fills them in where empty. */
const SERVICE_FILL_IN = [
  "statement",
  "benefits",
  "offerings",
  "faqs",
  "hero",
  "clientsLabel",
  "why",
  "stats",
  "offer",
  "steps",
  "related",
];
/** Section types added after the first seed; add mode adds them to pages that lack them. */
const NEW_SECTION_TYPES = ["process", "comparison", "showreel"];

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

/**
 * Create the document if it is missing. With overwrite, also set its content
 * fields (fields not listed, such as SEO, are kept) and drop any unpublished
 * draft so the studio shows the new version.
 */
function put(
  tx: ReturnType<SanityClient["transaction"]>,
  doc: { _id: string; _type: string } & Record<string, unknown>,
  replace: boolean,
  fillIn: string[] = [],
) {
  tx.createIfNotExists(doc);
  if (!replace) {
    // Fields added to the content model since the first seed: fill them in
    // where they are still empty, without touching anything already edited.
    const missing = Object.fromEntries(fillIn.filter((f) => doc[f] !== undefined).map((f) => [f, doc[f]]));
    if (Object.keys(missing).length) tx.patch(doc._id, (p) => p.setIfMissing(missing));
    return;
  }
  const { _id, _type, ...fields } = doc;
  void _type;
  tx.patch(_id, (p) => p.set(fields));
  tx.delete(`drafts.${_id}`);
}

/** A page section as stored in Sanity, with any video and poster uploaded. */
async function sectionDoc(section: (typeof PAGES)[number]["sections"][number]) {
  const out: Record<string, unknown> = { ...section };
  delete out.project;
  if ("button" in out && out.button) out.button = link(out.button as { label: string; href: string });
  if ("link" in out && out.link) out.link = link(out.link as { label: string; href: string });
  if (section._type === "callToAction") out.shared = true;
  if (section._type === "process") out.steps = section.steps.map((st) => ({ _type: "step", ...st }));
  if (section._type === "comparison") out.rows = section.rows.map((r) => ({ _type: "comparisonRow", ...r }));
  if (section._type === "showreel") {
    const file = async (url?: string) =>
      url ? { _type: "file", asset: { _type: "reference", _ref: await upload("file", url) } } : undefined;
    out.video = await file(section.video?.url);
    out.videoWebm = await file(section.videoWebm?.url);
    out.poster = section.poster?.url ? await image(section.poster.url, section.poster.alt ?? "") : undefined;
  }
  return out;
}

/** The full page's sections for a service, with the hero image uploaded. */
async function servicePageFields(s: (typeof SERVICES)[number]) {
  const items = <T extends { _key?: string }>(type: string, list: T[] | undefined) =>
    (list ?? []).map((it, i) => ({ _type: type, _key: it._key ?? `${type}${i + 1}`, ...it }));
  const heroImage = s.hero?.image;
  const out: Record<string, unknown> = {
    hero: heroImage?.url ? { image: await image(heroImage.url, heroImage.alt) } : undefined,
    clientsLabel: s.clientsLabel ?? undefined,
    why: s.why ?? undefined,
    stats: s.stats ? { ...s.stats, items: items("stat", s.stats.items) } : undefined,
    offer: s.offer ?? undefined,
    steps: s.steps ? { ...s.steps, items: items("processStep", s.steps.items) } : undefined,
    related: s.related ?? undefined,
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
}

/**
 * Starter text that changed after an earlier seed. Add mode replaces each one
 * only while Studio still holds the old text, so edits are never overwritten.
 */
const TEXT_UPDATES: { id: string; get: string; path: string; from: string; to: string }[] = [
  { id: "service-ai-websites", get: "stats.label", path: "stats.label", from: "Why Opsiogen", to: "In numbers" },
  {
    id: "service-ai-websites",
    get: 'stats.items[_key == "s2"][0].label',
    path: 'stats.items[_key == "s2"].label',
    from: "yours: the design, the code and the content",
    to: "yours to keep",
  },
  {
    id: "service-ai-websites",
    get: 'stats.items[_key == "s3"][0].label',
    path: 'stats.items[_key == "s3"].label',
    from: "partner for strategy, design, build and support",
    to: "partner for design, build and support",
  },
  {
    id: "service-ai-websites",
    get: "offer.heading",
    path: "offer.heading",
    from: "Websites, ready to launch and convert",
    to: "Websites, ready to convert.",
  },
  { id: "service-ai-websites", get: "steps.heading", path: "steps.heading", from: "Websites, without the waiting", to: "From brief to live." },
  { id: "service-ai-websites", get: "steps.accent", path: "steps.accent", from: "waiting", to: "live" },
  { id: "service-ai-websites", get: "related.label", path: "related.label", from: "Our work", to: "Selected work" },
  { id: "service-ai-websites", get: "related.heading", path: "related.heading", from: "Websites we’ve launched", to: "Websites we’ve launched." },
];

/**
 * Service fields rewritten after an earlier seed, with a fingerprint of the
 * version that seed wrote. Add mode replaces a field only while Studio still
 * holds that version, so anything edited in Studio is kept.
 */
type RewriteField = "tagline" | "description" | "included" | "offerings";
const REWRITTEN: Record<string, Partial<Record<RewriteField, string>>> = {
  "service-ai-product-design": { included: "b400bb4a38e5b0b7", offerings: "c088904223263f40" },
  "service-ai-automation": { included: "27700bfa288ea7d3", offerings: "82442cf5d696bff6" },
  "service-ai-social-media-marketing": {
    tagline: "314bf62988787f84",
    included: "08b753003511e640",
    offerings: "1dd5365ec32d7d4c",
  },
  "service-digital-marketing": {
    description: "908cd8dfb3957f07",
    included: "a6d6c74d0dcda38f",
    offerings: "2fb6bd7f965c9af0",
  },
  "service-ai-creative-subscription": { included: "42725ef958bcbc3a", offerings: "82566a6df8643dff" },
  "service-ai-print-collateral": {
    tagline: "166e86095cb3753a",
    description: "44a5e339fac6a818",
    included: "7bd83304a281fb0b",
    offerings: "008dad8b2914b28a",
  },
  "service-ai-brand": { description: "e38268610e6c70ba", included: "dc1e7e763bac3569", offerings: "cc3622af55b24d92" },
  "service-ai-video": { included: "ea21e8287a13a897", offerings: "8af1ee88e3036c3e" },
};
const fingerprint = (field: RewriteField, value: unknown) => {
  const plain =
    field === "offerings"
      ? ((value as { title?: string | null; text?: string | null }[] | null) ?? []).map((o) => [o.title ?? "", o.text ?? ""])
      : (value ?? null);
  return createHash("sha1").update(JSON.stringify(plain)).digest("hex").slice(0, 16);
};

/**
 * Project summaries rewritten for the case-study pages, with a fingerprint of
 * the summary the earlier seed wrote. Add mode replaces a summary only while
 * Studio still holds that version.
 */
const OLD_SUMMARY: Record<string, string> = {
  "project-surgo-health": "5ec3eb80fed5063a",
  "project-care-connect": "4a4f9b2fe4f3c4f2",
  "project-meetingful": "84e0f09a30e0ca6c",
  "project-rxlive": "9086de16afb3fce9",
  "project-oh-my-glam": "888b19f9e0aedb58",
  "project-carlton-noble": "666aad01ca2c3bdc",
  "project-engel-volkers": "624cd6050552087f",
};
/** Project taglines rewritten since, with a fingerprint of the earlier one; same rule as summaries. */
const OLD_TAGLINE: Record<string, string> = {
  "project-oh-my-glam": "85d6354e90c48795",
};
/**
 * Gallery files written by seeds (1.jpg …, m1.jpg …, the shared samples
 * sample-hero.jpg, sample-1.jpg …, and the projects' own surgo-0.jpg,
 * meetingful-0.jpg, omg-0.jpg …), replaced by a project's current gallery
 * while Studio still holds them.
 */
const OLD_GALLERY_FILE = /^(m?\d+|sample-(hero|\d+)|(surgo|meetingful|omg|care|rx|rs)-(hero|\d+))\.jpg$/;
const hash = (value: unknown) => createHash("sha1").update(JSON.stringify(value ?? null)).digest("hex").slice(0, 16);

/** Card images rendered for an earlier version of the page; add mode swaps them for the current ones. */
const OLD_CARD_IMAGE = /^offer-(new|revamp|landing|saas|corporate|cms)\.jpg$/;

async function run() {
  console.log(OVERWRITE ? "Mode: overwrite starter content" : "Mode: add missing content only");
  const tx = client.transaction();

  console.log("Services");
  const existingServices = await client.fetch<
    {
      _id: string;
      tagline: string | null;
      description: string | null;
      included: string[] | null;
      offerings: { _key: string; title?: string | null; text?: string | null; file?: string | null }[] | null;
      faqKeys: string[] | null;
    }[]
  >(
    `*[_type == "service" && _id in $ids]{ _id, tagline, description, included, "offerings": offerings[]{ _key, title, text, "file": image.asset->originalFilename }, "faqKeys": faqs[]._key }`,
    { ids: SERVICES.map((s) => s._id) },
  );
  for (const s of SERVICES) {
    const offeringImages = new Map<string, Record<string, unknown>>();
    for (const o of s.offerings) {
      if (!o.image?.url || !o._key) continue;
      offeringImages.set(o._key, { image: await image(o.image.url, o.image.alt) });
    }
    const pageFields = await servicePageFields(s);
    put(
      tx,
      {
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
        note: s.note ?? "",
        statement: s.statement ?? "",
        benefits: s.benefits.map((b) => ({ _type: "benefit", _key: b._key ?? key(b.title), title: b.title, text: b.text ?? "" })),
        offerings: s.offerings.map((o) => ({
          _type: "offering",
          _key: o._key ?? key(o.title),
          title: o.title,
          text: o.text ?? "",
          ...(o._key ? offeringImages.get(o._key) : {}),
        })),
        faqs: s.faqs.map((f) => ({ _type: "faq", _key: f._key ?? key(f.question), question: f.question, answer: f.answer })),
        ...pageFields,
      },
      OVERWRITE,
      SERVICE_FILL_IN,
    );

    // Add mode: give existing What we do items their tile image, and add new
    // questions, without changing anything already there.
    const existing = existingServices.find((e) => e._id === s._id);
    if (OVERWRITE || !existing) continue;
    const rewrite = REWRITTEN[s._id];
    if (rewrite) {
      const next: Record<RewriteField, unknown> = {
        tagline: s.tagline,
        description: s.description,
        included: s.included,
        offerings: s.offerings.map((o) => ({
          _type: "offering",
          _key: o._key ?? key(o.title),
          title: o.title,
          text: o.text ?? "",
          ...(o._key ? offeringImages.get(o._key) : {}),
        })),
      };
      const set: Record<string, unknown> = {};
      const kept: RewriteField[] = [];
      for (const [field, was] of Object.entries(rewrite) as [RewriteField, string][]) {
        const current = fingerprint(field, existing[field]);
        if (current === fingerprint(field, next[field])) continue; // already up to date
        if (current === was) set[field] = next[field];
        else kept.push(field);
      }
      if (kept.length) console.log(`  kept ${s._id} ${kept.join(", ")}: edited in Studio`);
      if (Object.keys(set).length) {
        console.log(`  updating ${s._id}: ${Object.keys(set).join(", ")}`);
        tx.patch(s._id, (p) => p.set(set));
      }
      // Cards that were kept as edited keep their own images too.
      if (kept.includes("offerings")) offeringImages.clear();
    }
    for (const [k, fields] of offeringImages) {
      const current = existing.offerings?.find((o) => o._key === k);
      if (!current) continue;
      const path = `offerings[_key == "${k}"].image`;
      if (current.file && OLD_CARD_IMAGE.test(current.file)) tx.patch(s._id, (p) => p.set({ [path]: fields.image }));
      else tx.patch(s._id, (p) => p.setIfMissing({ [path]: fields.image }));
    }
    const newFaqs = s.faqs.filter((f) => f._key && !(existing.faqKeys ?? []).includes(f._key));
    if (newFaqs.length) {
      console.log(`  adding ${newFaqs.length} questions to ${s._id}`);
      tx.patch(s._id, (p) =>
        p.setIfMissing({ faqs: [] }).insert(
          "after",
          "faqs[-1]",
          newFaqs.map((f) => ({ _type: "faq", _key: f._key, question: f.question, answer: f.answer })),
        ),
      );
    }
  }

  console.log("Projects");
  const existingProjects = await client.fetch<
    {
      _id: string;
      summary: string | null;
      tagline: string | null;
      files: (string | null)[] | null;
      images: { ref: string | null; x: number | null; y: number | null; phone?: string | null }[] | null;
      coverRef: string | null;
      coverFile: string | null;
      cardRef: string | null;
      cardFile: string | null;
    }[]
  >(
    `*[_type == "project" && _id in $ids]{ _id, summary, tagline, "files": gallery[].asset->originalFilename, "images": gallery[]{ "ref": asset._ref, "x": hotspot.x, "y": hotspot.y, "phone": phone.asset._ref }, "coverRef": cover.asset._ref, "coverFile": cover.asset->originalFilename, "cardRef": cardImage.asset._ref, "cardFile": cardImage.asset->originalFilename }`,
    { ids: PROJECTS.map((p) => p._id) },
  );
  for (const p of PROJECTS) {
    const cover = await image(p.cover.url, p.cover.alt);
    const cardImage = p.cardImage?.url ? await image(p.cardImage.url, p.cardImage.alt) : undefined;
    const coverVideo = p.coverVideo
      ? { _type: "file", asset: { _type: "reference", _ref: await upload("file", p.coverVideo.url) } }
      : undefined;
    const gallery = [];
    for (const g of p.gallery) {
      const hotspot = g.hotspot ? { hotspot: { _type: "sanity.imageHotspot", ...g.hotspot, width: 1, height: 1 } } : {};
      const phone = g.phone?.url
        ? { phone: { _type: "image", asset: { _type: "reference", _ref: await upload("image", g.phone.url) } } }
        : {};
      gallery.push({ _key: g._key, ...(await image(g.url, g.alt, { size: g.size, ...hotspot, ...phone })) });
    }
    put(
      tx,
      {
        _id: p._id,
        _type: "project",
        name: p.name,
        slug: slug(p.slug),
        client: p.client,
        ...(p.industry ? { industry: p.industry } : {}),
        ...(p.year ? { year: p.year } : {}),
        ...(p.location ? { location: p.location } : {}),
        order: p.order,
        summary: p.summary,
        ...(p.tagline ? { tagline: p.tagline } : {}),
        ...(p.stats.length ? { stats: p.stats.map((st) => ({ _type: "projectStat", ...st })) } : {}),
        ...(p.liveUrl ? { liveUrl: p.liveUrl } : {}),
        services: p.services.map((s) => ({
          _type: "reference",
          _key: key(s.slug),
          _ref: SERVICES.find((x) => x.slug === s.slug)!._id,
        })),
        cover,
        ...(cardImage ? { cardImage } : {}),
        ...(coverVideo ? { coverVideo } : {}),
        gallery,
      },
      OVERWRITE,
      ["cardImage", "industry", "year", "location", "tagline", "stats"],
    );

    // Add mode: give projects their work mockups and case studies their new
    // summary, without touching a gallery or summary already edited in Studio.
    const existing = existingProjects.find((e) => e._id === p._id);
    if (OVERWRITE || !existing) continue;
    const set: Record<string, unknown> = {};
    const files = existing.files ?? [];
    // Same files, focal points and phone versions (asset ids follow the file's
    // content) mean nothing to do. Compared as tuples: the API may return keys in any order.
    const tuple = (i: { ref: string | null; x: number | null; y: number | null; phone?: string | null }) => [
      i.ref,
      i.x ?? null,
      i.y ?? null,
      i.phone ?? null,
    ];
    const images = gallery.map((g, i) => ({
      ref: g.asset._ref,
      x: p.gallery[i].hotspot?.x ?? null,
      y: p.gallery[i].hotspot?.y ?? null,
      phone: (g as { phone?: { asset: { _ref: string } } }).phone?.asset._ref ?? null,
    }));
    if (
      gallery.length &&
      files.every((f) => f && OLD_GALLERY_FILE.test(f)) &&
      JSON.stringify((existing.images ?? []).map(tuple)) !== JSON.stringify(images.map(tuple))
    ) {
      set.gallery = gallery;
    }
    if (existing.summary !== p.summary && hash(existing.summary) === OLD_SUMMARY[p._id]) set.summary = p.summary;
    if (p.tagline && existing.tagline !== p.tagline && hash(existing.tagline) === OLD_TAGLINE[p._id]) set.tagline = p.tagline;
    // A seeded cover or card image whose file has since been replaced (same name, new content).
    if (existing.coverFile === path.basename(p.cover.url) && existing.coverRef !== cover.asset._ref) set.cover = cover;
    if (cardImage && existing.cardFile === path.basename(p.cardImage!.url) && existing.cardRef !== cardImage.asset._ref) {
      set.cardImage = cardImage;
    }
    if (Object.keys(set).length) {
      console.log(`  updating ${p._id}: ${Object.keys(set).join(", ")}`);
      tx.patch(p._id, (patch) => patch.set(set));
    }
  }

  console.log("Pages");
  const existingPages = await client.fetch<{ _id: string; types: string[] | null }[]>(
    `*[_type == "page" && _id in $ids]{ _id, "types": sections[]._type }`,
    { ids: PAGES.map((p) => p._id) },
  );
  for (const page of PAGES) {
    put(
      tx,
      {
        _id: page._id,
        _type: "page",
        title: page.title,
        slug: slug(page.slug),
        sections: await Promise.all(page.sections.map(sectionDoc)),
      },
      OVERWRITE && OVERWRITE_PAGES.includes(page._id),
    );

    // Add mode: give an existing page the section types added since the first
    // seed (How we work, Comparison, Video card) if it has none, just before
    // its call to action.
    const existing = existingPages.find((p) => p._id === page._id);
    if (OVERWRITE || !existing) continue;
    const types = existing.types ?? [];
    const toAdd = page.sections.filter((sec) => NEW_SECTION_TYPES.includes(sec._type) && !types.includes(sec._type));
    if (!toAdd.length) continue;
    const items = await Promise.all(toAdd.map(sectionDoc));
    console.log(`  adding ${toAdd.map((s) => s._type).join(", ")} to ${page._id}`);
    tx.patch(page._id, (p) =>
      types.includes("callToAction")
        ? p.insert("before", 'sections[_type == "callToAction"]', items)
        : p.setIfMissing({ sections: [] }).insert("after", "sections[-1]", items),
    );
  }

  if (!OVERWRITE && TEXT_UPDATES.length) {
    const current = await client.fetch<Record<string, unknown> | null>(
      `{ ${TEXT_UPDATES.map((u, i) => `"u${i}": *[_id == "${u.id}"][0].${u.get}`).join(", ")} }`,
    );
    TEXT_UPDATES.forEach((u, i) => {
      if (current?.[`u${i}`] !== u.from) return;
      console.log(`  updating ${u.id} ${u.path}`);
      tx.patch(u.id, (p) => p.set({ [u.path]: u.to }));
    });
  }

  console.log("Site settings");
  const featured = PROJECTS.find((p) => p.slug === FEATURED_PROJECT_SLUG)!;
  const shareImage = await image(SETTINGS.seo.image!.url, SETTINGS.seo.image!.alt);
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
      image: shareImage,
    },
  });

  if (OVERWRITE) {
    const current = await client.fetch<{ shareFile?: string } | null>(
      `*[_id == "siteSettings"][0]{ "shareFile": seo.image.asset->originalFilename }`,
    );
    const settingsPatch: Record<string, unknown> = { featuredProject: { _type: "reference", _ref: featured._id } };
    if (!current?.shareFile || current.shareFile === STARTER_SHARE_FILE) settingsPatch["seo.image"] = shareImage;
    tx.patch("siteSettings", (p) => p.set(settingsPatch));

    console.log("Removing the first placeholder projects");
    // Anything still pointing at a placeholder (other than the setting patched
    // above) keeps it, so the transaction can't fail on a reference.
    const retired = await client.fetch<{ _id: string; links: number }[]>(
      `*[_id in $ids]{ _id, "links": count(*[references(^._id) && _id != "siteSettings"]) }`,
      { ids: RETIRED_PROJECT_IDS },
    );
    for (const { _id, links } of retired) {
      if (links > 0) {
        console.warn(`  kept ${_id}: another document still links to it`);
        continue;
      }
      tx.delete(_id);
      tx.delete(`drafts.${_id}`);
    }
  }

  await tx.commit({ visibility: "sync" });

  if (OVERWRITE) await removeStarterAssets();
  console.log("Done. Open /studio to edit the content.");
}

/** Delete the first placeholder images and video once nothing uses them. */
async function removeStarterAssets() {
  const starter = /^(website-revamp|product-redesign|booking-portal|lead-automation|social-campaign|product-catalogue)-(cover|\d)\.(jpg|mp4)$|^share-default\.jpg$/;
  const assets = await client.fetch<{ _id: string; originalFilename?: string; refs: number }[]>(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{ _id, originalFilename, "refs": count(*[references(^._id)]) }`,
  );
  for (const a of assets) {
    if (!a.originalFilename || !starter.test(a.originalFilename) || a.refs > 0) continue;
    try {
      await client.delete(a._id);
      console.log(`  removed ${a.originalFilename}`);
    } catch (err) {
      console.warn(`  kept ${a.originalFilename}: ${(err as Error).message}`);
    }
  }
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
