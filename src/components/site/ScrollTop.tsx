"use client";

import { useEffect, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowUp } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/** Bottom-left “back to top” tile. Appears once the hero is scrolled past. */
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
        "on-dark fixed bottom-[clamp(12px,calc(1.7vw+5.6px),38px)] left-[clamp(12px,1.58vw,30px)] z-40 hidden aspect-square w-[clamp(46px,calc(1.9vw+39px),75px)] place-items-center rounded-[6px] bg-coal text-white transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-black md:grid",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="w-[42%]" strokeWidth={1.5} />
    </button>
  );
}
