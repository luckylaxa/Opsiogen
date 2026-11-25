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

/** The intro's pictures (public/intro; design/hero/character/v3/web/intro.cjs and intro_pictures.py make them). */
export const INTRO_IMAGES = ["/intro/turn.webp", "/intro/shell.webp"];

/**
 * Plays the character intro (components/motion/IntroLoader.tsx). It fetches its two pictures and starts once both
 * are ready (`intro-go`), so it plays even before the page's scripts load. On Home it always lands, which never
 * shows the shell picture, so it marks the landing at once (`intro-land`, which leaves the shell undrawn and unfetched)
 * and waits for the turning strip alone: one picture fewer competing with the page's main image on a phone. The page's own entrance waits (the
 * `preloading` class) until the character lands (the end of `intro-bg`), and the panel goes when the character has
 * landed on the page (`intro-done`). A tap or a key skips it, and so do pictures that take over 2.5 s.
 */
/**
 * The intro's ending (Lucky, 19 Nov; for everyone since 20 Nov): the character jumps into the page on an arc,
 * turning once, lands on the hero's own character (`[data-intro-land]`)
 * with a small rebound and a rock, and hands over to it as the dark backdrop fades. On a page with no such spot
 * (`?intro` elsewhere), it rushes at the screen and the page opens through its visor instead. The spot is measured in
 * a frame shortly before the jump, not when the intro starts: measuring then forced the whole page's first layout into
 * one long task while it was still loading, which slowed phones (PageSpeed, 20 Nov). All four parts share one start
 * time. Transforms and opacity only, so it stays smooth.
 */
const INTRO_LAND = `function(){var z=document.querySelector(".intro__zoom"),Q=function(c){return document.querySelector(c)},D=1040,J=580,T=900,S=performance.now()+D,A;if(!z||!(Q("[data-intro-land]")||location.pathname==="/"))return;d.classList.add("intro-land");A=Q(".intro__strip").animate([{transform:"translateX(0)"},{transform:"translateX(-100%)"}],{duration:J,easing:"steps(12)"});A.startTime=S;A=Q(".intro__bg").animate([{opacity:1},{opacity:0}],{duration:380,fill:"both"});A.startTime=S;setTimeout(function(){requestAnimationFrame(function(){if(d.classList.contains("intro-done"))return;var t,i,a=document.querySelectorAll("[data-intro-land]");for(i=0;i<a.length;i++)if(a[i].getBoundingClientRect().width){t=a[i];break}if(!t)return end();var r=t.getBoundingClientRect(),q=z.getBoundingClientRect(),dx=r.left+r.width/2-q.left-q.width/2,dy=r.top+r.height/2-q.top-q.height/2,s=r.width/q.width,H=innerHeight*.2,b=r.height*.1,g=dx<0?-1:1,k=[],u,j,P=function(x,y,c){return"translate("+x+"px,"+y+"px) scale("+c+")"};for(j=0;j<=20;j++){u=j/20;k.push({offset:u*J/T,transform:P(dx*u,dy*u-4*H*u*(1-u),1+(s-1)*u-.24*u*(1-u))})}k[20].easing="cubic-bezier(.33,.67,.67,1)";k.push({offset:(J+110)/T,transform:P(dx,dy-b,s),easing:"cubic-bezier(.33,0,.67,.33)"},{offset:(J+230)/T,transform:P(dx,dy,s)},{offset:1,transform:P(dx,dy,s)});A=z.animate(k,{duration:T,fill:"both"});A.startTime=S;A.onfinish=end;A=Q(".intro__rock").animate([{transform:"rotate(0deg)"},{offset:.2,transform:"rotate("+9*g+"deg)"},{offset:J/T,transform:"rotate(0deg)"},{offset:(J+110)/T,transform:"rotate("+-7*g+"deg)"},{offset:(J+230)/T,transform:"rotate("+4*g+"deg)"},{transform:"rotate(0deg)"}],{duration:T,easing:"ease-in-out"});A.startTime=S})},400)}`;

const INTRO_START = `d.dataset.intro="on";d.classList.add("preloading");s.setItem("${INTRO_KEY}","1");var L=location.pathname==="/",I=L?${JSON.stringify(INTRO_IMAGES.slice(0, 1))}:${JSON.stringify(INTRO_IMAGES)},n=0;if(L)d.classList.add("intro-land");var open=function(){d.classList.remove("preloading")},end=function(){d.classList.add("intro-done");open();removeEventListener("pointerdown",end);removeEventListener("keydown",end)},land=${INTRO_LAND},go=function(){if(++n===I.length&&!d.classList.contains("intro-done")){land();d.classList.add("intro-go")}};I.forEach(function(u){var i=new Image();i.fetchPriority="high";i.src=u;i.decode().then(go,end)});d.addEventListener("animationend",function(e){if(e.animationName==="intro-bg")open();if(e.animationName==="intro-zoom")end()});addEventListener("pointerdown",end);addEventListener("keydown",end);setTimeout(function(){if(!d.classList.contains("intro-go"))end()},2500);setTimeout(end,5000)`;

/**
 * Runs in <head> before the first paint. The intro plays once, when a visit starts on the home page; a visit that
 * starts on any other page marks it as seen, so later page loads skip it, and visitors who prefer reduced motion
 * never see it. `?intro` in the address plays it again, for checking it (so does the old preview link,
 * `?preview=character`). The mouse pointer is the normal one (Lucky, 25 Nov).
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement,s=sessionStorage;if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&(/[?&](intro|preview=character)\\b/.test(location.search)||(!s.getItem("${INTRO_KEY}")&&location.pathname==="/"))){${INTRO_START}}else s.setItem("${INTRO_KEY}","1")}catch(e){}`;
