"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

const SELECTOR = "[data-reveal]:not([data-revealed])";

/**
 * Fades media in as it scrolls into view, matching the reference: cards start
 * transparent and settle to full opacity in ~0.65s with a gentle ease-out.
 * Picks up cards added later (e.g. after Load more or a filter change).
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));

    if (prefersReducedMotion()) {
      const showAll = () => pending().forEach((el) => {
        el.setAttribute("data-revealed", "");
        el.style.opacity = "1";
      });
      showAll();
      const observer = new MutationObserver(showAll);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    const triggers: ScrollTrigger[] = [];
    const batch = () => {
      const els = pending();
      if (!els.length) return false;
      els.forEach((el) => el.setAttribute("data-revealed", ""));
      triggers.push(
        ...ScrollTrigger.batch(els, {
          start: "top 94%",
          once: true,
          onEnter: (items) =>
            gsap.to(items, { opacity: 1, duration: 0.65, ease: "power1.out", stagger: 0.08, overwrite: true }),
        }),
      );
      return true;
    };

    batch();

    // Only react when nodes that need revealing are added.
    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      const added = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) => n instanceof HTMLElement && (n.matches(SELECTOR) || n.querySelector(SELECTOR)),
        ),
      );
      if (!added) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (batch()) ScrollTrigger.refresh();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}
