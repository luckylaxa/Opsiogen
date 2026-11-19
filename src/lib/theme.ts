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

/** The character intro's pictures (public/intro; design/showreel/build/intro_sprite.py makes them). */
export const INTRO_IMAGES = ["/intro/turn.webp", "/intro/shell.webp"];

/**
 * The character intro being tried in place of the preloader (Lucky, 19 Nov), only when the address has `?intro`
 * for now (components/motion/IntroLoader.tsx). It fetches its two pictures and starts once both are ready
 * (`intro-go`), so it plays even before the page's scripts load. The page's own entrance starts as the character
 * lands (the end of `intro-bg`), so the heading is already rising when the lens opens, and the panel goes when the
 * rush ends (`intro-done`, the end of `intro-zoom`). A tap or a key skips it, and so do pictures that take over 2.5 s.
 */
const INTRO_START = `d.dataset.intro="on";d.classList.add("preloading");s.setItem("${PRELOADER_KEY}","1");var n=0,open=function(){d.classList.remove("preloading")},end=function(){d.classList.add("intro-done");open();removeEventListener("pointerdown",end);removeEventListener("keydown",end)},go=function(){if(++n===${INTRO_IMAGES.length}&&!d.classList.contains("intro-done"))d.classList.add("intro-go")};${JSON.stringify(INTRO_IMAGES)}.forEach(function(u){var i=new Image();i.fetchPriority="high";i.src=u;i.decode().then(go,end)});d.addEventListener("animationend",function(e){if(e.animationName==="intro-bg")open();if(e.animationName==="intro-zoom")end()});addEventListener("pointerdown",end);addEventListener("keydown",end);setTimeout(function(){if(!d.classList.contains("intro-go"))end()},2500);setTimeout(open,5000)`;

/**
 * Runs in <head> before the first paint. The preloader shows only when a
 * visit starts on the home page; a visit that starts on any other page marks
 * it as seen, so later page loads, and visitors who prefer reduced motion,
 * skip it. While it shows, the hero's own entrance waits (the `preloading` class).
 * With `?intro` in the address, the character intro plays instead, every time (INTRO_START).
 */
export const PRELOADER_SCRIPT = `try{var d=document.documentElement,s=sessionStorage,m=matchMedia("(prefers-reduced-motion: reduce)").matches;if(/[?&]intro\\b/.test(location.search)&&!m){${INTRO_START}}else if(s.getItem("${PRELOADER_KEY}")||location.pathname!=="/"||m){d.classList.add("no-preloader");s.setItem("${PRELOADER_KEY}","1")}else d.classList.add("preloading")}catch(e){document.documentElement.classList.add("no-preloader")}`;
