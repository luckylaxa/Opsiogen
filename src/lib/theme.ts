export type Theme = "light" | "dark";

/** localStorage key for the visitor's choice. */
export const THEME_KEY = "theme";

/** Browser bar colour per theme, matching the hero band behind the header. */
export const THEME_BAR: Record<Theme, string> = { light: "#edeaed", dark: "#121115" };

/** The theme a first-time visitor sees. */
export const DEFAULT_THEME: Theme = "dark";

/** Runs in <head> before the first paint: dark unless the visitor chose light. */
export const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark"}catch(e){}`;

/** sessionStorage key: the preloader has run in this visit. */
export const PRELOADER_KEY = "op-preloaded";

/**
 * Runs in <head> before the first paint. The preloader shows only when a
 * visit starts on the home page; a visit that starts on any other page marks
 * it as seen, so later page loads, and visitors who prefer reduced motion,
 * skip it. While it shows, the hero's own entrance waits (the `preloading` class).
 */
export const PRELOADER_SCRIPT = `try{var d=document.documentElement,s=sessionStorage;if(s.getItem("${PRELOADER_KEY}")||location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("no-preloader");s.setItem("${PRELOADER_KEY}","1")}else d.classList.add("preloading")}catch(e){document.documentElement.classList.add("no-preloader")}`;
