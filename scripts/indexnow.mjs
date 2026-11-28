/**
 * Tells the search engines that use IndexNow (Bing, Yandex, Seznam, Naver and others; they share submissions) which
 * of our pages changed, so they visit them soon instead of whenever they next crawl.
 *
 *   node scripts/indexnow.mjs          addresses whose sitemap date is in the last 26 hours (the daily run)
 *   node scripts/indexnow.mjs --all    every address in the sitemap (a first run, or after a big change)
 *
 * The key is public by design: search engines check it against public/<key>.txt on the site, which proves the
 * submission comes from the site's owner. Run by .github/workflows/indexnow.yml (daily, or by hand).
 */
const KEY = "4a4f432d5daada7ac4fb434be16b3c28";
const SITE = (process.env.SITE_URL || "https://opsiogen.com").replace(/\/$/, "");
const all = process.argv.includes("--all");
const hours = Number(process.env.INDEXNOW_HOURS || 26);

const res = await fetch(`${SITE}/sitemap.xml`);
if (!res.ok) throw new Error(`sitemap.xml answered ${res.status}`);
const xml = await res.text();
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, u]) => ({
  loc: u.match(/<loc>(.*?)<\/loc>/)?.[1],
  lastmod: u.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
}));
const since = Date.now() - hours * 3600 * 1000;
const urls = entries
  .filter((e) => e.loc && (all || (e.lastmod && Date.parse(e.lastmod) >= since)))
  .map((e) => e.loc);

console.log(`${entries.length} addresses in the sitemap; sending ${urls.length}${all ? " (all)" : ` changed in the last ${hours} hours`}.`);
if (!urls.length) process.exit(0);
urls.forEach((u) => console.log(`  ${u}`));

const ping = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
});
// 200: received. 202: received, the key is still being checked (normal on the first runs).
console.log(`IndexNow answered ${ping.status} ${ping.statusText}`);
if (ping.status !== 200 && ping.status !== 202) {
  console.log(await ping.text());
  process.exit(1);
}
