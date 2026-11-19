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
 */
export async function ClientLogos({ heading = "Brands we work with", className = "" }: { heading?: string; className?: string }) {
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

  const items = (copy: boolean) =>
    logos.map((l) => {
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
        <li key={`${copy ? "b" : "a"}-${l.key}`} aria-hidden={copy || undefined} className="flex shrink-0 items-center px-[clamp(22px,2.6vw,52px)]">
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
    <section aria-labelledby="client-logos" className={`text-ink ${className}`}>
      <h2 id="client-logos" className="px-gutter text-center text-[length:clamp(22px,calc(1vw+16px),40px)] leading-tight tracking-[-0.02em] text-balance">
        {heading}
      </h2>
      <div className="marquee relative mt-[clamp(28px,2.6vw,52px)] overflow-hidden [--logo-h:clamp(32px,2.8vw,52px)] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        {/* About 50 px a second, whatever the number of logos. */}
        <ul className="marquee-track flex w-max items-center" style={{ "--marquee-time": `${logos.length * 5}s` } as React.CSSProperties}>
          {items(false)}
          {items(true)}
        </ul>
      </div>
      <div className="mt-3 flex justify-end px-gutter">
        <MarqueePause />
      </div>
    </section>
  );
}
