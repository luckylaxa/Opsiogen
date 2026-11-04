/** Kept apart from lib/gsap so components that only ask this don't load GSAP. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
