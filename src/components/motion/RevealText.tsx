"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Large paragraph whose words fill from light grey to ink as it scrolls
 * through the viewport, as in the reference. Without JavaScript, or with
 * reduced motion, the text simply shows in ink.
 */
export function RevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      el.dataset.armed = "";
      gsap.to(el.querySelectorAll("[data-word]"), {
        "--fill": "100%",
        ease: "none",
        stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 42%", scrub: 0.6 },
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cn("reveal-words", className)}>
      {words.map((word, i) => (
        <span key={i} data-word>
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
