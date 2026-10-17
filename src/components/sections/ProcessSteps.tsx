"use client";

import { useRef } from "react";
import type { ProcessStep } from "@/lib/types";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** How far down the screen a step counts as reached. */
const LINE = "60%";

/**
 * The steps as a numbered timeline, every step's text showing. While the
 * page scrolls, the line between the numbers fills down to the reading line
 * and each number lights up as it is reached; scrolling back undoes it.
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
        return;
      }
      items.forEach((item) => {
        ScrollTrigger.create({
          trigger: item.querySelector("[data-step-dot]"),
          start: `center ${LINE}`,
          onEnter: () => item.classList.add("is-done"),
          onLeaveBack: () => item.classList.remove("is-done"),
        });
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
            className="relative grid grid-cols-[var(--dot)_minmax(0,1fr)] gap-x-[clamp(16px,2.2vw,44px)]"
          >
            {/* The line down to the next number, and its fill. */}
            {!last && (
              <span
                aria-hidden="true"
                className="absolute top-[var(--dot)] bottom-0 left-[calc(var(--dot)/2)] w-px -translate-x-1/2 bg-line"
              >
                <span data-step-fill className="absolute inset-0 origin-top scale-y-0 bg-ink" />
              </span>
            )}
            <span
              data-step-dot
              aria-hidden="true"
              className="step-dot grid size-[var(--dot)] place-items-center rounded-full border border-line bg-page text-[length:clamp(13px,1vw,17px)] text-mute tabular-nums"
            >
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
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
