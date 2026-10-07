import type { ProjectCard, SiteSettings } from "@/lib/types";
import { getProjects } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

const COLUMNS = 3;
const PER_COLUMN = 3;

/**
 * Shared call to action, edited once in Site settings. Styled after the
 * reference's closing banner: heading and button on a charcoal card, with a
 * tilted wall of project covers drifting slowly on the right.
 */
export async function CallToAction({ cta }: { cta: SiteSettings["cta"] }) {
  const projects = await getProjects();
  const covers = projects.slice(0, COLUMNS * PER_COLUMN);

  return (
    <div className="px-gutter">
      <div
        data-reveal
        className="on-dark relative grid overflow-hidden rounded-card bg-coal text-white md:min-h-[clamp(360px,calc(14vw+250px),560px)] md:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]"
      >
        <div className="relative z-10 flex flex-col justify-center p-[clamp(28px,calc(2.6vw+18px),72px)]">
          <h2 className="max-w-[14ch] text-cta font-semibold text-balance">{cta.heading}</h2>
          {cta.button.href && cta.button.label && (
            <ButtonLink href={cta.button.href} variant="outline-light" className="mt-[clamp(28px,calc(1.4vw+22px),52px)] w-fit">
              {cta.button.label}
            </ButtonLink>
          )}
        </div>
        {covers.length > 0 && <Collage covers={covers} />}
      </div>
    </div>
  );
}

function Collage({ covers }: { covers: ProjectCard[] }) {
  // Fill every column even when there are only a few projects.
  const pick = (i: number) => covers[i % covers.length];
  const columns = Array.from({ length: COLUMNS }, (_, c) =>
    Array.from({ length: PER_COLUMN }, (_, r) => pick(c * PER_COLUMN + r)),
  );

  return (
    <div aria-hidden="true" className="relative h-[clamp(220px,52vw,340px)] overflow-hidden md:h-auto">
      <div className="absolute -inset-y-[30%] -left-[6%] -right-[22%] flex rotate-[-11deg] gap-[clamp(10px,1vw,18px)]">
        {columns.map((column, c) => (
          <div key={c} className="relative flex-1 overflow-hidden">
            <div
              className={cn("drift flex flex-col", c % 2 === 1 && "drift-reverse")}
              style={{ ["--drift-duration" as string]: `${42 + c * 8}s` }}
            >
              {[...column, ...column].map((p, i) => (
                <div
                  key={`${p._id}-${i}`}
                  className="relative mb-[clamp(10px,1vw,18px)] aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[6px] bg-night"
                >
                  <Media image={p.cover} sizes="(min-width: 768px) 16vw, 34vw" className="opacity-90" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Blend the wall into the card behind the heading. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-coal)_0%,transparent_28%)] md:bg-[linear-gradient(to_right,var(--color-coal)_0%,rgb(34_34_34/0.55)_22%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_100%,transparent_40%,rgb(0_0_0/0.35)_100%)]" />
    </div>
  );
}
