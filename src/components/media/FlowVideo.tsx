"use client";

import { useEffect, useRef } from "react";
import type { ProjectFlow } from "@/lib/types";
import { afterPageLoad } from "@/lib/afterLoad";
import { prefersReducedMotion } from "@/lib/motion";
import { isSanityImage, sanityLoader } from "@/lib/sanityImage";

/** The poster at the width it is shown, from the image CDN. */
const sized = (url: string | undefined, width: number) =>
  url && isSanityImage(url) ? sanityLoader({ src: url, width, quality: 70 }) : url;

/**
 * A case study's screen-flow video: 16:10 from tablets up, square on phones
 * when a phone version exists. Each video and its poster load only when near
 * the screen and shown at this width; the video plays muted on a loop while
 * visible and pauses off screen. Reduced-motion visitors see the poster.
 */
export function FlowVideo({ flow, label }: { flow: ProjectFlow; label: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll("video"));
    // Each poster loads as its video nears the screen, and only for the version shown at this width.
    const posters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting || v.offsetParent === null || !v.dataset.poster) continue;
          v.poster = v.dataset.poster;
          posters.unobserve(v);
        }
      },
      { rootMargin: "1200px 0px" },
    );
    videos.forEach((v) => posters.observe(v));
    if (prefersReducedMotion()) return () => posters.disconnect();
    // Videos now near the screen, and the waits to cancel on the way out.
    const near = new WeakSet<HTMLVideoElement>();
    const waits: (() => void)[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          // Skip the version hidden at this width.
          if (!entry.isIntersecting || v.offsetParent === null) {
            near.delete(v);
            v.pause();
            continue;
          }
          near.add(v);
          // On a short page the video is near from the start: let the page's main image finish first.
          waits.push(
            afterPageLoad(() => {
              if (!near.has(v)) return;
              if (v.preload === "none") {
                for (const s of v.querySelectorAll<HTMLSourceElement>("source[data-src]")) s.src = s.dataset.src!;
                v.preload = "auto";
                v.load();
              }
              v.play().catch(() => {});
            }),
          );
        }
      },
      { rootMargin: "300px 0px" },
    );
    videos.forEach((v) => io.observe(v));
    return () => {
      waits.forEach((cancel) => cancel());
      posters.disconnect();
      io.disconnect();
    };
  }, []);

  const phone = flow.phone?.url;
  return (
    <div ref={box} role="img" aria-label={label} className="relative overflow-hidden rounded-card bg-night">
      {phone && (
        <video
          className="block aspect-square w-full object-cover sm:hidden"
          data-poster={sized(flow.posterPhone?.url ?? flow.poster?.url, 828)}
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
        data-poster={sized(flow.poster?.url, 1600)}
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
