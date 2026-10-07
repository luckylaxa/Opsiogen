export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Giant headings scale down as they get longer so they keep to 2–4 lines. */
export function giantClass(text: string) {
  const length = text.length;
  if (length <= 22) return "text-giant";
  if (length <= 46) return "text-giant-m";
  return "text-giant-l";
}

export const GROUP_LABELS = { build: "Build", grow: "Grow", create: "Create" } as const;

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** Absolute site URL for metadata, sitemap and robots. */
export function siteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
