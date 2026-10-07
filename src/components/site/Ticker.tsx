import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ArrowUpRight } from "@/components/ui/Icons";

const REPEAT = 6;

/**
 * Announcement strip above the header, as in the reference: the shared
 * call-to-action line loops sideways. The whole strip links to its button.
 */
export function Ticker({ settings }: { settings: SiteSettings }) {
  const { heading, button } = settings.cta;
  if (!heading || !button.href) return null;

  const group = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {Array.from({ length: REPEAT }, (_, i) => (
        <li key={i} className="flex items-center gap-[0.7em] pr-[2.2em] whitespace-nowrap">
          <span className="font-semibold text-ink">{button.label}</span>
          <span className="grid size-[1.35em] place-items-center rounded-full border border-ink/60">
            <ArrowUpRight className="size-[0.8em]" strokeWidth={1.8} />
          </span>
          <span className="text-ink-2">{heading}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Link
      href={button.href}
      aria-label={`${heading} ${button.label}`}
      className="marquee-hover relative z-40 flex h-[var(--ticker-h)] items-center overflow-hidden bg-ticker text-small"
    >
      <div className="marquee [--marquee-duration:60s]">
        {group(false)}
        {group(true)}
      </div>
    </Link>
  );
}
