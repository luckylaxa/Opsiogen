"use client";

import { useEffect } from "react";

/**
 * Starts loading the lazy images inside `#target` well before they scroll
 * into view (about two screens ahead), so a long gallery is ready by the time
 * the reader gets there. Browsers' own lazy loading starts late, Safari's
 * especially. Works in the page and inside the case-study pop-up, which
 * scrolls its own box. It starts once the page has loaded, so it never
 * competes with the page's main image.
 */
export function LoadAhead({ target, ahead = "200%" }: { target: string; ahead?: string }) {
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el || !("IntersectionObserver" in window)) return;

    // The nearest box that scrolls (the pop-up), or the page.
    let root: HTMLElement | null = el.parentElement;
    while (root && root !== document.body) {
      const { overflowY } = getComputedStyle(root);
      if ((overflowY === "auto" || overflowY === "scroll") && root.scrollHeight > root.clientHeight) break;
      root = root.parentElement;
    }
    if (root === document.body) root = null;

    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const img = entry.target as HTMLImageElement;
            img.fetchPriority = "auto";
            img.loading = "eager";
            io?.unobserve(img);
          }
        },
        { root, rootMargin: `${ahead} 0px ${ahead} 0px` },
      );
      el.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => io?.observe(img));
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      io?.disconnect();
    };
  }, [target, ahead]);

  return null;
}
