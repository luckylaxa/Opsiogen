"use client";

import { useEffect, useRef } from "react";

/** The colour sets the glow moves through, one per press on the character. All from our own mark. */
const PALETTES = [
  ["#ff9a6b", "#ff7ac8", "#a98bff", "#5cf2e6"],
  ["#3f7bff", "#35d4ff", "#5ff0a8", "#9b5cff"],
  ["#ff4f9b", "#ff8a3c", "#ffd75e", "#b667ff"],
  ["#2fd4ff", "#5a7dff", "#ff5fb4", "#b6f36a"],
];

/** Four soft pools of colour along the bottom edge. No blur filter: the gradients fade out by themselves. */
const BLOBS = [
  { left: "-14%", bottom: "-46%", size: "max(62vw, 520px)", n: 1, drift: 16 },
  { left: "18%", bottom: "-58%", size: "max(56vw, 480px)", n: 2, drift: 21 },
  { left: "44%", bottom: "-54%", size: "max(56vw, 480px)", n: 3, drift: 18 },
  { left: "66%", bottom: "-44%", size: "max(62vw, 520px)", n: 4, drift: 24 },
];

const vars = (p: string[]) => Object.fromEntries(p.map((c, i) => [`--c${i + 1}`, c])) as React.CSSProperties;

/**
 * The Home hero's background light: soft pools of colour rising from the bottom of the first screen, on the
 * page's own white or black, and thinning out behind the section that follows. They lean a little toward the pointer, and each press on the character
 * (a `hero:pulse` event) sends a ring of new colour out from it and turns the pools to the next colour set.
 * Only transforms and opacity move, so nothing is repainted while it plays.
 */
export function HeroGlow() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-layer]"));
    const blobs = Array.from(el.querySelectorAll<HTMLElement>("[data-blob]"));
    const burst = el.querySelector<HTMLElement>("[data-burst]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let turn = 0, front = 0, raf = 0, tx = 0, ty = 0, x = 0, y = 0;

    // A slow drift, so the light is never quite still.
    const drifts = reduce ? [] : blobs.map((b, i) =>
      b.animate([{ translate: "0 0" }, { translate: `${i % 2 ? -4 : 4}% -6%` }, { translate: "0 0" }], { duration: Number(b.dataset.drift) * 1000, iterations: Infinity, easing: "ease-in-out" }));

    const onPulse = (e: Event) => {
      const at = (e as CustomEvent<{ x: number; y: number }>).detail;
      turn = (turn + 1) % PALETTES.length;
      const p = PALETTES[turn], back = 1 - front;
      p.forEach((c, i) => layers[back].style.setProperty(`--c${i + 1}`, c));
      layers[back].style.opacity = "1"; layers[front].style.opacity = "0"; front = back;
      if (burst && at && !reduce) {
        const r = el.getBoundingClientRect();
        burst.style.left = `${at.x - r.left}px`; burst.style.top = `${at.y - r.top}px`;
        burst.style.background = `radial-gradient(closest-side, ${p[1]} 0%, ${p[2]} 30%, ${p[3]} 52%, transparent 72%)`;
        burst.animate([{ transform: "translate(-50%,-50%) scale(0.08)", opacity: 0.95 }, { transform: "translate(-50%,-50%) scale(1)", opacity: 0 }], { duration: 1300, easing: "cubic-bezier(0.16,0.7,0.2,1)" });
      }
    };
    const loop = () => {
      x += (tx - x) * 0.1; y += (ty - y) * 0.1;
      blobs.forEach((b, i) => { const k = 26 + (i % 4) * 14; b.style.transform = `translate3d(${(x * k).toFixed(1)}px,${(y * k * 0.7).toFixed(1)}px,0)`; });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType !== "mouse") return;
      tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("hero:pulse", onPulse);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("hero:pulse", onPulse); window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf); drifts.forEach((d) => d.cancel());
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150svh] min-h-[840px] overflow-hidden"
      // The light runs on behind the next section and thins out slowly, so there is no edge where it stops.
      style={{ maskImage: "linear-gradient(to bottom, #000 0%, #000 46%, rgb(0 0 0 / 0.55) 66%, rgb(0 0 0 / 0.18) 84%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 46%, rgb(0 0 0 / 0.55) 66%, rgb(0 0 0 / 0.18) 84%, transparent 100%)" }}
    >
      {[0, 1].map((k) => (
        <div key={k} data-layer style={{ ...vars(PALETTES[0]), opacity: k === 0 ? 1 : 0 }} className="absolute inset-x-0 top-0 h-[100svh] min-h-[560px] transition-opacity duration-[1200ms] ease-out">
          {BLOBS.map((b) => (
            <span
              key={b.n}
              data-blob
              data-drift={b.drift}
              className="absolute aspect-square rounded-full opacity-90 will-change-transform dark:opacity-70"
              style={{
                left: b.left, bottom: b.bottom, width: b.size,
                background: `radial-gradient(closest-side, var(--c${b.n}) 0%, color-mix(in srgb, var(--c${b.n}) 62%, transparent) 42%, transparent 100%)`,
              }}
            />
          ))}
        </div>
      ))}
      <span data-burst className="absolute aspect-square w-[150vmax] rounded-full opacity-0 will-change-transform dark:mix-blend-screen" style={{ transform: "translate(-50%,-50%) scale(0.08)" }} />
    </div>
  );
}
