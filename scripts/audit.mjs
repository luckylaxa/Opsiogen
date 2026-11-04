// SEO and quality audit of a running site: every page in its sitemap, and
// every internal link on those pages. Exits 1 if anything fails.
//
// Also holds the first-load JavaScript of each page to a budget, so a heavy
// library on every page shows up here before it costs PageSpeed points.
//
// usage: npm run audit -- [base URL]   (default http://localhost:3000)
//   e.g. npm run build && npm start, then in another terminal: npm run audit

import { gzipSync } from "node:zlib";

/** Compressed JavaScript a page may load up front (about 200 KB today; React and Next alone are about 160 KB). */
const JS_BUDGET_KB = 225;

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const failures = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);

const get = async (path, opts) => fetch(base + path, { redirect: "manual", ...opts });
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const robots = await (await get("/robots.txt")).text();
if (!/Sitemap:/i.test(robots)) fail("/robots.txt", "no Sitemap line");
if (/Disallow:\s*\/\s*$/m.test(robots)) fail("/robots.txt", "blocks the whole site");

const sitemap = await (await get("/sitemap.xml")).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!pages.length) fail("/sitemap.xml", "no pages listed");

const missing = await get("/this-page-does-not-exist-audit");
if (missing.status !== 404) fail("404 page", `answers ${missing.status}, not 404`);

let maxJs = 0;
const linked = new Set();
const titles = new Map();
const jsSize = new Map();
const scriptKB = async (src) => {
  if (!jsSize.has(src)) {
    const body = Buffer.from(await (await get(src)).arrayBuffer());
    jsSize.set(src, gzipSync(body).length / 1024);
  }
  return jsSize.get(src);
};
for (const path of pages) {
  const res = await get(path);
  if (res.status !== 200) {
    fail(path, `status ${res.status}`);
    continue;
  }
  const html = await res.text();
  const head = html.slice(0, html.indexOf("</head>"));
  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const description = decode(attr(head.match(/<meta[^>]+name="description"[^>]*>/)?.[0] ?? "", "content") ?? "");
  const canonical = attr(head.match(/<link[^>]+rel="canonical"[^>]*>/)?.[0] ?? "", "href") ?? "";
  const robotsMeta = attr(head.match(/<meta[^>]+name="robots"[^>]*>/)?.[0] ?? "", "content") ?? "";
  const h1 = (html.match(/<h1[\s>]/g) || []).length;

  if (!title) fail(path, "no <title>");
  else if (title.length > 65) fail(path, `title is ${title.length} characters (keep it to 65)`);
  if (titles.has(title)) fail(path, `same title as ${titles.get(title)}`);
  titles.set(title, path);
  if (!description) fail(path, "no meta description");
  else if (description.length < 50 || description.length > 165) fail(path, `description is ${description.length} characters (50 to 165)`);
  if (!canonical) fail(path, "no canonical link");
  else if (new URL(canonical, base).pathname.replace(/\/$/, "") !== path.replace(/\/$/, "")) fail(path, `canonical points to ${canonical}`);
  if (/noindex/i.test(robotsMeta)) fail(path, "is noindex but listed in the sitemap");
  if (h1 !== 1) fail(path, `${h1} <h1> elements (needs exactly 1)`);
  if (!html.includes('type="application/ld+json"')) fail(path, "no structured data (JSON-LD)");
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt="/.test(img)) fail(path, `image without alt: ${(attr(img, "src") || "").slice(0, 80)}`);
  }
  let js = 0;
  for (const m of new Set([...html.matchAll(/<script[^>]+src="(\/_next\/[^"]+\.js)"/g)].map((m) => m[1]))) js += await scriptKB(m);
  if (js > JS_BUDGET_KB) fail(path, `${Math.round(js)} KB of JavaScript up front (budget ${JS_BUDGET_KB} KB)`);
  maxJs = Math.max(maxJs, js);
  for (const m of html.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)) {
    if (!m[1].startsWith("/_next")) linked.add(m[1].replace(/\/$/, "") || "/");
  }
}

for (const path of pages) {
  if (path !== "/" && !linked.has(path.replace(/\/$/, ""))) fail(path, "orphan page: no internal link points to it");
}
for (const link of linked) {
  const res = await get(link, { method: "HEAD" });
  if (res.status >= 300 && res.status < 400) {
    const to = res.headers.get("location") || "";
    const next = await get(new URL(to, base).pathname, { method: "HEAD" });
    if (next.status !== 200) fail(link, `redirect chain or broken redirect to ${to} (${next.status})`);
    else fail(link, `internal link redirects to ${to}: link to the final address`);
  } else if (res.status !== 200) fail(link, `internal link answers ${res.status}`);
}

console.log(`Checked ${pages.length} pages and ${linked.size} internal links. Most JavaScript up front: ${Math.round(maxJs)} KB.`);
if (failures.length) {
  console.log(`\n${failures.length} problem(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("All checks passed.");
