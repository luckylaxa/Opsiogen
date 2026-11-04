"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP with ScrollTrigger. Import it lazily (`import("@/lib/gsap")`) so it
 * stays out of the first page load; reduced-motion checks live in lib/motion.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
