"use client";

import { useEffect, useRef } from "react";
import type { ProjectFlow } from "@/lib/types";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A case study's screen-flow video: 16:10 from tablets up, square on phones
 * when a phone version exists. Each video loads only when it is near the
 * screen and shown at this width, plays muted on a loop while visible, and
 * pauses off screen. Reduced-motion visitors see the poster.
 */
export function FlowVideo({ flow, label }: { flow: ProjectFlow; label: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current;
    if (!root || prefersReducedMotion()) return;
    const videos = Array.from(root.querySelectorAll("video"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          // Skip the version hidden at this width.
          if (!entry.isIntersecting || v.offsetParent === null) {
            v.pause();
            continue;
          }
          if (v.preload === "none") {
            for (const s of v.querySelectorAll<HTMLSourceElement>("source[data-src]")) s.src = s.dataset.src!;
            v.preload = "auto";
            v.load();
          }
          v.play().catch(() => {});
        }
      },
      { rootMargin: "300px 0px" },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  const phone = flow.phone?.url;
  return (
    <div ref={box} role="img" aria-label={label} className="relative overflow-hidden rounded-card bg-night">
      {phone && (
        <video
          className="block aspect-square w-full object-cover sm:hidden"
          poster={flow.posterPhone?.url ?? flow.poster?.url}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          {flow.phoneWebm?.url && <source data-src={flow.phoneWebm.url} type="video/webm" />}
          <source data-src={phone} type="video/mp4" />
        </video>
      )}
      <video
        className={phone ? "hidden aspect-[16/10] w-full object-cover sm:block" : "block aspect-[16/10] w-full object-cover"}
        poster={flow.poster?.url}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        {flow.videoWebm?.url && <source data-src={flow.videoWebm.url} type="video/webm" />}
        <source data-src={flow.video.url} type="video/mp4" />
      </video>
    </div>
  );
}
