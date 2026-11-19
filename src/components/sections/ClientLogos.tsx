import Link from "next/link";
import { getProjects } from "@/lib/data";
import { CLIENT_LOGOS } from "@/content/client-logos";
import { MarqueePause } from "./MarqueePause";

type Logo = { key: string; name: string; href: string | null; ratio: number; size: number };

/**
 * The brands we work with, as one row of client logos scrolling slowly sideways (Lucky, 19 Nov: "like Superside";
 * logos only here, never on the designs). Each logo is the client's one-colour logo in the page's ink colour, so it
 * reads in both themes. A client with a case study here opens it; the others (named in the logo map) are logos only.
 * The two kinds take turns along the row. It pauses on hover, on focus and with its pause button, and sits still in
 * rows for visitors who prefer less motion (`.marquee` in globals.css).
 * Every logo gets about the same area: a long wordmark is drawn lower, a compact mark taller.
 * The heading is in the words of Superside's, as the owner asked (19 Nov), with the owner's figure, 200+.
 */
export async function ClientLogos({ heading = "Creative support for 200+ top global brands", className = "" }: { heading?: string; className?: string }) {
  const projects = await getProjects();
  const withCase: Logo[] = projects
    .filter((p) => CLIENT_LOGOS[p.slug])
    .map((p) => ({ key: p.slug, name: p.client || p.name, href: `/work/${p.slug}`, ratio: CLIENT_LOGOS[p.slug].ratio, size: CLIENT_LOGOS[p.slug].size ?? 1 }));
  const others: Logo[] = Object.entries(CLIENT_LOGOS)
    .filter(([, l]) => l.name)
    .map(([key, l]) => ({ key, name: l.name!, href: null, ratio: l.ratio, size: l.size ?? 1 }));
  const logos: Logo[] = [];
  for (let i = 0; i < Math.max(withCase.length, others.length); i++) {
    if (withCase[i]) logos.push(withCase[i]);
    if (others[i]) logos.push(others[i]);
  }
  if (logos.length < 4) return null;

  // One scrolling row of logos (twice over, so it loops without a seam). `copy` rows are for sight only.
  const row = (list: Logo[], key: string, reverse = false) => {
    const items = (copy: boolean) =>
      list.map((l) => {
        const src = `/logos/${l.key}.svg`;
        const mark = (
          <span
            className="block bg-current"
            style={{
              height: `calc(var(--logo-h) * ${Math.min(1.4, (2 * l.size) / Math.sqrt(l.ratio)).toFixed(3)})`,
              aspectRatio: l.ratio,
              WebkitMask: `url(${src}) center / contain no-repeat`,
              mask: `url(${src}) center / contain no-repeat`,
            }}
          />
        );
        const look = "block opacity-80 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100";
        return (
          <li key={`${copy ? "b" : "a"}-${l.key}`} aria-hidden={copy || undefined} className="flex shrink-0 items-center px-[var(--logo-gap)]">
            {l.href ? (
              <Link href={l.href} scroll={false} tabIndex={copy ? -1 : undefined} aria-label={l.name} className={look}>
                {mark}
              </Link>
            ) : (
              <span role="img" aria-label={l.name} className="block opacity-80">
                {mark}
              </span>
            )}
          </li>
        );
      });
    return (
      <div key={key} className="marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        {/* About 50 px a second, whatever the number of logos. */}
        <ul
          className="marquee-track flex w-max items-center"
          style={{ "--marquee-time": `${list.length * 5}s`, animationDirection: reverse ? "reverse" : undefined } as React.CSSProperties}
        >
          {items(false)}
          {items(true)}
        </ul>
      </div>
    );
  };
  const half = Math.ceil(logos.length / 2);
  return (
    <section aria-labelledby="client-logos" className={`relative text-ink ${className}`}>
      {/* Like Superside's (19 Nov): a small heading, room under it, then the logos; two rows on desktop. */}
      <h2 id="client-logos" className="px-gutter text-center text-[length:clamp(18px,calc(0.7vw+12px),28px)] leading-snug tracking-[-0.01em] text-balance">
        {heading}
      </h2>
      <div className="mt-[clamp(40px,5.5vw,104px)] [--logo-gap:clamp(22px,2.6vw,52px)] [--logo-h:32px] lg:[--logo-gap:clamp(36px,3vw,60px)] lg:[--logo-h:clamp(26px,2vw,36px)]">
        <div className="lg:hidden">{row(logos, "one")}</div>
        <div className="hidden space-y-[clamp(40px,3.6vw,72px)] lg:block">
          {row(logos.slice(0, half), "top")}
          {row(logos.slice(half), "bottom", true)}
        </div>
      </div>
      {/* Under the rows' right end, in the space below the strip (it adds no height). */}
      <div className="absolute top-full right-0 mt-2 px-gutter">
        <MarqueePause />
      </div>
    </section>
  );
}
