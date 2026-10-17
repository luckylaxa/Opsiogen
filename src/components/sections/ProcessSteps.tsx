"use client";

import { useRef } from "react";
import type { ProcessStep } from "@/lib/types";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** How far down the screen a step counts as reached. */
const LINE = "60%";

/** Shows the ring's arc from the top down both sides, `--arc` each way (0deg to 180deg). */
const ARC_MASK = "conic-gradient(from calc(var(--arc) * -1), #000 calc(var(--arc) * 2), transparent 0)";

/**
 * The steps as a numbered timeline, every step's text showing. While the
 * page scrolls, one accent line follows the reading line down: through each
 * number it draws the ring from the top down both sides to the bottom, then
 * carries on down to the next number. Scrolling back rolls it up again.
 * With reduced motion the whole line shows as reached.
 */
export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      if (prefersReducedMotion()) {
        items.forEach((item) => item.classList.add("is-done"));
        gsap.set(el.querySelectorAll("[data-step-fill]"), { scaleY: 1 });
        gsap.set(el.querySelectorAll("[data-step-ring]"), { "--arc": "180deg" });
        return;
      }
      items.forEach((item) => {
        const dot = item.querySelector<HTMLElement>("[data-step-dot]");
        ScrollTrigger.create({
          trigger: dot,
          start: `center ${LINE}`,
          onEnter: () => item.classList.add("is-done"),
          onLeaveBack: () => item.classList.remove("is-done"),
        });
        gsap.fromTo(
          item.querySelector("[data-step-ring]"),
          { "--arc": "0deg" },
          {
            "--arc": "180deg",
            ease: "none",
            scrollTrigger: { trigger: dot, start: `top ${LINE}`, end: `bottom ${LINE}`, scrub: 0.3 },
          },
        );
        const fill = item.querySelector<HTMLElement>("[data-step-fill]");
        if (!fill) return;
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: fill.parentElement, start: `top ${LINE}`, end: `bottom ${LINE}`, scrub: 0.3 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <ol
      ref={root}
      className="[--dot:clamp(44px,3.8vw,68px)] [--step-title:clamp(20px,calc(0.84vw+16.8px),32px)]"
    >
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li
            key={s._key ?? i}
            data-step
            className="group/step relative grid grid-cols-[var(--dot)_minmax(0,1fr)] gap-x-[clamp(16px,2.2vw,44px)]"
          >
            {/* The line down to the next number, and its fill. */}
            {!last && (
              <span
                aria-hidden="true"
                className="absolute top-[var(--dot)] bottom-0 left-[calc(var(--dot)/2)] w-[2px] -translate-x-1/2 bg-line"
              >
                <span data-step-fill className="absolute inset-0 origin-top scale-y-0 bg-accent" />
              </span>
            )}
            <span
              data-step-dot
              aria-hidden="true"
              className="relative grid size-[var(--dot)] place-items-center rounded-full border-2 border-line bg-page text-[length:clamp(17px,1.3vw,24px)] text-mute tabular-nums transition-colors duration-400 group-[.is-done]/step:text-ink"
            >
              {/* The accent ring over the grey one, drawn as the line passes through. */}
              <span
                data-step-ring
                className="absolute -inset-[2px] rounded-full border-2 border-accent"
                style={{ "--arc": "0deg", maskImage: ARC_MASK, WebkitMaskImage: ARC_MASK } as React.CSSProperties}
              />
              {i + 1}
            </span>
            <div
              data-reveal
              className={cn(
                "mt-[calc((var(--dot)-var(--step-title)*1.2)/2)] grid gap-y-[clamp(8px,0.8vw,14px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-baseline lg:gap-x-gap",
                !last && "pb-[clamp(44px,4vw,88px)]",
              )}
            >
              <h3 className="text-[length:var(--step-title)] leading-[1.2] font-medium tracking-[-0.015em] text-balance">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h3>
              {s.text && <p className="max-w-[52ch] text-lead text-ink-2 text-pretty">{s.text}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
