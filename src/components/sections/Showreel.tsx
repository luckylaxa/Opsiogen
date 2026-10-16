"use client";

import { useEffect, useRef, useState } from "react";
import type { ShowreelSection, Video } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** MP4, or the WebM copy where this browser can't play it (no H.264, as in some open-source builds). */
function chooseSrc(el: HTMLVideoElement, video: Video, webm?: Video | null) {
  const mp4 = !video.mimeType || video.mimeType === "video/mp4";
  const type = mp4 ? 'video/mp4; codecs="avc1.42E01E"' : video.mimeType!;
  return webm?.url && !el.canPlayType(type) ? webm.url : video.url;
}

/**
 * The big video card: a muted loop that plays while it is on screen, over
 * its poster image, with the label and line in the bottom corner and a
 * square play/pause button. Visitors who prefer less motion see the poster
 * until they press play. 16:9, and 4:3 on phones.
 */
export function Showreel({ section, className }: { section: ShowreelSection; className?: string }) {
  const { label, heading, video, videoWebm, poster } = section;
  const ref = useRef<HTMLVideoElement>(null);
  // The file to play, picked once the card is near: MP4, or the WebM copy where MP4 can't play.
  const [src, setSrc] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  // Set when the visitor pauses (or, with reduced motion, until they press play).
  const held = useRef(false);
  const inView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!video || !el) return;
    held.current = prefersReducedMotion();
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (!entry.isIntersecting) el.pause();
        else if (!el.getAttribute("src")) setSrc(chooseSrc(el, video, videoWebm));
        else if (!held.current) el.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video, videoWebm]);

  // Start as soon as the file is attached, while the card is on screen.
  useEffect(() => {
    const el = ref.current;
    if (src && el && inView.current && !held.current) el.play().catch(() => {});
  }, [src]);

  const toggle = () => {
    const el = ref.current;
    if (!el || !video) return;
    if (playing) {
      held.current = true;
      el.pause();
    } else {
      held.current = false;
      if (el.getAttribute("src")) el.play().catch(() => {});
      else setSrc(chooseSrc(el, video, videoWebm));
    }
  };

  if (!video && !poster) return null;
  return (
    <div className={cn("px-gutter", className)}>
      <figure
        data-reveal
        className="on-dark relative aspect-[4/3] overflow-hidden rounded-card bg-night text-white sm:aspect-video"
      >
        {poster && <Media image={poster} sizes="(min-width: 1440px) 1440px, 100vw" priority />}
        {video && (
          <video
            ref={ref}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-500",
              started ? "opacity-100" : "opacity-0",
            )}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => {
              setPlaying(true);
              setStarted(true);
            }}
            onPause={() => setPlaying(false)}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"
        />
        {(label || heading) && (
          <figcaption className="absolute bottom-[clamp(16px,2.4vw,46px)] left-[clamp(16px,2.4vw,46px)] right-[calc(clamp(16px,2.4vw,46px)+clamp(52px,3.6vw,68px)+16px)]">
            {label && <span className="block text-base text-white/75">{label}</span>}
            {heading && (
              <span className="mt-1 block text-[length:clamp(22px,calc(1.3vw+17px),44px)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance">
                {heading}
              </span>
            )}
          </figcaption>
        )}
        {video && (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            className="absolute right-[clamp(16px,2.4vw,46px)] bottom-[clamp(16px,2.4vw,46px)] grid size-[clamp(52px,3.6vw,68px)] place-items-center rounded-[8px] border border-white/20 bg-black/40 backdrop-blur-md transition-colors duration-300 hover:border-white/50 hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[40%] fill-current">
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
            </svg>
          </button>
        )}
      </figure>
    </div>
  );
}
