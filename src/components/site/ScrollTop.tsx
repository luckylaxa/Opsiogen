"use client";

import { useEffect, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowUp } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * “Back to top” square: bottom left beside the floating menu, or on phones
 * bottom right just above the tab bar. Appears once the hero is scrolled past.
 */
export function ScrollTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShown(window.scrollY > window.innerHeight * 0.6));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toTop = () => {
    if (prefersReducedMotion()) {
      window.scrollTo(0, 0);
    } else {
      gsap.to(window, { scrollTo: 0, duration: 0.8, ease: "power2.inOut" });
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={cn(
        "on-dark fixed right-3 bottom-[calc(94px+env(safe-area-inset-bottom))] z-40 grid aspect-square w-12 place-items-center rounded-[6px] border border-white/10 bg-coal text-white shadow-[0_12px_32px_-12px_rgb(0_0_0/0.6)] transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-black md:right-auto md:bottom-[clamp(12px,calc(1.7vw+5.6px),38px)] md:left-[clamp(12px,1.58vw,30px)] md:w-[clamp(46px,calc(1.9vw+39px),75px)] md:border-0 md:shadow-none",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="w-[42%]" strokeWidth={1.5} />
    </button>
  );
}
