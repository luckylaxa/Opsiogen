import Link from "next/link";
import type { ProjectCard } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

/**
 * Two rows of project covers sliding in opposite directions, as in the
 * reference's course strip. Pauses on hover. Decorative: the same projects
 * are listed on Work.
 */
export function CoverStrip({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  // Each row needs enough cards to fill wide screens before it repeats.
  const fill = (list: ProjectCard[]) => {
    const out: ProjectCard[] = [];
    while (out.length < 6) out.push(...list);
    return out;
  };
  const half = Math.ceil(projects.length / 2);
  const rows = [fill(projects), fill([...projects.slice(half), ...projects.slice(0, half)])];

  return (
    <div aria-hidden="true" className="marquee-hover flex flex-col gap-[clamp(14px,calc(1.1vw+10px),30px)] overflow-hidden">
      {rows.map((row, r) => (
        <div
          key={r}
          className={cn("marquee", r === 1 && "marquee-reverse")}
          style={{ ["--marquee-duration" as string]: `${row.length * 9}s`, marginLeft: r === 1 ? "-12vw" : undefined }}
        >
          {[...row, ...row].map((p, i) => (
            <Link
              key={`${p._id}-${i}`}
              href={`/work/${p.slug}`}
              tabIndex={-1}
              className="relative mr-[clamp(14px,calc(1.1vw+10px),30px)] block aspect-[16/9] w-[clamp(220px,calc(17vw+150px),460px)] shrink-0 overflow-hidden rounded-[clamp(6px,0.45vw,9px)] bg-night"
            >
              <Media image={p.cover} sizes="(min-width: 768px) 26vw, 60vw" className="transition-transform duration-700 ease-[var(--ease-out-soft)] hover:scale-[1.04]" />
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
