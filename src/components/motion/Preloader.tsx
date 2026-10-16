"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "@/components/site/Mark";
import { PRELOADER_KEY } from "@/lib/theme";

const DURATION = 1400;
const WIPE = 900;

/**
 * The design system's first-load preloader: the pulsing symbol inside an
 * orbiting hairline arc, a big gradient counter and a progress line, then the
 * whole panel wipes up. It shows once per visit; repeat page loads and
 * visitors who prefer reduced motion never see it (see PRELOADER_SCRIPT).
 * The panel is in the server HTML, so it covers the page from the first paint.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    // Skipped this visit: the head script has already hidden it with CSS.
    if (root.classList.contains("no-preloader")) return;
    try {
      sessionStorage.setItem(PRELOADER_KEY, "1");
    } catch {}

    const start = performance.now();
    let wipe: ReturnType<typeof setTimeout>;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION);
      setProgress(Math.round(100 * (1 - Math.pow(1 - k, 3))));
      if (k < 1) {
        raf.current = requestAnimationFrame(step);
        return;
      }
      setDone(true);
      root.classList.remove("preloading");
      wipe = setTimeout(() => setGone(true), WIPE);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(wipe);
      root.classList.remove("preloading");
    };
  }, []);

  if (gone) return null;
  return (
    <div className="preloader on-dark" data-done={done || undefined} role="status" aria-label="Loading">
      <div className="preloader__mark">
        <span aria-hidden="true" className="preloader__arc" />
        <Mark priority className="preloader__symbol size-full" />
      </div>
      <p aria-hidden="true" className="preloader__name">
        Opsiogen
      </p>
      <p aria-hidden="true" className="preloader__count">
        <span className="text-gradient">{progress}</span>
        <span className="preloader__pct">%</span>
      </p>
      <span aria-hidden="true" className="preloader__bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
