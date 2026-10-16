"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const TARGETS = "[data-reveal], [data-reveal-mask]";

/**
 * Scroll reveals from the design system: cards fade up and headings rise
 * from a mask as they enter the viewport. This only marks elements as
 * revealed and staggers each batch by 70ms; the motion itself is CSS
 * (globals.css), so it costs nothing per frame.
 *
 * Uses IntersectionObserver, so it needs no stored scroll positions and keeps
 * working across in-site page changes, Load more, filters and late-loading
 * images. A MutationObserver picks up elements as they are added.
 */
export function Reveal() {
  useEffect(() => {
    const reveal = (el: HTMLElement) => el.setAttribute("data-revealed", "");

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      const showAll = () => document.querySelectorAll<HTMLElement>(TARGETS).forEach(reveal);
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const el = e.target as HTMLElement;
            io.unobserve(el);
            el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 70}ms`);
            reveal(el);
          });
      },
      // Start just before the element's top edge reaches the bottom of the screen.
      { rootMargin: "0px 0px -6% 0px" },
    );

    const watch = (root: ParentNode) => {
      const els = root instanceof HTMLElement && root.matches(TARGETS) ? [root] : [];
      els.push(...Array.from(root.querySelectorAll<HTMLElement>(TARGETS)));
      els.filter((el) => !el.hasAttribute("data-revealed")).forEach((el) => io.observe(el));
    };

    watch(document);
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) watch(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
