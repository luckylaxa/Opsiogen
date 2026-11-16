"use client";

import { useEffect, useRef, useState } from "react";
import type { Img, Video } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { afterPageLoad } from "@/lib/afterLoad";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Cover image with an optional muted looping video on top. The video only
 * loads once it is near the viewport and plays while visible; the image acts
 * as its poster. Reduced-motion visitors see the still image.
 */
export function CoverMedia({
  image,
  video,
  sizes,
  priority,
  phone,
  className,
}: {
  image: Img;
  video?: Video | null;
  sizes: string;
  priority?: boolean;
  /** A version of the image for phones (see Media). */
  phone?: Omit<Img, "alt" | "hotspot"> | null;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const inView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!video || !el || prefersReducedMotion()) return;
    let cancel = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (!entry.isIntersecting) el.pause();
        else if (el.getAttribute("src")) el.play().catch(() => {});
        else {
          // The image under the video may be the page's main image: let the page finish loading first.
          cancel();
          cancel = afterPageLoad(() => {
            if (inView.current) setLoad(true);
          });
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => {
      cancel();
      io.disconnect();
    };
  }, [video]);

  // Start as soon as the file is attached, while the cover is on screen.
  useEffect(() => {
    if (load && inView.current) ref.current?.play().catch(() => {});
  }, [load]);

  return (
    <div className={cn("absolute inset-0", className)}>
      <Media image={image} sizes={sizes} priority={priority} phone={phone} />
      {video && (
        <video
          ref={ref}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            playing ? "opacity-100" : "opacity-0",
          )}
          src={load ? video.url : undefined}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}
