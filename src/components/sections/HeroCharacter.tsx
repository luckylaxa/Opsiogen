"use client";

import { useEffect, useRef } from "react";

/**
 * The light trail: a soft fog of rainbow light pouring straight out of its back (the side away from its eye) while it
 * flies fast. The scene shows through it. The wedge is cut on the inner layer and blurred on the outer one, so it
 * has no hard edge anywhere.
 */
const TRAIL: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(255 110 190 / 0.9) 0%, rgb(190 120 255 / 0.9) 16%, rgb(105 140 255 / 0.9) 30%, rgb(80 220 255 / 0.9) 44%, rgb(110 235 150 / 0.9) 57%, rgb(255 232 110 / 0.9) 70%, rgb(255 165 90 / 0.9) 83%, rgb(255 110 180 / 0.9) 100%)",
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
 * Our character, drawn live as a real 3D model, in the Home picture. It faces the visitor and its eye
 * follows the pointer straight away; a click makes its eye blink and turns it to look a new way for a moment. A pool of coloured light sits on the
 * ground below it. As the visitor scrolls through the hero it turns and flies off into the scene, and only
 * while it moves fast does a fan of rainbow light pour from its back. The 3D code and the model load after the page has loaded, so the first screen never
 * waits for them; until then, and where 3D cannot be drawn, a still picture shows instead.
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

    let want = [0, 0], blink = 0, blinkAt = 2, over = 0, turnTo = -1, poseUntil = 0;
    // Where it looks after each press (turn, tilt), in order.
    const POSES = [[0.95, -0.12], [-0.95, 0.1], [0.55, -0.42], [-0.6, 0.34], [1.25, 0.05], [-1.2, -0.08]];
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
      blink = 1; window.clearTimeout(hide); hide = window.setTimeout(close, 3800);
    };
    const onOver = (e: PointerEvent) => {
      const sp = (e.target as Element).closest<HTMLElement>("[data-hero-spot]");
      if (sp && sp !== hover) { close(); hover = sp; blink = 1; }
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
    const greet = () => {
      // A press: its eye blinks and it turns to look a new way for a moment, a different way each time. One calm turn, never a spin.
      blink = 1; lastMove = performance.now(); show(true);
      turnTo = (turnTo + 1) % POSES.length; poseUntil = performance.now() + 1500;
      // Tell the background light where the press came from (Home's glow listens for this).
      const r = el.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent("hero:pulse", { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
    };
    const noFocusRing = (e: PointerEvent) => e.preventDefault();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    el.addEventListener("pointerdown", noFocusRing);
    el.addEventListener("click", greet);

    async function start() {
      if (stop) return;
      if (!reduce) fillRush();
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      if (stop) return;
      THREE.ColorManagement.enabled = false;
      let gl: InstanceType<typeof THREE.WebGLRenderer>;
      try { gl = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { return; }
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(20, 1, 1, 20);
      cam.position.set(0, 0, 6.75);

      // What the glossy white body reflects: a soft white studio with two bright windows, a warm hint of the sunrise,
      // and colour coming up from below.
      const W = 512, H = 256, data = new Float32Array(W * H * 4);
      const wins = [[0.835, 0.885, 0.6, 0.8], [0.895, 0.93, 0.6, 0.8], [0.595, 0.64, 0.6, 0.77], [0.652, 0.682, 0.6, 0.77]];
      const blob = (u: number, v: number, cu: number, cv2: number, r: number) => { const a = (u - cu) * 2, b = v - cv2, q = 1 - Math.sqrt(a * a + b * b) / r; return q > 0 ? q * q : 0; };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const u = x / W, v = y / H, l = v > 0.5 ? 0.27 + (v - 0.5) * 0.4 : 0.07 + v * 0.4;
        let r = l * 0.97, g = l * 0.97, b = l * 1.02;
        const bl = blob(u, v, 0.9, 0.1, 0.34), pk = blob(u, v, 0.62, 0.1, 0.34), vi = blob(u, v, 0.76, 0.02, 0.3), sun = blob(u, v, 0.3, 0.6, 0.25);
        r += pk * 1.3 + vi * 0.5 + bl * 0.1 + sun * 0.9; g += bl * 0.35 + pk * 0.15 + vi * 0.18 + sun * 0.55; b += bl * 1.5 + vi * 0.9 + pk * 0.6 + sun * 0.25;
        for (const w of wins) if (u > w[0] && u < w[1] && v > w[2] && v < w[3]) { r += 7; g += 7; b += 7.3; }
        const o = (y * W + x) * 4; data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 1;
      }
      const env = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
      env.mapping = THREE.EquirectangularReflectionMapping; env.needsUpdate = true;
      const pm = new THREE.PMREMGenerator(gl);
      scene.environment = pm.fromEquirectangular(env).texture; env.dispose(); pm.dispose();
      const key = new THREE.DirectionalLight(0xffffff, 0.5); key.position.set(-3, 4, 4); scene.add(key);
      const blue = new THREE.PointLight(0x3f7bff, 0.9, 6, 0); blue.position.set(-1.3, -2.3, 1.7); scene.add(blue);
      const pink = new THREE.PointLight(0xff4fa0, 0.8, 6, 0); pink.position.set(1.4, -2.3, 1.7); scene.add(pink);

      const looks: Record<string, InstanceType<typeof THREE.Material>> = {
        body: new THREE.MeshPhysicalMaterial({ color: 0xeef0f6, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.04 }),
        base: new THREE.MeshPhysicalMaterial({ color: 0xdfe2ec, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }),
        socket: new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.6 }),
        gasket: new THREE.MeshPhysicalMaterial({ color: 0x07090d, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
        glass: new THREE.MeshPhysicalMaterial({ color: 0x020406, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
        seam: new THREE.MeshBasicMaterial({ color: 0xa9aebd }),
        strip: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
        stripGlow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      };
      type Mesh = InstanceType<typeof THREE.Mesh>;
      let hud: Mesh | null = null;
      let hudMat: InstanceType<typeof THREE.MeshBasicMaterial> | null = null;
      const file = await new GLTFLoader().loadAsync("/home/character.glb").catch(() => null);
      if (!file || stop) { gl.dispose(); return; }
      file.scene.traverse((o) => {
        const m = o as Mesh;
        if (!m.isMesh) return;
        const name = (m.material as InstanceType<typeof THREE.Material>).name;
        if (name === "hud") {
          const src = m.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          hudMat = new THREE.MeshBasicMaterial({ map: src.emissiveMap || src.map, toneMapped: false });
          m.material = hudMat; hud = m;
        } else if (looks[name]) { m.material = looks[name]; if (name === "glass" || name === "stripGlow") m.renderOrder = 2; }
      });
      const pivot = new THREE.Group(); pivot.rotation.order = "YXZ"; pivot.add(file.scene); scene.add(pivot);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x4de9ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.014), lineMat);
      if (hud) { const bb = new THREE.Box3().setFromObject(hud as Mesh); line.position.set(0, (bb.min.y + bb.max.y) / 2, bb.max.z + 0.02); }
      line.renderOrder = 1; pivot.add(line);

      let size = 0;
      const fit = () => { const w = Math.round(cv.clientWidth); if (!w || w === size) return; size = w; gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); gl.setSize(w, w, false); };
      window.addEventListener("resize", fit);
      cleanup = () => { window.removeEventListener("resize", fit); gl.dispose(); };

      // A quick, springy turn: it follows the pointer at once and settles without wobbling.
      const AWAY = 1.2;                                                      // turned side-on to fly off to the right, so its back (where the trail comes from) is on the left
      let yaw = 0, yawV = 0, pitch = 0, pitchV = 0, lean = [0, 0], grow = 0, flyX = 0, prev = performance.now();
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
        const pose = now < poseUntil ? POSES[turnTo] : null;
        const aimY = (1 - away) * (pose ? pose[0] : lean[0] * 0.95) + away * AWAY, aimX = (1 - away) * (pose ? pose[1] : lean[1] * 0.55) + away * 0.05;
        const k = pose ? 70 : 420, c = 2 * Math.sqrt(k) * 0.95;
        yawV += ((aimY - yaw) * k - yawV * c) * dt; yaw += yawV * dt; pitchV += ((aimX - pitch) * k - pitchV * c) * dt; pitch += pitchV * dt;
        if (Math.cos(yaw) > 0.9 && t > blinkAt && away < 0.1) { blink = 1; blinkAt = t + 3 + Math.random() * 3.5; }
        blink = Math.max(0, blink - dt / 0.3);                                  // a blink of light, not lids
        const ph = 1 - blink, dim = blink <= 0 ? 0 : ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : Math.max(0, 1 - (ph - 0.5) / 0.12);
        const fl = blink > 0 && ph > 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
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
        pivot.rotation.y = yaw; pivot.rotation.x = pitch; pivot.rotation.z = -lean[0] * 0.08 * (1 - away) - away * 0.1;
        if (hud && hudMat) {
          (hud as Mesh).position.x = lean[0] * 0.06 * (1 - away); (hud as Mesh).position.y = -lean[1] * 0.05 * (1 - away);
          (hudMat as InstanceType<typeof THREE.MeshBasicMaterial>).color.setScalar(1.5 * (1 - dim * 0.94) + fl * 1.2);
        }
        lineMat.opacity = dim;
        gl.render(scene, cam);
        raf = requestAnimationFrame(frame);
      };
      fit(); gl.render(scene, cam);
      cv.style.opacity = "1"; img.style.opacity = "0";
      raf = requestAnimationFrame(frame);
    }

    // Wait for the page to finish loading, then for a quiet moment, so the 3D never slows the first screen.
    const later = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(() => void start(), { timeout: 2500 }); else setTimeout(() => void start(), 600);
    };
    if (document.readyState === "complete") later(); else window.addEventListener("load", later, { once: true });

    return () => {
      stop = true; cancelAnimationFrame(raf); cleanup?.();
      window.removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", measure);
      el.removeEventListener("pointerdown", noFocusRing); el.removeEventListener("click", greet);
      stage?.removeEventListener("pointerover", onOver); stage?.removeEventListener("pointerout", onOut); window.clearTimeout(hide);
    };
  }, []);

  return (
    <button
      ref={box}
      type="button"
      aria-label="Our character. Press to hear what we do here."
      className={`absolute block aspect-square w-[var(--w)] cursor-pointer rounded-full outline-offset-4 will-change-transform [-webkit-tap-highlight-color:transparent] ${className ?? "top-[calc(60%-var(--w)/2)] left-[calc(50%-var(--w)/2)] [--w:clamp(150px,46vw,230px)] md:top-[calc(42%-var(--w)/2)] md:left-[calc(39%-var(--w)/2)] md:[--w:clamp(200px,min(20vw,34svh),340px)]"}`}
    >
      {/* The trail starts behind its back and streams away to the left and a little down, widening as it goes. */}
      <span ref={trail} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-1/2 -z-10 h-[150%] w-[min(85vw,1200px)] origin-right opacity-0 blur-[clamp(16px,2.2vw,36px)]">
        <span className="absolute inset-0" style={TRAIL} />
      </span>
      <span ref={glow} aria-hidden="true" className="pointer-events-none absolute top-[88%] left-[-5%] -z-10 h-[34%] w-[110%] opacity-85 blur-[clamp(6px,0.7vw,12px)]" style={GLOW} />
      {/* Its own little screen: what a press on it shows (and, on phones, what it shows by itself). */}
      <span ref={note} aria-live="polite" className="pointer-events-none absolute top-[108%] left-1/2 block w-[min(76vw,260px)] -translate-x-1/2 overflow-hidden rounded-[10px] border border-white/20 bg-[rgb(10_12_22/0.88)] px-3.5 pt-3 pb-3 text-left opacity-0 shadow-[0_12px_40px_rgb(0_0_0/0.45)] transition-opacity duration-200 md:top-auto md:bottom-[100%]">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#35d4ff,#5a7dff,#b667ff,#ff5fb4,#ff9a3c)]" />
        <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase" />
        <span className="mt-1 block text-[15px] leading-snug font-medium text-white" />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small still that only shows until the 3D model is drawn */}
      <img ref={still} src="/home/character-front.webp" alt="" width={420} height={420} className="absolute inset-0 size-full object-contain transition-opacity duration-300" />
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-0 transition-opacity duration-300" />
    </button>
  );
}
