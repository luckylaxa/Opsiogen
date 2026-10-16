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

/** Advance widths of Outfit Bold capitals and marks, in em (measured without kerning). */
const CAP_WIDTHS: Record<string, number> = {
  A: 0.729, B: 0.641, C: 0.689, D: 0.754, E: 0.615, F: 0.59, G: 0.785, H: 0.73, I: 0.293,
  J: 0.532, K: 0.705, L: 0.561, M: 0.858, N: 0.738, O: 0.806, P: 0.628, Q: 0.819, R: 0.652,
  S: 0.583, T: 0.639, U: 0.702, V: 0.713, W: 1.002, X: 0.715, Y: 0.687, Z: 0.608,
  "0": 0.666, "1": 0.378, "2": 0.564, "3": 0.559, "4": 0.609, "5": 0.56, "6": 0.573, "7": 0.527,
  "8": 0.562, "9": 0.573, ",": 0.283, ".": 0.3, "’": 0.261, "'": 0.25, "‘": 0.261, '"': 0.456,
  "“": 0.487, "”": 0.487, "-": 0.462, "–": 0.568, "—": 0.867, "&": 0.691, "?": 0.499, "!": 0.286,
  ":": 0.29, ";": 0.28, "/": 0.384, "(": 0.31, ")": 0.31, "+": 0.563, "%": 0.685, $: 0.603,
  "#": 0.662, "@": 0.756,
};
const GIANT_TRACKING: Record<string, number> = { "text-giant": -0.045, "text-giant-m": -0.045, "text-giant-l": -0.04 };

/**
 * Size for a giant heading: its usual size, made smaller only when its
 * longest word would not fit the width on one line, so words never split.
 * The heading's parent must be an `@container`.
 */
export function giantSize(text: string) {
  const className = giantClass(text);
  const tracking = GIANT_TRACKING[className];
  const longest = Math.max(
    ...text.split(/\s+/).map((word) =>
      [...word.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()].reduce(
        (sum, ch) => sum + (CAP_WIDTHS[ch] ?? 0.86) + tracking,
        0,
      ),
    ),
  );
  // A little room for rounding and the last letter's overhang.
  const fit = (longest * 1.04).toFixed(3);
  return { className, style: { fontSize: `min(var(--${className}), calc(100cqw / ${fit}))` } };
}

/** Up to two initials, e.g. “Product Design” → “PD”, for round avatars. */
export function initials(text: string) {
  return text
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
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
