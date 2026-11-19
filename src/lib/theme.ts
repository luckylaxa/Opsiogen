export type Theme = "light" | "dark";

/** localStorage key for the visitor's choice. */
export const THEME_KEY = "theme";

/** Browser bar colour per theme, matching the hero band behind the header. */
export const THEME_BAR: Record<Theme, string> = { light: "#edeaed", dark: "#121115" };

/** The theme a first-time visitor sees. */
export const DEFAULT_THEME: Theme = "dark";

/** Runs in <head> before the first paint: dark unless the visitor chose light. */
export const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="light"?"light":"dark"}catch(e){}`;

/** sessionStorage key: the first-visit intro has run (or was skipped) in this visit. */
export const INTRO_KEY = "op-preloaded";

/** The intro's pictures (public/intro; design/showreel/build/intro_sprite.py makes them). */
export const INTRO_IMAGES = ["/intro/turn.webp", "/intro/shell.webp"];

/**
 * Plays the character intro (components/motion/IntroLoader.tsx). It fetches its two pictures and starts once both
 * are ready (`intro-go`), so it plays even before the page's scripts load. The page's own entrance waits (the
 * `preloading` class) until the character lands (the end of `intro-bg`), so the heading is already rising when the
 * lens opens, and the panel goes when the rush ends (`intro-done`, the end of `intro-zoom`). A tap or a key skips
 * it, and so do pictures that take over 2.5 s.
 */
const INTRO_START = `d.dataset.intro="on";d.classList.add("preloading");s.setItem("${INTRO_KEY}","1");var n=0,open=function(){d.classList.remove("preloading")},end=function(){d.classList.add("intro-done");open();removeEventListener("pointerdown",end);removeEventListener("keydown",end)},go=function(){if(++n===${INTRO_IMAGES.length}&&!d.classList.contains("intro-done"))d.classList.add("intro-go")};${JSON.stringify(INTRO_IMAGES)}.forEach(function(u){var i=new Image();i.fetchPriority="high";i.src=u;i.decode().then(go,end)});d.addEventListener("animationend",function(e){if(e.animationName==="intro-bg")open();if(e.animationName==="intro-zoom")end()});addEventListener("pointerdown",end);addEventListener("keydown",end);setTimeout(function(){if(!d.classList.contains("intro-go"))end()},2500);setTimeout(open,5000)`;

/**
 * Runs in <head> before the first paint. The intro plays once, when a visit starts on the home page; a visit that
 * starts on any other page marks it as seen, so later page loads skip it, and visitors who prefer reduced motion
 * never see it. `?intro` in the address plays it again, for checking it.
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement,s=sessionStorage;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&(/[?&]intro\\b/.test(location.search)||(!s.getItem("${INTRO_KEY}")&&location.pathname==="/"))){${INTRO_START}}else s.setItem("${INTRO_KEY}","1")}catch(e){}`;
