export type Theme = "light" | "dark";

/** localStorage key for the visitor's choice. */
export const THEME_KEY = "theme";

/** Browser bar colour per theme, matching the hero band behind the header. */
export const THEME_BAR: Record<Theme, string> = { light: "#edeaed", dark: "#121115" };

/** The theme a first-time visitor sees. */
export const DEFAULT_THEME: Theme = "light";

/**
 * Runs in <head> before the first paint: light unless the visitor chose dark (light by default since 21 Nov). Also marks <html> with
 * `page-loaded` once the page has loaded, for things that should wait until then (the client logos).
 */
export const THEME_SCRIPT = `try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="dark"?"dark":"light"}catch(e){}addEventListener("load",function(){document.documentElement.classList.add("page-loaded")});`;

/** sessionStorage key: the first-visit intro has run (or was skipped) in this visit. */
export const INTRO_KEY = "op-preloaded";

/**
 * The intro's pictures (public/intro; design/hero/character/v3/web/intro.cjs and intro_pictures.py make them): the
 * jump and the backflip side by side on black, the character facing the visitor with its visor cut out, and the visor.
 */
export const INTRO_IMAGES = ["/intro/flip.webp", "/intro/shell.webp", "/intro/face.webp"];

/**
 * Plays the character intro (components/motion/IntroLoader.tsx; Lucky, 25 Nov). It fetches its three pictures and
 * starts once all are ready (`intro-go`), so it plays even before the page's scripts load. The page's own entrance
 * waits (the `preloading` class) until the visor is about to open (the end of `intro-bg`), and the panel goes when the
 * character has flown past the screen (the end of `intro-rush`). A tap or a key skips it, and so do pictures that
 * take over 2.5 s.
 */
const INTRO_START = `d.dataset.intro="on";d.classList.add("preloading");s.setItem("${INTRO_KEY}","1");var I=${JSON.stringify(INTRO_IMAGES)},n=0,open=function(){d.classList.remove("preloading")},end=function(){d.classList.add("intro-done");open();removeEventListener("pointerdown",end);removeEventListener("keydown",end)},go=function(){if(++n===I.length&&!d.classList.contains("intro-done"))d.classList.add("intro-go")};I.forEach(function(u){var i=new Image();i.fetchPriority="high";i.src=u;i.decode().then(go,end)});d.addEventListener("animationend",function(e){if(e.animationName==="intro-bg")open();if(e.animationName==="intro-rush")end()});addEventListener("pointerdown",end);addEventListener("keydown",end);setTimeout(function(){if(!d.classList.contains("intro-go"))end()},2500);setTimeout(end,5000)`;

/**
 * Runs in <head> before the first paint. The intro plays once, when a visit starts on the home page; a visit that
 * starts on any other page marks it as seen, so later page loads skip it, and visitors who prefer reduced motion
 * never see it. `?intro` in the address plays it again, for checking it (so does the old preview link,
 * `?preview=character`). The mouse pointer is the normal one (Lucky, 25 Nov).
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement,s=sessionStorage;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&(/[?&](intro|preview=character)\\b/.test(location.search)||(!s.getItem("${INTRO_KEY}")&&location.pathname==="/"))){${INTRO_START}}else s.setItem("${INTRO_KEY}","1")}catch(e){}`;
