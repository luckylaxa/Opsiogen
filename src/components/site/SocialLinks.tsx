import type { LinkItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Line icons for the social networks, drawn on the design system's 24px grid. */
const ICONS = {
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  x: (
    <>
      <path d="M4 4l11.7 16H20L8.3 4z" />
      <path d="M20 4l-6.6 7.5M10.6 12.6 4 20" />
    </>
  ),
  youtube: (
    <>
      <path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  behance: (
    <>
      <path d="M3 6h5a3 3 0 0 1 0 6H3zM3 12h6a3 3 0 0 1 0 6H3z" />
      <path d="M14 13.5h7a3.5 3.5 0 1 0-1 2.5M15 7h5" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
};

type Network = keyof typeof ICONS;

/** Which icon to show, from the link's address (or its label as a fallback). */
function networkFor(item: LinkItem): Network {
  const text = `${item.href} ${item.label}`.toLowerCase();
  if (text.includes("linkedin")) return "linkedin";
  if (text.includes("instagram")) return "instagram";
  if (text.includes("facebook")) return "facebook";
  if (text.includes("youtube") || text.includes("youtu.be")) return "youtube";
  if (text.includes("behance")) return "behance";
  if (text.includes("dribbble")) return "dribbble";
  if (/(^|[/.\s])x\.com|twitter/.test(text)) return "x";
  return "link";
}

/**
 * The social profiles from Site settings as icon buttons. The icon follows
 * the address, so a new profile only needs its link; on hover the line
 * drawing takes the brand gradient.
 */
export function SocialLinks({ items, className, onDark }: { items: LinkItem[]; className?: string; onDark?: boolean }) {
  if (!items.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item) => (
        <li key={item._key ?? item.href}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.label} (opens in a new tab)`}
            title={item.label}
            className={cn(
              "icon-grad grid size-11 place-items-center rounded-[var(--radius-btn)] border transition-colors duration-300",
              onDark ? "border-white/15 hover:border-white/40" : "border-line hover:border-ink/40",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5"
            >
              {ICONS[networkFor(item)]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The brand gradient as an SVG paint server, for icon strokes on hover (`.icon-grad`). */
export function BrandGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="pointer-events-none absolute">
      <defs>
        <linearGradient id="brand-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0" stopColor="#00d2ff" />
          <stop offset="0.25" stopColor="#0a4bff" />
          <stop offset="0.5" stopColor="#6a00f0" />
          <stop offset="0.75" stopColor="#c800c8" />
          <stop offset="1" stopColor="#ff1a8c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
