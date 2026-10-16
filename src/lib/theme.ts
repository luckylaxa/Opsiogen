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
 * Runs in <head> before the first paint. The preloader shows once per visit;
 * repeat page loads and visitors who prefer reduced motion skip it, and while
 * it shows the hero's own entrance waits (the `preloading` class).
 */
export const PRELOADER_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("${PRELOADER_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("no-preloader");else d.classList.add("preloading")}catch(e){document.documentElement.classList.add("no-preloader")}`;
