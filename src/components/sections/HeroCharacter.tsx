"use client";

import { useEffect, useRef } from "react";

/** The light trail: a beam of our colours pouring from its back while it flies fast. */
const TRAIL: React.CSSProperties = {
  background:
    "linear-gradient(180deg, transparent 0%, #2fd4ff 14%, #3f7bff 30%, #9b5cff 48%, #ff4f9b 66%, #ff8a3c 82%, transparent 100%)",
  maskImage: "linear-gradient(90deg, #000 0%, rgb(0 0 0 / 0.75) 30%, rgb(0 0 0 / 0.3) 65%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(90deg, #000 0%, rgb(0 0 0 / 0.75) 30%, rgb(0 0 0 / 0.3) 65%, transparent 100%)",
  clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)",
};

/**
 * Our character, drawn live as a real 3D model, in the Home picture. It faces the visitor and its eye
 * follows the pointer straight away; a click makes it hop and spin. As the visitor scrolls through the
 * hero it flies off down the road toward the sun, and only while it moves fast does a light trail pour
 * from its back. The 3D code and the model load after the page has loaded, so the first screen never
 * waits for them; until then, and where 3D cannot be drawn, a still picture shows instead.
 */
export function HeroCharacter() {
  const box = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const trail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!box.current || !canvas.current || !still.current || !trail.current) return;
    const el = box.current, cv = canvas.current, img = still.current, tr = trail.current;
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

    // The pointer
    let want = [0, 0], hello = -10, blink = 0, blinkAt = 2, over = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      want = [clamp(dx / (window.innerWidth * 0.4), -1, 1), clamp(dy / (window.innerHeight * 0.4), -1, 1)];
      over = Math.hypot(dx, dy) < r.width * 0.5 ? 1 : 0;
    };
    const onLeave = () => { want = [0, 0]; over = 0; };
    const greet = () => { hello = performance.now() / 1000; blink = 1; };
    const noFocusRing = (e: PointerEvent) => e.preventDefault();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    el.addEventListener("pointerdown", noFocusRing);
    el.addEventListener("click", greet);

    async function start() {
      if (stop) return;
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
      const LEFT = -1.2;                                                     // turned to fly left, down the road toward the sun
      let yaw = 0, yawV = 0, pitch = 0, pitchV = 0, lean = [0, 0], grow = 0, flyX = 0, prev = performance.now();
      const frame = (now: number) => {
        if (stop) return;
        const dt = Math.min(0.05, (now - prev) / 1000); prev = now; const t = now / 1000;
        speed *= Math.pow(0.02, dt);
        const v = reduce ? 0 : clamp(speed / 90, 0, 1);                     // how fast it is flying, from the scroll
        const away = reduce ? 0 : clamp(progress * 1.6, 0, 1);               // how far it has turned to fly off
        const follow = 1 - Math.pow(1e-7, dt);
        lean = [lean[0] + (want[0] - lean[0]) * follow, lean[1] + (want[1] - lean[1]) * follow];
        const aimY = (1 - away) * lean[0] * 0.8 + away * LEFT, aimX = (1 - away) * lean[1] * 0.5 + away * 0.05;
        const k = 140, c = 2 * Math.sqrt(k) * 0.95;
        yawV += ((aimY - yaw) * k - yawV * c) * dt; yaw += yawV * dt; pitchV += ((aimX - pitch) * k - pitchV * c) * dt; pitch += pitchV * dt;
        const since = t - hello, s = clamp(since / 0.55, 0, 1), twirl = since < 0.55 && !reduce ? s * s * (3 - 2 * s) * Math.PI * 2 : 0;
        if (since > 0.6 && since < 0.65) blink = 1;
        if (Math.cos(yaw + twirl) > 0.9 && t > blinkAt && away < 0.1) { blink = 1; blinkAt = t + 3 + Math.random() * 3.5; }
        blink = Math.max(0, blink - dt / 0.3);                                  // a blink of light, not lids
        const ph = 1 - blink, dim = blink <= 0 ? 0 : ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : Math.max(0, 1 - (ph - 0.5) / 0.12);
        const fl = blink > 0 && ph > 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
        grow += ((over && away < 0.1 ? 1 : 0) - grow) * (1 - Math.pow(0.0001, dt));
        // It flies off down the road: left and up toward the sun, smaller as it goes.
        flyX += (progress - flyX) * (1 - Math.pow(0.0005, dt));
        const fx = -flyX * window.innerWidth * 0.34, fy = -flyX * window.innerHeight * 0.16, fs = 1 - flyX * 0.45;
        const bob = reduce ? 0 : Math.sin(t * 1.7) * 5, hop = since < 0.45 ? -Math.sin((since / 0.45) * Math.PI) * 18 : 0;
        el.style.transform = `translate(${(fx + lean[0] * 10 * (1 - away)).toFixed(1)}px,${(fy + bob + hop + lean[1] * 6 * (1 - away)).toFixed(1)}px) scale(${((1 + grow * 0.06) * fs).toFixed(3)})`;
        // The trail shows only while it flies fast, longer the faster it goes.
        tr.style.opacity = (clamp((v - 0.08) / 0.4, 0, 1) * clamp(away * 3, 0, 1)).toFixed(3);
        tr.style.transform = `translateY(-50%) rotate(9deg) scaleX(${(0.45 + v * 0.75).toFixed(3)}) scaleY(${(0.8 + v * 0.4).toFixed(3)})`;
        fit();
        pivot.rotation.y = yaw + twirl; pivot.rotation.x = pitch; pivot.rotation.z = -lean[0] * 0.08 * (1 - away) + away * 0.12;
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
    };
  }, []);

  return (
    <button
      ref={box}
      type="button"
      aria-label="Our character. Press to say hello."
      className="absolute top-[64%] left-[58%] block aspect-square w-[clamp(120px,32vw,170px)] cursor-pointer rounded-full outline-offset-4 will-change-transform [-webkit-tap-highlight-color:transparent] md:top-[70%] md:left-[73%] md:w-[clamp(140px,12vw,230px)]"
    >
      {/* The trail starts at its back (the right, while it flies left) and streams back toward the visitor. */}
      <span ref={trail} aria-hidden="true" className="pointer-events-none absolute top-[58%] left-[44%] -z-10 h-[120%] w-[min(70vw,1100px)] origin-left opacity-0 blur-[clamp(8px,1vw,16px)]" style={TRAIL} />
      {/* eslint-disable-next-line @next/next/no-img-element -- a small still that only shows until the 3D model is drawn */}
      <img ref={still} src="/home/character-front.webp" alt="" width={420} height={420} className="absolute inset-0 size-full object-contain transition-opacity duration-300" />
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-0 transition-opacity duration-300" />
    </button>
  );
}
