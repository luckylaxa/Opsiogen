"use client";

import { useEffect, useRef, useState } from "react";
import type { Img, Video } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { prefersReducedMotion } from "@/lib/gsap";
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
  className,
}: {
  image: Img;
  video?: Video | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!video || !el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [video]);

  return (
    <div className={cn("absolute inset-0", className)}>
      <Media image={image} sizes={sizes} priority={priority} />
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
