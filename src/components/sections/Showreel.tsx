"use client";

import { useEffect, useRef, useState } from "react";
import type { ShowreelSection, Video } from "@/lib/types";
import { Media } from "@/components/ui/Media";
import { afterPageLoad } from "@/lib/afterLoad";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** MP4, or the WebM copy where this browser can't play it (no H.264, as in some open-source builds). */
function chooseSrc(el: HTMLVideoElement, video: Video, webm?: Video | null) {
  const mp4 = !video.mimeType || video.mimeType === "video/mp4";
  const type = mp4 ? 'video/mp4; codecs="avc1.42E01E"' : video.mimeType!;
  return webm?.url && !el.canPlayType(type) ? webm.url : video.url;
}

/** Fullscreen as each browser names it: older Safari prefixes it, and an iPhone only lets the video itself go full screen. */
type FullscreenVideo = HTMLVideoElement & {
  webkitRequestFullscreen?: () => void;
  webkitEnterFullscreen?: () => void;
};

/**
 * The big video card: a muted loop that plays while it is on screen, over
 * its poster image, with the label and line in the bottom corner and a
 * square play/pause button; a video with sound (the showreel) adds a sound
 * button, and always starts muted, and a full-view button that fills the
 * screen with the film and its sound. Visitors who prefer less motion see the
 * poster until they press play. 16:9 on every screen, so a film is never cut.
 */
export function Showreel({
  section,
  className,
  priority = false,
}: {
  section: ShowreelSection;
  className?: string;
  /** The poster is the page's main image (the card sits at the top of the page): load it first. */
  priority?: boolean;
}) {
  const { label, heading, video, videoWebm, poster, sound } = section;
  const ref = useRef<HTMLVideoElement>(null);
  // The file to play, picked once the card is near: MP4, or the WebM copy where MP4 can't play.
  const [src, setSrc] = useState<string>();
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  // In full view the browser's own controls show, and screen readers can reach the film.
  const [full, setFull] = useState(false);
  // Set when the visitor pauses (or, with reduced motion, until they press play).
  const held = useRef(false);
  const inView = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!video || !el) return;
    held.current = prefersReducedMotion();
    let cancel = () => {};
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (!entry.isIntersecting) el.pause();
        else if (!el.getAttribute("src")) {
          // Let the page's main image finish before the video starts downloading.
          cancel();
          cancel = afterPageLoad(() => {
            if (inView.current) setSrc(chooseSrc(el, video, videoWebm));
          });
        } else if (!held.current) el.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => {
      cancel();
      io.disconnect();
    };
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

  // Sound on also plays the film, from wherever it is; it stays on until turned off.
  const toggleSound = () => {
    const el = ref.current;
    if (!el || !video) return;
    el.muted = !muted;
    setMuted(!muted);
    if (muted && !playing) {
      held.current = false;
      if (el.getAttribute("src")) el.play().catch(() => {});
      else setSrc(chooseSrc(el, video, videoWebm));
    }
  };

  // Full view: the film fills the screen with its sound on. From the muted loop it starts again from the top;
  // when someone is already listening it carries on from where it is. The fullscreen request has to come straight
  // from the press, so it is made before the file has finished loading.
  const fullView = () => {
    const el = ref.current as FullscreenVideo | null;
    if (!el || !video) return;
    held.current = false;
    if (muted) el.currentTime = 0;
    el.muted = false;
    setMuted(false);
    if (el.getAttribute("src")) el.play().catch(() => {});
    else setSrc(chooseSrc(el, video, videoWebm));
    setFull(true);
    if (el.requestFullscreen) el.requestFullscreen().catch(() => setFull(false));
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen();
    else setFull(false);
  };

  // Leaving full view (Esc, the browser's own button, or an iPhone's Done) brings the card's own buttons back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setFull((document.fullscreenElement ?? doc.webkitFullscreenElement) === el);
    };
    const end = () => setFull(false);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    el.addEventListener("webkitendfullscreen", end);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      el.removeEventListener("webkitendfullscreen", end);
    };
  }, []);

  const button =
    "grid size-11 place-items-center sm:size-[clamp(52px,3.6vw,68px)] rounded-[8px] border border-white/20 bg-black/70 transition-colors duration-300 hover:border-white/50 hover:bg-black/60";

  if (!video && !poster) return null;
  return (
    <div className={cn("px-gutter", className)}>
      <figure
        data-reveal
        className="on-dark relative aspect-video overflow-hidden rounded-card bg-night text-white"
      >
        {poster && <Media image={poster} sizes="(min-width: 1440px) 1440px, 100vw" priority={priority} />}
        {video && (
          <video
            ref={ref}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-500",
              started ? "opacity-100" : "opacity-0",
            )}
            src={src}
            muted={muted}
            loop
            playsInline
            preload="none"
            controls={full}
            aria-hidden={!full}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onPlaying={() => {
              setPlaying(true);
              setStarted(true);
            }}
            onPause={() => setPlaying(false)}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent max-sm:hidden"
        />
        {/* On phones the card is too small to carry words over the film: the caption is kept for screen readers only. */}
        {(label || heading) && (
          <figcaption
            className={cn(
              "absolute bottom-[clamp(16px,2.4vw,46px)] left-[clamp(16px,2.4vw,46px)] max-sm:sr-only",
              video && sound
                ? "right-[calc(clamp(16px,2.4vw,46px)+3*clamp(52px,3.6vw,68px)+40px)]"
                : "right-[calc(clamp(16px,2.4vw,46px)+clamp(52px,3.6vw,68px)+16px)]",
            )}
          >
            {label && <span className="block text-base text-white/75">{label}</span>}
            {heading && (
              <span className="mt-1 block text-[length:clamp(22px,calc(1.3vw+17px),44px)] leading-[1.05] font-semibold tracking-[-0.02em] text-balance">
                {heading}
              </span>
            )}
          </figcaption>
        )}
        {video && (
          <div className="absolute right-[clamp(12px,2.4vw,46px)] bottom-[clamp(12px,2.4vw,46px)] flex gap-2 sm:gap-3">
            {sound && (
              <button type="button" onClick={toggleSound} aria-label={muted ? "Turn sound on" : "Turn sound off"} className={button}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[40%] fill-current">
                  <path d="M3 9.5h4L12 5v14l-5-4.5H3z" />
                  <path
                    d={muted ? "M16 9.5l5 5M21 9.5l-5 5" : "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className={button}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[40%] fill-current">
                {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
              </svg>
            </button>
            {sound && (
              <button type="button" onClick={fullView} aria-label="Watch in full screen" className={button}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[40%]">
                  <path
                    d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </figure>
    </div>
  );
}
