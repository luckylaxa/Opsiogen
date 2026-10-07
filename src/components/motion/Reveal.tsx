"use client";

import { useEffect } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const CARD = "[data-reveal]";

/**
 * Fades media in as it scrolls into view, matching the reference: cards start
 * transparent and settle to full opacity in ~0.65s with a gentle ease-out.
 *
 * Uses IntersectionObserver, so it needs no stored scroll positions and keeps
 * working across in-site page changes, Load more, filters and late-loading
 * images. A MutationObserver picks up cards as they are added to the page.
 */
export function Reveal() {
  useEffect(() => {
    const show = (els: HTMLElement[]) => els.forEach((el) => (el.style.opacity = "1"));

    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      const showAll = () => show(Array.from(document.querySelectorAll<HTMLElement>(CARD)));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        if (!entering.length) return;
        entering.forEach((el) => {
          io.unobserve(el);
          el.setAttribute("data-revealed", "");
        });
        gsap.to(entering, { opacity: 1, duration: 0.65, ease: "power1.out", stagger: 0.08, overwrite: true });
      },
      // Start just before the card's top edge reaches the bottom of the screen.
      { rootMargin: "0px 0px -6% 0px" },
    );

    const watch = (root: ParentNode) => {
      const els = root instanceof HTMLElement && root.matches(CARD) ? [root] : [];
      els.push(...Array.from(root.querySelectorAll<HTMLElement>(CARD)));
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
