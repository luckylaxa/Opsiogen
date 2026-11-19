"use client";

import { useEffect, useRef } from "react";
import { INTRO_IMAGES } from "@/lib/theme";

type Hover = "default" | "link" | "view" | "text";

const LINKS = "a, button, [role='button'], select, summary, label, input[type='checkbox'], input[type='radio']";
const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";
/** As the hero character's own press: a click on these is not a click on the hero's empty space. */
const NOT_EMPTY = "a, button, input, textarea, select, [role='button'], dialog, .site-header";
/** Where the spray goes, one after another: the hero character's own directions (x, y on the screen). */
const SPRAYS: [number, number][] = [[-1, -0.25], [-0.8, 0.5], [-1, 0.1], [0.9, -0.35]];
/** The character as the pointer: its picture box in px (about 36 px of character). */
const SMALL = 37;
/** One full turn in the picture strip (public/intro/turn.webp); frame 0 faces the visitor. */
const FRAMES = 12;

function hoverFor(t: EventTarget | null): Hover {
  if (!(t instanceof Element)) return "default";
  const marked = t.closest<HTMLElement>("[data-cursor]");
  if (marked) return (marked.dataset.cursor as Hover) || "link";
  if (t.closest(TEXT)) return "text";
  if (t.closest(LINKS)) return "link";
  return "default";
}
const clamp = (q: number) => Math.min(1, Math.max(0, q));
const io = (q: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(q));
const out3 = (q: number) => 1 - Math.pow(1 - clamp(q), 3);
/** The frame that turns its eye to the right of the screen (a quarter turn) or to the left (three quarters). */
const facing = (dx: number) => (dx >= 0 ? 3 : 9);
/** `n` steps from one frame toward another, the shorter way round, stopping there. */
function steps(from: number, to: number, n: number) {
  const d = ((to - from + 18) % FRAMES) - 6;
  const k = Math.min(Math.abs(d), n);
  return (from + Math.sign(d) * k + FRAMES) % FRAMES;
}

/**
 * The character pointer being tried (Lucky, 19 Nov; on with `?preview=character`, see CURSOR_KEY in lib/theme.ts).
 * On a computer with a mouse, the main character itself is the pointer, scaled down: a step behind the mouse, filled
 * ripples of our colours over links and work ("View" over work), the normal typing cursor in text fields. A click
 * turns it once; in the hero's empty space it then faces the spray's way, sprays the hero's fog of light from its
 * eye, and the hero's colours change (the real `hero:pulse`), then it turns back. Its home is the dock at the lower
 * right, where the intro lands it: a moment's hover there brings it home at full size while a small dot points, and
 * moving away sends it back to the pointer. On Home it takes over from the page's own character at the first move.
 * Pictures are the intro's (already loaded); only transforms and opacity move.
 */
export function CharacterCursor() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const root = document.documentElement;
    const pick = (s: string) => el.querySelector<HTMLElement>(s)!;
    const ch = pick(".ccur__char"), strip = pick(".ccur__strip"), dock = pick(".ccur__dock"), dot = pick(".ccur__dot");
    const tag = pick(".ccur__view"), fog = pick(".ccur__fog"), ripples = pick(".ccur__ripples");
    root.classList.add("has-cursor");

    let mx = -200, my = -200, seen = false;
    let x = -200, y = -200, s = 1;                       // the character's middle on the screen, and its scale (1: home)
    let mode: "home" | "pointer" = "pointer";
    let fly: { fx: number; fy: number; fs: number; to: "home" | "pointer"; t0: number; dur: number } | null = null;
    let spin: { t0: number; face: number | null; dir: [number, number]; cx: number; cy: number; fired: boolean } | null = null;
    let frame = 0, hover: Hover = "default", homeAt = 0, nextRipple = 0, sprayN = 0, raf = 0, last = 0;

    // On Home, after the intro, the page's own character sits on the dock's spot: it stays until the visitor moves
    // the mouse away from it, then hands over (it hides; this one takes its place and flies to the pointer).
    let taken = root.classList.contains("ccur-taken");
    if (!taken) {
      const hero = document.querySelector<HTMLElement>("[data-intro-land]");
      const a = hero?.getBoundingClientRect(), b = dock.getBoundingClientRect();
      const there = !!a && a.width > 0 && Math.abs(a.left + a.width / 2 - (b.left + b.width / 2)) < 24 && Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < 24;
      if (there) { mode = "home"; el.dataset.hero = ""; } else { taken = true; root.classList.add("ccur-taken"); }
    }
    const introDone = () => !root.dataset.intro || root.classList.contains("intro-done");

    const startFly = (to: "home" | "pointer", now: number) => { fly = { fx: x, fy: y, fs: s, to, t0: now, dur: to === "home" ? 560 : 620 }; homeAt = 0; spin = null; };
    const ripple = (cx: number, cy: number, r: number) => {
      const n = document.createElement("span");
      n.className = "ccur__ripple"; n.style.left = `${cx}px`; n.style.top = `${cy}px`; n.style.setProperty("--r", `${r}px`);
      ripples.appendChild(n);
      n.animate([{ scale: "1", opacity: 0.42 }, { scale: `${(r + 30) / r}`, opacity: 0 }], { duration: 1300, easing: "cubic-bezier(0.2,0.7,0.2,1)" }).onfinish = () => n.remove();
    };
    // The hero's spray: a fog of rainbow light from the eye, starting at the edge of the body, widening and fading.
    const sprayFrom = (cx: number, cy: number, r: number, dir: [number, number]) => {
      const len = Math.hypot(dir[0], dir[1]), ux = dir[0] / len, uy = dir[1] / len;
      fog.style.left = `${cx + ux * r * 0.8}px`; fog.style.top = `${cy + uy * r * 0.8}px`; fog.style.rotate = `${Math.atan2(uy, ux)}rad`;
      fog.style.setProperty("--fw", `${Math.max(64, r * 2)}px`);
      Array.from(fog.children).forEach((m, n) =>
        (m as HTMLElement).animate(
          [{ scale: "0.1 0.5", opacity: 0 }, { scale: "0.8 0.9", opacity: 1, offset: 0.25 }, { scale: "1 1", opacity: 0.9, offset: 0.65 }, { scale: "1.15 1.2", opacity: 0 }],
          { duration: 1500, delay: n * 90, easing: "cubic-bezier(0.2,0.7,0.2,1)" },
        ),
      );
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(50, now - (last || now)); last = now;
      const b = dock.getBoundingClientRect(), w = ch.offsetWidth, small = SMALL / (w || SMALL);
      const dcx = b.left + b.width / 2, dcy = b.top + b.height / 2;
      const near = (pad: number) => mx > b.left - pad && mx < b.right + pad && my > b.top - pad && my < b.bottom + pad;
      if (seen && !taken && introDone() && !near(30)) {
        taken = true; root.classList.add("ccur-taken"); delete el.dataset.hero;
        x = dcx; y = dcy; s = 1; startFly("pointer", now);
      } else if (seen && taken && !fly) {
        if (mode === "pointer" && near(10)) { homeAt ||= now; if (now - homeAt > 300) startFly("home", now); }
        else if (mode === "pointer") homeAt = 0;
        if (mode === "home" && !near(30)) startFly("pointer", now);
      }
      if (fly) {
        const k = Math.min(1, (now - fly.t0) / fly.dur), e = io(k);
        const tx = fly.to === "home" ? dcx : mx, ty = fly.to === "home" ? dcy : my, ts = fly.to === "home" ? 1 : small;
        const midx = (fly.fx + tx) / 2, midy = Math.min(fly.fy, ty) - (fly.to === "home" ? 70 : 140);
        x = (1 - e) * (1 - e) * fly.fx + 2 * (1 - e) * e * midx + e * e * tx;
        y = (1 - e) * (1 - e) * fly.fy + 2 * (1 - e) * e * midy + e * e * ty;
        s = fly.fs + (ts - fly.fs) * out3(k);
        frame = Math.floor(k * FRAMES) % FRAMES;                               // one turn on the way
        if (k >= 1) { mode = fly.to; fly = null; frame = 0; }
      } else if (mode === "home") {
        x = dcx; y = dcy + Math.sin(now / 700) * w * 0.02; s = 1;
        frame = mx < dcx - 50 ? 11 : mx > dcx + 50 ? 1 : 0;                    // it looks toward the pointer
      } else {
        const k = Math.min(1, (1 - Math.pow(0.0001, dt / 1000)) * 2.2);       // a step behind the mouse
        x += (mx - x) * k; y += (my - y) * k; s = small; frame = 0;
      }
      if (spin && !fly) {
        // A click: one full turn; in the hero's empty space it then turns its eye the spray's way, sprays, turns back.
        const e = now - spin.t0, A = 450, B = A + 3 * 45, C = B + 900, E = C + 3 * 45;
        if (e < A) frame = Math.floor(e / 37.5) % FRAMES;
        else if (spin.face === null) { frame = 0; spin = null; }
        else if (e < B) frame = steps(0, spin.face, Math.floor((e - A) / 45) + 1);
        else if (e < C) {
          frame = spin.face;
          if (!spin.fired) {
            spin.fired = true;
            sprayFrom(x, y, (w * s) / 2, spin.dir);
            window.dispatchEvent(new CustomEvent("hero:pulse", { detail: { x: spin.cx, y: spin.cy } }));
          }
        } else if (e < E) frame = steps(spin.face, 0, Math.floor((e - C) / 45) + 1);
        else { frame = 0; spin = null; }
      }
      const pointing = mode === "pointer" && !fly;
      if (pointing && (hover === "link" || hover === "view") && now >= nextRipple) { ripple(x, y, (w * s) / 2 + 2); nextRipple = now + 900; }
      ch.style.transform = `translate3d(${x - w / 2}px, ${y - w / 2}px, 0) scale(${s})`;
      strip.style.transform = `translateX(${(-frame * 100) / FRAMES}%)`;
      tag.style.transform = `translate3d(${x + (w * s) / 2 + 10}px, ${y - 13}px, 0)`;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      el.toggleAttribute("data-view", pointing && hover === "view");
      el.toggleAttribute("data-dot", seen && (mode === "home" || fly?.to === "home"));
    };

    const setHover = (h: Hover) => {
      if (h === hover) return;
      hover = h;
      el.toggleAttribute("data-text", h === "text");
      root.classList.toggle("has-cursor", h !== "text");               // in a text field: the normal typing cursor
      if (h === "link" || h === "view") nextRipple = 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; if (mode === "pointer") { x = mx; y = my; } }
      el.removeAttribute("data-hidden");
      setHover(hoverFor(e.target));
    };
    let pending = 0;
    const refresh = () => {
      if (!seen || pending) return;
      pending = requestAnimationFrame(() => { pending = 0; setHover(hoverFor(document.elementFromPoint(mx, my))); });
    };
    const leave = (e: MouseEvent) => { if (!e.relatedTarget) el.setAttribute("data-hidden", ""); };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || mode !== "pointer" || fly) return;
      const t = e.target as Element, hero = document.querySelector("[data-intro-land]");
      const empty = !!hero && !t.closest(NOT_EMPTY) && window.scrollY <= window.innerHeight * 0.5;
      const dir = SPRAYS[sprayN % SPRAYS.length];
      if (empty) sprayN++;
      spin = { t0: performance.now(), face: empty ? facing(dir[0]) : null, dir, cx: e.clientX, cy: e.clientY, fired: false };
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    document.addEventListener("scroll", refresh, { capture: true, passive: true });
    window.addEventListener("cursor:refresh", refresh);
    document.addEventListener("mouseout", leave);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("scroll", refresh, { capture: true });
      window.removeEventListener("cursor:refresh", refresh);
      document.removeEventListener("mouseout", leave);
    };
  }, []);

  return (
    <div ref={box} aria-hidden="true" className="ccur" data-hidden="">
      <span className="ccur__dock">
        <span className="ccur__pool" />
      </span>
      <span className="ccur__ripples" />
      <span className="ccur__fog">
        {[["3", "1.9", "18px"], ["2.2", "1.2", "9px"]].map(([w, h, blur]) => (
          <span key={w} className="ccur__mist" style={{ width: `calc(var(--fw) * ${w})`, height: `calc(var(--fw) * ${h})`, filter: `blur(${blur})` }}>
            <span />
          </span>
        ))}
      </span>
      <span className="ccur__char">
        <span className="ccur__strip" style={{ backgroundImage: `url(${INTRO_IMAGES[0]})` }} />
      </span>
      <span className="ccur__view">View</span>
      <span className="ccur__dot" />
    </div>
  );
}
