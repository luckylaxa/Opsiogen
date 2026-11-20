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
/** Anything the visitor might want to use: the dock steps aside when it would cover one. */
const UI = `${LINKS}, ${TEXT}, [data-cursor]`;
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
 * The character pointer (Lucky, 19 Nov; for every visitor with a mouse since 20 Nov, see INTRO_SCRIPT in lib/theme.ts).
 * On a computer with a mouse, the main character itself is the pointer, scaled down: a step behind the mouse, side on
 * toward where it is going and face on when it rests (left alone for 2 s, it dances: a moonwalk, head snaps, a spin and a freeze), filled
 * ripples of our colours over links and work ("View" over work), the normal typing cursor in text fields. A click
 * turns it once; in the hero's empty space it then faces the spray's way, sprays the hero's fog of light from its
 * eye, and the hero's colours change (the real `hero:pulse`), then it turns back. Its home is the dock at the lower
 * right, where the intro lands it, with its pool of light only while it is there: a moment's hover on empty space there
 * brings it home at full size while a small dot points, and moving away (or going for a control) sends it back. Where
 * the dock would cover the page's controls (the showreel's buttons, say), it steps aside. On Home it takes over from the page's own character at the first move.
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
    let prevMx = mx, vx = 0, movedAt = 0, stepAt = 0, blocked = false, checkAt = 0;
    // The dock steps aside where it would cover the page's controls (a link, a button, a field, work), checked at
    // points across it; the page's own character on Home does not count.

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
    const coversUi = (b: DOMRect) => {
      for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) {
        const e = document.elementFromPoint(b.left + b.width * fx, b.top + b.height * fy);
        if (e && !e.closest("[data-intro-land]") && e.closest(UI)) return true;
      }
      return false;
    };

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
        if (now >= checkAt) { checkAt = now + 250; blocked = coversUi(b); }
        if (mode === "pointer" && near(10) && hover === "default" && !blocked) { homeAt ||= now; if (now - homeAt > 300) startFly("home", now); }
        else if (mode === "pointer") homeAt = 0;
        if (mode === "home" && (!near(30) || hover !== "default" || blocked)) startFly("pointer", now);
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
      } else {
        const k = Math.min(1, (1 - Math.pow(0.0001, dt / 1000)) * 2.2);       // a step behind the mouse
        x += (mx - x) * k; y += (my - y) * k; s = small;
      }
      vx = vx * 0.8 + (mx - prevMx) * 0.2; if (Math.abs(mx - prevMx) > 0.5) movedAt = now; prevMx = mx;
      // Left alone as the pointer (over plain space) for 2 s, it dances, in the manner of the King of Pop, on a 120 bpm
      // beat: it turns side on and moonwalks back, spins round the back and moonwalks home; snaps its head right, left,
      // right on the beat; spins up onto its toes and freezes, leaning back; then lets go (4.66 s, then again). A solid
      // character: it glides, turns and tilts, never changes shape, and stays by the pointer. Any move stops it.
      let rot = 0, dy = 0, dx = 0;
      const idle = now - movedAt, dancing = seen && mode === "pointer" && !fly && !spin && hover === "default" && idle > 2000;
      if (dancing) {
        const u = (idle - 2000) % 4660, q = (a: number, z: number) => clamp((u - a) / (z - a));
        const step = () => { const p = (u % 500) / 500; dy = -1.8 * Math.abs(Math.sin(2 * Math.PI * p)); rot = 4 * Math.sin(2 * Math.PI * p); };
        // (three quarters round rather than fully side on, so its eye still shows the way it faces as it glides back)
        if (u < 200) frame = Math.min(2, Math.floor(u / 66));                                   // turns side on
        else if (u < 1200) { frame = 2; dx = -22 * q(200, 1200); step(); }                      // moonwalks back
        else if (u < 1380) { frame = 2 + Math.min(8, Math.floor((u - 1200) / 22)); dx = -22; } // spins round the back
        else if (u < 2380) { frame = 10; dx = -22 + 22 * q(1380, 2380); step(); }              // moonwalks home
        else if (u < 2500) frame = (10 + Math.min(2, Math.floor((u - 2380) / 60))) % FRAMES;   // faces the visitor
        else if (u < 3300) {                                                                     // head snaps on the beat
          const i = Math.floor((u - 2500) / 200), from = [0, 13, -13, 13][i], to = [13, -13, 13, 0][i];
          rot = from + (to - from) * out3(((u - 2500) % 200) / 60); frame = 0;
        } else if (u < 3660) { const k = q(3300, 3660); frame = Math.floor((u - 3300) / 30) % FRAMES; dy = -5 * k - 3 * Math.sin(Math.PI * k); } // a spin up onto its toes
        else if (u < 4160) { rot = -16 * out3(q(3660, 3740)); dy = -5; frame = 0; }           // the freeze, leaning back
        else { const k = io(q(4160, 4560)); rot = -16 * (1 - k); dy = -5 * (1 - k); frame = 0; } // and lets go
      }
      if (!fly && !spin && !dancing) {
        // Looking for something it turns side on, toward where it is going (home: toward the pointer); at rest it
        // turns back to face the visitor. One picture at a time, so it turns rather than jumps.
        const want = mode === "home" ? (mx < dcx - 50 ? 10 : mx > dcx + 50 ? 2 : 0) : now - movedAt < 450 && Math.abs(vx) > 0.4 ? (vx > 0 ? 2 : 10) : 0;
        if (frame !== want && now - stepAt > 45) { frame = steps(frame, want, 1); stepAt = now; }
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
      ch.style.transform = `translate3d(${x - w / 2 + dx}px, ${y - w / 2 + dy}px, 0) scale(${s}) rotate(${rot}deg)`;
      strip.style.transform = `translateX(${(-frame * 100) / FRAMES}%)`;
      tag.style.transform = `translate3d(${x + (w * s) / 2 + 10}px, ${y - 13}px, 0)`;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      el.toggleAttribute("data-view", pointing && hover === "view");
      el.toggleAttribute("data-dot", seen && (mode === "home" || fly?.to === "home"));
      el.toggleAttribute("data-home", mode === "home" || fly?.to === "home");
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
      movedAt = performance.now();                                           // scrolling: not idle
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
      movedAt = performance.now();
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
