import Link from "next/link";
import type { ProjectCard } from "@/lib/types";
import { CoverMedia } from "@/components/media/CoverMedia";
import { buttonClass } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/** Where a 4:3 cover is cropped in the card's wider box, so its main subject keeps room around it. */
const COVER_FOCUS: Record<string, { x: number; y: number }> = {
  // The phone keeps space above it.
  "oh-my-glam": { x: 0.5, y: 0.2 },
};

/**
 * The large dark card from the reference hero: the cover (or looping video)
 * sits inset in a near-black frame the full width of the window, with the project details underneath.
 * The whole card links to the project.
 */
export function FeaturedProject({ project, priority = true }: { project?: ProjectCard | null; priority?: boolean }) {
  if (!project) return null;
  const tags = project.services.map((s) => s.shortName).join(" · ");
  return (
    <article data-dock="/work" className="on-dark group relative overflow-hidden bg-night text-white">
      <div className="px-[clamp(12px,7.5%,142px)] pt-[clamp(12px,7.5%,142px)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-night sm:aspect-video">
          <CoverMedia
            image={{ ...project.cover, hotspot: project.cover.hotspot ?? COVER_FOCUS[project.slug] }}
            video={project.coverVideo}
            priority={priority}
            sizes="(min-width: 640px) 85vw, 100vw"
            className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.015]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-5 px-[clamp(16px,7.5%,142px)] py-[clamp(24px,calc(3.6vw+10.5px),80px)] sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {tags && <p className="mb-2 text-small uppercase tracking-[0.06em] text-white/60">{tags}</p>}
          <h2 className="text-[length:clamp(24px,calc(1.05vw+20px),40px)] font-medium leading-tight tracking-[-0.01em]">
            {project.name}
          </h2>
          <p className="mt-1 text-base text-white/60">
            {[project.client !== project.name && project.client, project.industry, project.year].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Link
          href={`/work/${project.slug}`}
          scroll={false}
          className={cn(
            buttonClass("outline-light", "md"),
            "w-fit shrink-0 group-hover:border-white group-hover:bg-white group-hover:text-coal",
            "after:absolute after:inset-0 after:content-['']",
          )}
        >
          <span className="btn-label">View project</span>
          <ArrowUpRight className="size-[1.1em]" />
        </Link>
      </div>
    </article>
  );
}
