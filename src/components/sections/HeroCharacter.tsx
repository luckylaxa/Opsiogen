"use client";

import { useEffect, useRef } from "react";

/**
 * The light trail: a soft fog of rainbow light pouring straight out of its back (the side away from its eye) while it
 * flies fast. The scene shows through it. The wedge is cut on the inner layer and blurred on the outer one, so it
 * has no hard edge anywhere.
 */
const TRAIL: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(255 110 190 / 0.9) 0%, rgb(190 120 255 / 0.9) 16%, rgb(105 140 255 / 1) 30%, rgb(80 220 255 / 1) 44%, rgb(110 235 150 / 0.9) 57%, rgb(255 232 110 / 0.9) 70%, rgb(255 165 90 / 0.9) 83%, rgb(255 110 180 / 0.9) 100%)",
  maskImage: "linear-gradient(270deg, #000 0%, rgb(0 0 0 / 0.75) 45%, rgb(0 0 0 / 0.3) 100%)",
  WebkitMaskImage: "linear-gradient(270deg, #000 0%, rgb(0 0 0 / 0.75) 45%, rgb(0 0 0 / 0.3) 100%)",
  clipPath: "polygon(100% 36%, 0 4%, 0 96%, 100% 64%)",
};

/** The light it throws on the ground below it: our colours in a soft pool, with a faint shadow under it. */
const GLOW: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 50% 50% at 50% 50%, rgb(20 16 40 / 0.34), transparent 70%), linear-gradient(90deg, #35d4ff 4%, #5a7dff 26%, #b667ff 48%, #ff5fb4 70%, #ff9a3c 96%)",
  maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 20%, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 20%, transparent 72%)",
};

/**
 * Whether this browser draws WebGL on a graphics chip. Without one (no graphics driver, a remote or virtual desktop, a
 * chip the browser has turned off) WebGL falls back to drawing in software: each frame of the 3D then takes up to a
 * second and the page stops answering, so the still picture stays instead.
 */
function drawsOnGpu() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      c.getContext("webgl", { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}

/**
 * Our character (version 3), drawn live as a real 3D model (src/lib/character3d.js) in the Home picture. It faces the
 * visitor with a happy smile and its rainbow ring always turning; its eyes open and follow the pointer. It waves hello
 * when it comes alive, and its hands float gently at its sides, below the ring. Poked, it is
 * surprised (hands to its cheeks, "!!") and its little screen says what we do; a click elsewhere on the first screen
 * turns it that way for a wink and a finger gun as a fog of colour sprays toward the click; left alone it thinks, a
 * finger on its chin ("?"). A pool of coloured light sits on the ground below it. As the visitor scrolls through the
 * hero it turns and flies off into the scene, and only while it moves fast does a fan of rainbow light pour from its
 * back. The 3D code and the model load after the page has loaded, so the first screen never waits for them; until
 * then, and where 3D cannot be drawn on a graphics chip, a still picture shows instead.
 */
export function HeroCharacter({ className }: { className?: string }) {
  const box = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const trail = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!box.current || !canvas.current || !still.current || !trail.current || !glow.current) return;
    const el = box.current, cv = canvas.current, img = still.current, tr = trail.current, gw = glow.current;
    const stage = el.closest<HTMLElement>("[data-hero-stage]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop = false, raf = 0, cleanup: (() => void) | null = null;
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

    // Scroll through the hero: progress 0 to 1, and how fast the visitor is scrolling.
    let progress = 0, speed = 0, lastY = window.scrollY;
    const measure = () => {
      if (!stage) return;
      const r = stage.getBoundingClientRect(), span = r.height - window.innerHeight;
      progress = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      stage.style.setProperty("--hero-p", progress.toFixed(4));
    };
    const onScroll = () => { const y = window.scrollY; speed += Math.abs(y - lastY); lastY = y; measure(); };
    measure();
    // The speed streaks at the edges of the picture: filled in only once the page has loaded.
    const rush = stage ? Array.from(stage.querySelectorAll<HTMLElement>("[data-hero-rush]")) : [];
    const fillRush = () => {
      const narrow = window.matchMedia("(max-width: 639px)").matches;
      for (const r of rush) { const u = (narrow && r.dataset.narrow) || r.dataset.wide; if (u) r.style.backgroundImage = `url("${u}")`; }
    };

    let want = [0, 0], over = 0, poseUntil = 0, fire = 0, pose = [0, 0];
    // Its expressions (EXPRESSIONS in lib/character3d.js): `say` plays one for a while; otherwise it smiles at rest and
    // opens its eyes while the pointer moves. Left alone for a while, it thinks.
    let said = "happy", saidUntil = 0, lastPoke = performance.now(), nextThink = lastPoke + 8000;
    const say = (name: string, ms: number) => { said = name; saidUntil = performance.now() + ms; };
    // The points in the picture: when the pointer goes to one, the character looks at it and its little screen opens.
    // Left alone for a while it shows them one by one itself; a press on the character shows the next one beside it.
    const spots = stage ? Array.from(stage.querySelectorAll<HTMLElement>("[data-hero-spot]")) : [];
    let hover: HTMLElement | null = null, shown: HTMLElement | null = null, turn = -1, lastMove = performance.now(), nextAuto = lastMove + 5000, hide = 0;
    const nt = note.current;
    const close = () => { if (shown) delete shown.dataset.on; shown = null; if (nt) nt.style.opacity = "0"; };
    const show = (beside: boolean) => {
      if (!spots.length) return;
      close(); turn = (turn + 1) % spots.length; const sp = spots[turn];
      if (!beside && sp.offsetParent) { shown = sp; sp.dataset.on = ""; }
      else if (nt) { nt.children[1].textContent = sp.dataset.title ?? ""; nt.children[2].textContent = sp.dataset.text ?? ""; nt.style.opacity = "1"; }
      window.clearTimeout(hide); hide = window.setTimeout(close, 3800);
    };
    const onOver = (e: PointerEvent) => {
      const sp = (e.target as Element).closest<HTMLElement>("[data-hero-spot]");
      if (sp && sp !== hover) { close(); hover = sp; }
    };
    const onOut = (e: PointerEvent) => { if ((e.target as Element).closest("[data-hero-spot]") === hover) hover = null; };
    stage?.addEventListener("pointerover", onOver);
    stage?.addEventListener("pointerout", onOut);
    const lookAt = (sp: HTMLElement) => {
      const a = sp.getBoundingClientRect(), b = el.getBoundingClientRect();
      want = [clamp((a.left + a.width / 2 - b.left - b.width / 2) / (window.innerWidth * 0.3), -1.25, 1.25), clamp((a.top + a.height / 2 - b.top - b.height / 2) / (window.innerHeight * 0.34), -1, 1)];
    };

    // The pointer
    const onMove = (e: PointerEvent) => {
      lastMove = performance.now();
      if (hover) return;
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      want = [clamp(dx / (window.innerWidth * 0.4), -1, 1), clamp(dy / (window.innerHeight * 0.4), -1, 1)];
      over = Math.hypot(dx, dy) < r.width * 0.5 ? 1 : 0;
    };
    const onLeave = () => { want = [0, 0]; over = 0; };
    // A press anywhere on the first screen: it turns to look that way with a wink and a finger gun, and a fog of colour
    // sprays toward the press. A press on the character itself: it is surprised, and its little screen opens.
    const spray = (ux: number, uy: number) => {
      lastMove = lastPoke = performance.now();
      pose = [ux * 1.15, uy * 0.6]; poseUntil = performance.now() + 1900; say("wink", 1900);
      window.clearTimeout(fire);
      fire = window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        const dx = Math.sin(pose[0]) * r.width * 0.3, dy = Math.sin(pose[1]) * r.height * 0.3;
        window.dispatchEvent(new CustomEvent("hero:pulse", { detail: { x: r.left + r.width / 2 + dx, y: r.top + r.height / 2 + dy } }));
        const fl = el.querySelector<HTMLElement>("[data-flash]");
        if (fl && !reduce) {
          // The fog starts at the edge of its body, so it never covers its face.
          fl.style.left = `${r.width / 2 + ux * r.width * 0.3}px`; fl.style.top = `${r.height / 2 + uy * r.height * 0.3}px`;
          fl.style.rotate = `${Math.atan2(uy, ux)}rad`;
          Array.from(fl.children).forEach((fog, n) => {
            (fog as HTMLElement).animate(
              [{ scale: "0.1 0.5", opacity: 0 }, { scale: "0.8 0.9", opacity: 1, offset: 0.25 }, { scale: "1 1", opacity: 0.9, offset: 0.65 }, { scale: "1.15 1.2", opacity: 0 }],
              { duration: 1900, delay: n * 90, easing: "cubic-bezier(0.2,0.7,0.2,1)" },
            );
          });
        }
      }, 380);
    };
    const greet = (e: MouseEvent) => {
      e.stopPropagation(); show(true);
      lastMove = lastPoke = performance.now(); poseUntil = 0; say("surprised", 2200);
    };
    const onPress = (e: MouseEvent) => {
      const t = e.target as Element;
      if (t.closest("a, button, input, textarea, select, [role='button'], dialog, .site-header") || window.scrollY > window.innerHeight * 0.5) return;
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), len = Math.hypot(dx, dy);
      if (len > 8) spray(dx / len, dy / len);
    };
    const noFocusRing = (e: PointerEvent) => e.preventDefault();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    el.addEventListener("pointerdown", noFocusRing);
    el.addEventListener("click", greet);
    if (!stage) window.addEventListener("click", onPress);

    async function start() {
      if (stop || !drawsOnGpu()) return;
      if (!reduce) fillRush();
      const { createStage, loadCharacter, hand } = await import("@/lib/character3d");
      if (stop) return;
      let st: ReturnType<typeof createStage>;
      try { st = createStage(cv); } catch { return; }
      const ch = await loadCharacter().catch(() => null);
      if (!ch || stop) { st.gl.dispose(); return; }
      ch.attach(st);
      const gl = st.gl;

      let size = 0;
      // As sharp as the screen (up to 3 pixels a point, at most 1200 across), so its edges stay clean on phones.
      const fit = () => { const w = Math.round(cv.clientWidth); if (!w || w === size) return; size = w; gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3, 1200 / w)); gl.setSize(w, w, false); };
      window.addEventListener("resize", fit);
      cleanup = () => { window.removeEventListener("resize", fit); gl.dispose(); };

      // A quick, springy turn: it follows the pointer at once and settles without wobbling.
      const AWAY = 1.2;                                                      // turned side-on to fly off to the right, so its back (where the trail comes from) is on the left
      let yaw = 0, yawV = 0, pitch = 0, pitchV = 0, lean = [0, 0], grow = 0, flyX = 0, ring = 0, blinkAt = 2, blinkTo = 0, prev = performance.now();
      let face = { from: "happy", to: "happy", at: -1e9 };
      // It waves hello when it first comes alive.
      const helloAt = performance.now() + 300;
      const frame = (now: number) => {
        if (stop) return;
        const dt = Math.min(0.05, (now - prev) / 1000); prev = now; const t = now / 1000;
        speed *= Math.pow(0.02, dt);
        const v = reduce ? 0 : clamp(speed / 90, 0, 1);                     // how fast it is flying, from the scroll
        const away = reduce ? 0 : clamp(progress * 1.6, 0, 1);               // how far it has turned to fly off
        if (progress > 0.04) { if (shown || (nt && nt.style.opacity === "1")) close(); }
        else if (!reduce && !hover && now - lastMove > 6000 && now > nextAuto && !document.hidden) { show(false); nextAuto = now + 6500; }
        if (hover) lookAt(hover); else if (shown) lookAt(shown); else if (now - lastMove > 6000) want = [0, 0];
        const follow = 1 - Math.pow(1e-7, dt);
        lean = [lean[0] + (want[0] - lean[0]) * follow, lean[1] + (want[1] - lean[1]) * follow];
        const posed = now < poseUntil;
        // Left alone (no pointer, press or scroll) for a while, it thinks, now and then.
        if (!reduce && away < 0.1 && now - Math.max(lastMove, lastPoke) > 7000 && now > nextThink && !document.hidden) { say("thinking", 2800); nextThink = now + 12000; }
        const want_ = now < saidUntil ? said : now - lastMove < 2500 ? "neutral" : "happy";
        if (want_ !== face.to) face = { from: face.to, to: want_, at: now };
        const ft = clamp((now - face.at) / 380, 0, 1);
        const aimY = (1 - away) * (posed ? pose[0] : lean[0] * 0.95) + away * AWAY, aimX = (1 - away) * (posed ? pose[1] : lean[1] * 0.55) + away * 0.05;
        const k = posed ? 70 : 420, c = 2 * Math.sqrt(k) * 0.95;
        // In small steps, so the spring stays steady however slowly the frames come (a slow phone, a busy page).
        for (let n = Math.ceil(dt * 240), h = dt / n, i = 0; i < n; i++) {
          yawV += ((aimY - yaw) * k - yawV * c) * h; yaw += yawV * h; pitchV += ((aimX - pitch) * k - pitchV * c) * h; pitch += pitchV * h;
        }
        if (t > blinkAt) { blinkTo = t + 0.13; blinkAt = t + 3 + Math.random() * 3.5; }   // its open eyes blink now and then
        // The ring turns all the time it is about, faster as it flies.
        if (!reduce) ring -= dt * (1.1 + v * 5);
        grow += ((over && away < 0.1 ? 1 : 0) - grow) * (1 - Math.pow(0.0001, dt));
        // It flies off to the right across the scene, eye first, while the picture moves toward us a little.
        flyX += (progress - flyX) * (1 - Math.pow(0.0005, dt));
        const fx = flyX * window.innerWidth * 0.3, fy = -flyX * window.innerHeight * 0.05, fs = 1 - flyX * 0.25;
        const bob = reduce ? 0 : Math.sin(t * 1.7) * 5;
        el.style.transform = `translate(${(fx + lean[0] * 30 * (1 - away)).toFixed(1)}px,${(fy + bob + lean[1] * 18 * (1 - away)).toFixed(1)}px) scale(${((1 + grow * 0.06) * fs).toFixed(3)})`;
        // The trail shows only while it flies fast, longer the faster it goes. It keeps its size as the character shrinks.
        tr.style.opacity = (clamp((v - 0.08) / 0.4, 0, 1) * clamp(away * 3, 0, 1) * 0.72).toFixed(3);
        tr.style.transform = `translateY(-50%) rotate(-17deg) scale(${((0.6 + v * 0.45) / fs).toFixed(3)},${((0.9 + v * 0.15) / fs).toFixed(3)})`;
        // The pool of light on the ground: it stays put while the character bobs above it, and breathes a little.
        // It belongs to standing still, so it goes as soon as the character flies fast and comes back when it stops.
        const lift = bob / Math.max(1, size);
        gw.style.opacity = ((0.86 + (reduce ? 0 : Math.sin(t * 1.7) * 0.06)) * (1 - clamp(v * 4, 0, 1))).toFixed(3);
        gw.style.transform = `translateY(${(-bob).toFixed(1)}px) scale(${(1 + lift * 0.6).toFixed(3)})`;
        for (const r of rush) r.style.opacity = (clamp((v - 0.05) / 0.5, 0, 1) * 0.16).toFixed(3);
        fit();
        // Its hands float gently, wave hello at first, and trail behind it as it flies off.
        const hi = (now - helloAt) / 1000, wave = reduce || hi < 0 || hi > 1.7 ? 0 : clamp(Math.min(hi / 0.25, (1.7 - hi) / 0.3), 0, 1);
        ch.pose({
          yaw, pitch, roll: -lean[0] * 0.08 * (1 - away) - away * 0.1, look: [lean[0] * (1 - away), -lean[1] * (1 - away)],
          from: face.from, to: face.to, t: ft, blink: t < blinkTo ? 1 : 0, ring,
          sign: clamp((now - face.at - 150) / 450, 0, 1),
          time: reduce ? 0 : t, hands: wave > 0 ? { R: hand("wave", "R", hi) } : undefined, handsMix: wave,
          drift: away > 0.1 && v > 0.05 ? [v * 1.2, 0] : undefined,
        });
        st.render();
        raf = requestAnimationFrame(frame);
      };
      fit(); ch.pose({}); st.render();
      cv.style.opacity = "1"; img.style.opacity = "0";
      raf = requestAnimationFrame(frame);
    }

    // The 3D costs a mid-range phone about half a second of script, so it waits until the page has loaded
    // and then for the visitor's first move (mouse, touch, scroll or key) or six quiet seconds, whichever
    // comes first; the still picture stands in until then. It never slows the first screen or the first tap.
    const KICK = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    let wake = 0;
    const unarm = () => {
      window.clearTimeout(wake);
      KICK.forEach((e) => window.removeEventListener(e, kick));
    };
    function kick() {
      unarm();
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(() => void start(), { timeout: 1500 }); else setTimeout(() => void start(), 300);
    }
    const arm = () => {
      KICK.forEach((e) => window.addEventListener(e, kick, { passive: true }));
      wake = window.setTimeout(kick, 6000);
    };
    if (document.readyState === "complete") arm(); else window.addEventListener("load", arm, { once: true });

    return () => {
      stop = true; cancelAnimationFrame(raf); cleanup?.(); unarm(); window.removeEventListener("load", arm);
      window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", measure);
      el.removeEventListener("pointerdown", noFocusRing); el.removeEventListener("click", greet); window.removeEventListener("click", onPress);
      stage?.removeEventListener("pointerover", onOver); stage?.removeEventListener("pointerout", onOut); window.clearTimeout(hide); window.clearTimeout(fire);
    };
  }, []);

  return (
    <button
      ref={box}
      type="button"
      aria-label="Our character. Press to hear what we do here."
      className={`absolute block aspect-square w-[var(--w)] cursor-pointer rounded-full outline-offset-4 will-change-transform [-webkit-tap-highlight-color:transparent] ${className ?? "top-[calc(60%-var(--w)/2)] left-[calc(50%-var(--w)/2)] [--w:clamp(210px,64vw,322px)] md:top-[calc(42%-var(--w)/2)] md:left-[calc(39%-var(--w)/2)] md:[--w:clamp(280px,min(28vw,47.6svh),476px)]"}`}
    >
      {/* The trail starts behind its back and streams away to the left and a little down, widening as it goes. */}
      <span ref={trail} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-1/2 -z-10 h-[150%] w-[min(85vw,1200px)] origin-right opacity-0 blur-[clamp(16px,2.2vw,36px)]">
        <span className="absolute inset-0" style={TRAIL} />
      </span>
      <span ref={glow} aria-hidden="true" className="pointer-events-none absolute top-[76%] left-[12%] -z-10 h-[24%] w-[76%] opacity-85 blur-[clamp(6px,0.7vw,12px)]" style={GLOW} />
      {/* Its own little screen: what a press on it shows (and, on phones, what it shows by itself). */}
      <span ref={note} aria-live="polite" className="pointer-events-none absolute top-[108%] left-1/2 block w-[min(76vw,260px)] -translate-x-1/2 overflow-hidden rounded-[10px] border border-white/20 bg-[rgb(10_12_22/0.88)] px-3.5 pt-3 pb-3 text-left opacity-0 shadow-[0_12px_40px_rgb(0_0_0/0.45)] transition-opacity duration-200 md:top-auto md:bottom-[100%]">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#35d4ff,#5a7dff,#b667ff,#ff5fb4,#ff9a3c)]" />
        <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase" />
        <span className="mt-1 block text-[15px] leading-snug font-medium text-white" />
      </span>
      {/* The beam of light that shines from its eye on a press: in front of it, a short way out. */}
      <span data-flash aria-hidden="true" className="pointer-events-none absolute z-10 block size-0">
        {/* A fog of rainbow light: no edges anywhere. Each layer is cut to a widening wedge inside and blurred outside, and thins out with distance. */}
        {[["3", "1.9", "18px"], ["2.2", "1.2", "9px"]].map(([w, h, blur]) => (
          <span key={w} className="absolute top-0 left-0 block origin-left opacity-0" style={{ width: `calc(var(--w) * ${w})`, height: `calc(var(--w) * ${h})`, translate: "0 -50%", filter: `blur(${blur})` }}>
            <span
              className="absolute inset-0 block"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgb(255 105 180 / 1) 14%, rgb(120 130 255 / 1) 30%, rgb(70 215 255 / 1) 44%, rgb(120 235 140 / 1) 58%, rgb(255 232 100 / 1) 72%, rgb(255 150 90 / 1) 86%, transparent 100%)",
                clipPath: "polygon(0 42%, 100% 0, 100% 100%, 0 58%)",
                maskImage: "linear-gradient(90deg, transparent 0%, #000 14%, rgb(0 0 0 / 0.8) 52%, transparent 98%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 14%, rgb(0 0 0 / 0.8) 52%, transparent 98%)",
              }}
            />
          </span>
        ))}
      </span>
      {/* A small still that shows until the 3D model is drawn. Low priority: on a first visit it waits under the intro, so it must not hold up the page's main image. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
      <img ref={still} src="/home/character-front.webp" alt="" width={420} height={420} fetchPriority="low" className="absolute inset-0 size-full object-contain transition-opacity duration-300" />
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-0 transition-opacity duration-300" />
    </button>
  );
}
