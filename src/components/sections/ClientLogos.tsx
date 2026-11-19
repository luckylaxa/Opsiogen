import Link from "next/link";
import { getProjects } from "@/lib/data";
import { CLIENT_LOGOS } from "@/content/client-logos";
import { MarqueePause } from "./MarqueePause";

/**
 * The brands we work with, as one row of client logos scrolling slowly sideways (Lucky, 19 Nov: "like Superside";
 * logos only here, never on the designs). Each logo is the client's one-colour logo in the page's ink colour, so it
 * reads in both themes, and opens that client's case study. The row pauses on hover, on focus and with its pause
 * button, and sits still in rows for visitors who prefer less motion (`.marquee` in globals.css).
 * Every logo gets about the same area: a long wordmark is drawn lower, a compact mark taller.
 */
export async function ClientLogos({ heading = "Brands we work with", className = "" }: { heading?: string; className?: string }) {
  const projects = (await getProjects()).filter((p) => CLIENT_LOGOS[p.slug]);
  if (projects.length < 4) return null;
  const items = (copy: boolean) =>
    projects.map((p) => {
      const { ratio, size = 1 } = CLIENT_LOGOS[p.slug];
      const src = `/logos/${p.slug}.svg`;
      return (
        <li key={`${copy ? "b" : "a"}-${p.slug}`} aria-hidden={copy || undefined} className="flex shrink-0 items-center px-[clamp(22px,2.6vw,52px)]">
          <Link
            href={`/work/${p.slug}`}
            scroll={false}
            tabIndex={copy ? -1 : undefined}
            aria-label={p.client || p.name}
            className="block opacity-80 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
          >
            <span
              className="block bg-current"
              style={{
                height: `calc(var(--logo-h) * ${Math.min(1.4, (2 * size) / Math.sqrt(ratio)).toFixed(3)})`,
                aspectRatio: ratio,
                WebkitMask: `url(${src}) center / contain no-repeat`,
                mask: `url(${src}) center / contain no-repeat`,
              }}
            />
          </Link>
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
        <ul className="marquee-track flex w-max items-center" style={{ "--marquee-time": `${projects.length * 5}s` } as React.CSSProperties}>
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
