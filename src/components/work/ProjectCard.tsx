"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ProjectCard as Card } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { ArrowUpRight } from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const SIZES = "(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw";

/**
 * Project card from the reference: 4:3 media that fades in on scroll; on hover
 * a dark gradient rises with the service label, name and an arrow, and any
 * cover video plays. Name and client sit below the media.
 */
export function ProjectCard({ project, headingLevel = "h3" }: { project: Card; headingLevel?: "h2" | "h3" }) {
  const video = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | undefined>();
  const [playing, setPlaying] = useState(false);
  const href = `/work/${project.slug}`;
  const tag = project.services[0]?.shortName;
  const Heading = headingLevel;

  const start = () => {
    if (!project.coverVideo || prefersReducedMotion()) return;
    if (!videoSrc) setVideoSrc(project.coverVideo.url);
    requestAnimationFrame(() => video.current?.play().catch(() => {}));
  };
  const stop = () => {
    video.current?.pause();
    setPlaying(false);
  };

  return (
    <article className="group relative" onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
      <div>
        <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-card bg-night">
          <Media image={project.cover} sizes={SIZES} />
          {project.coverVideo && (
            <video
              ref={video}
              src={videoSrc}
              muted
              loop
              playsInline
              preload="none"
              onPlaying={() => setPlaying(true)}
              className={cn(
                "absolute inset-0 size-full object-cover transition-opacity duration-500",
                playing ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 via-45% to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-[clamp(16px,calc(0.6vw+13.7px),25px)] text-white opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
            <div className="min-w-0">
              {tag && <p className="text-[length:clamp(10px,calc(0.13vw+9.5px),12px)] uppercase tracking-[0.06em] text-white/85">{tag}</p>}
              <p className="truncate text-[length:clamp(17px,calc(0.33vw+15.8px),22px)] leading-tight">{project.name}</p>
            </div>
            <ArrowUpRight className="size-[clamp(20px,calc(0.33vw+18.8px),25px)] shrink-0" />
          </div>
        </div>
      </div>
      <div className="mt-[clamp(14px,calc(0.79vw+11px),26px)] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading className="text-title">
          <Link href={href} className="font-medium after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ink">
            {project.name}
          </Link>
          <span className="mx-[0.45em] text-small text-mute">for</span>
          <span className="text-ink-2">{project.client}</span>
        </Heading>
        {tag && <p className="text-small text-mute">{project.services.map((s) => s.shortName).join(" · ")}</p>}
      </div>
    </article>
  );
}
