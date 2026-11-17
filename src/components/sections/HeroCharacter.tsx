"use client";

import { useEffect, useRef } from "react";

/**
 * Our character, drawn live as a real 3D model, flying along the road in the Home picture.
 * It looks down the road toward the sun with its light trail streaming behind; move the
 * pointer and it turns round to look at you, then goes back to the road when you stop.
 * Tap it and it says hello. The 3D code and the model load only after the page has
 * loaded, so the first screen does not wait for them; until then, and on devices that
 * cannot draw 3D, a still picture of the character shows instead.
 */
/** A soft pool of light on the road under it, in our colours. */
const GLOW: React.CSSProperties = {
  background: "radial-gradient(ellipse at 45% 50%, rgb(40 110 255 / 0.65), rgb(150 70 255 / 0.5) 45%, rgb(255 80 170 / 0.3) 62%, transparent 76%)",
};
/** The light trail: it pours from its back toward us while it looks down the road. */
const TRAIL: React.CSSProperties = {
  clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
  background: "linear-gradient(90deg, #2fd4ff 16%, #3f7bff 33%, #9b5cff 50%, #ff4f9b 67%, #ff8a3c 84%)",
  maskImage: "linear-gradient(180deg, #000 0, rgb(0 0 0 / 0.8) 18%, rgb(0 0 0 / 0.4) 50%, transparent 92%)",
};

export function HeroCharacter() {
  const box = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const trail = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!box.current || !canvas.current || !still.current || !trail.current || !glow.current) return;
    const el = box.current, cv = canvas.current, img = still.current, tr = trail.current, gw = glow.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop = false, raf = 0, cleanup: (() => void) | null = null;
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

    // What the visitor does
    let want = [0, 0], lastPointer = -1e9, hello = -10, blink = 0, blinkAt = 2.5, over = 0;
    const touch = window.matchMedia("(hover: none)").matches;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      want = [clamp(dx / (window.innerWidth * 0.5), -1, 1), clamp(dy / (window.innerHeight * 0.5), -1, 1)];
      over = Math.hypot(dx, dy) < r.width * 0.45 ? 1 : 0;
      lastPointer = performance.now();
    };
    const onScroll = () => { lastPointer = -1e9; };
    const greet = () => { hello = performance.now() / 1000; blink = 1; lastPointer = performance.now(); };
    const noFocusRing = (e: PointerEvent) => e.preventDefault();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
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

      // What the glossy body reflects: the sunrise in the picture, a warm sky and the low sun, and the dark road below.
      const W = 256, H = 128, data = new Float32Array(W * H * 4);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const u = x / W, v = y / H, o = (y * W + x) * 4;          // v: 0 is the ground, 1 the top of the sky
        let r: number, g: number, b: number;
        if (v > 0.5) { const k = (v - 0.5) * 2; r = 0.62 - 0.36 * k; g = 0.36 - 0.2 * k; b = 0.3 - 0.06 * k; }
        else { const k = v * 2; r = 0.04 + 0.1 * k; g = 0.04 + 0.07 * k; b = 0.05 + 0.05 * k; }
        const side = 0.55 + 0.45 * Math.cos((u - 0.68) * Math.PI * 2); r *= side; g *= side; b *= side;   // brighter toward the sun, darker behind
        const du = (u - 0.68) * 2, dv = v - 0.56, sun = Math.max(0, 1 - Math.hypot(du, dv) / 0.12);
        r += sun * sun * 9; g += sun * sun * 6.5; b += sun * sun * 3.5;
        const hz = Math.max(0, 1 - Math.abs(v - 0.52) / 0.05) * 0.45 * side; r += hz; g += hz * 0.55; b += hz * 0.25;
        data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 1;
      }
      const env = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
      env.mapping = THREE.EquirectangularReflectionMapping; env.needsUpdate = true;
      const pm = new THREE.PMREMGenerator(gl);
      scene.environment = pm.fromEquirectangular(env).texture; env.dispose(); pm.dispose();
      const key = new THREE.DirectionalLight(0xffd2a8, 0.3); key.position.set(-3, 2, 4); scene.add(key);
      const under = new THREE.PointLight(0xff7a4a, 0.6, 6, 0); under.position.set(0, -2.4, 1.4); scene.add(under);

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
      let hud: InstanceType<typeof THREE.Mesh> | null = null, hudMat: InstanceType<typeof THREE.MeshBasicMaterial> | null = null;
      const file = await new GLTFLoader().loadAsync("/home/character.glb").catch(() => null);
      if (!file || stop) { gl.dispose(); return; }
      file.scene.traverse((o) => {
        const m = o as InstanceType<typeof THREE.Mesh>;
        if (!m.isMesh) return;
        const name = (m.material as InstanceType<typeof THREE.Material>).name;
        if (name === "hud") {
          const src = m.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          hudMat = new THREE.MeshBasicMaterial({ map: src.emissiveMap || src.map, toneMapped: false });
          m.material = hudMat; hud = m;
        } else if (looks[name]) { m.material = looks[name]; if (name === "glass" || name === "stripGlow") m.renderOrder = 2; }
      });
      const pivot = new THREE.Group(); pivot.rotation.order = "YXZ"; pivot.add(file.scene); scene.add(pivot);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.014), new THREE.MeshBasicMaterial({ color: 0x4de9ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
      if (hud) { const bb = new THREE.Box3().setFromObject(hud); line.position.set(0, (bb.min.y + bb.max.y) / 2, bb.max.z + 0.02); }
      line.renderOrder = 1; pivot.add(line);

      let size = 0;
      const fit = () => { const w = Math.round(cv.clientWidth); if (!w || w === size) return; size = w; gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); gl.setSize(w, w, false); };
      window.addEventListener("resize", fit);
      cleanup = () => { window.removeEventListener("resize", fit); gl.dispose(); };

      // The turn is a soft spring. 0 faces the visitor; ROAD is the angle that looks down the road, toward the sun.
      const ROAD = 2.75;
      let yaw = touch || reduce ? 0 : ROAD, yawV = 0, pitch = 0, pitchV = 0, lean = [0, 0], grow = 0, tail = touch || reduce ? 0 : 1, prev = performance.now();
      const frame = (now: number) => {
        if (stop) return;
        const dt = Math.min(0.05, (now - prev) / 1000); prev = now; const t = now / 1000;
        const watching = touch || reduce || now - lastPointer < 2600;          // the visitor is moving the pointer, or just tapped
        const toward = watching ? want : [0, 0];
        lean = [lean[0] + (toward[0] - lean[0]) * (1 - Math.pow(0.004, dt)), lean[1] + (toward[1] - lean[1]) * (1 - Math.pow(0.004, dt))];
        const aimY = watching ? lean[0] * 0.62 : ROAD + Math.sin(t * 0.5) * 0.08, aimX = watching ? lean[1] * 0.42 : 0.04;
        const k = 18, c = 2 * Math.sqrt(k) * 0.9;
        yawV += ((aimY - yaw) * k - yawV * c) * dt; yaw += yawV * dt; pitchV += ((aimX - pitch) * k - pitchV * c) * dt; pitch += pitchV * dt;
        const since = t - hello, twirl = since < 0.9 && !reduce ? (since / 0.9) ** 2 * (3 - 2 * (since / 0.9)) * Math.PI * 2 : 0;
        if (since > 0.95 && since < 1.0) blink = 1;
        const facing = Math.cos(yaw + twirl);
        if (facing > 0.9 && t > blinkAt) { blink = 1; blinkAt = t + 3 + Math.random() * 3.5; }
        blink = Math.max(0, blink - dt / 0.34);                                  // a blink of light, not lids
        const ph = 1 - blink, dim = blink <= 0 ? 0 : ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : Math.max(0, 1 - (ph - 0.5) / 0.12);
        const fl = blink > 0 && ph > 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
        grow += ((over && watching ? 1 : 0) - grow) * 0.12;
        const bob = reduce ? 0 : Math.sin(t * 1.7) * 6, hop = since < 0.6 ? -Math.sin((since / 0.6) * Math.PI) * 16 : 0;
        el.style.transform = `translate(${(lean[0] * 14).toFixed(1)}px,${(bob + hop + lean[1] * 8).toFixed(1)}px) scale(${(1 + grow * 0.06).toFixed(3)})`;
        tail += ((watching ? 0 : 1) - tail) * (1 - Math.pow(watching ? 0.05 : 0.2, dt));
        const back = clamp((-facing - 0.2) / 0.6, 0, 1) * tail;                // the light trail shows while its back is turned to us
        tr.style.opacity = back.toFixed(3);
        tr.style.transform = `translateX(-50%) rotate(${(Math.sin(yaw + twirl) * 34).toFixed(1)}deg) scaleY(${(0.7 + 0.3 * back).toFixed(3)})`;
        gw.style.opacity = (0.75 + 0.1 * Math.sin(t * 1.3) + grow * 0.15).toFixed(3);
        fit();
        pivot.rotation.y = yaw + twirl; pivot.rotation.x = pitch; pivot.rotation.z = -lean[0] * 0.07;
        if (hud && hudMat) { (hud as InstanceType<typeof THREE.Mesh>).position.x = lean[0] * 0.05; (hud as InstanceType<typeof THREE.Mesh>).position.y = -lean[1] * 0.04; (hudMat as InstanceType<typeof THREE.MeshBasicMaterial>).color.setScalar(1.5 * (1 - dim * 0.94) + fl * 1.2); }
        (line.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = dim;
        gl.render(scene, cam);
        if (!reduce) raf = requestAnimationFrame(frame);
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
      window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", noFocusRing); el.removeEventListener("click", greet);
    };
  }, []);

  return (
    <button
      ref={box}
      type="button"
      aria-label="Our character. Press to say hello."
      className="absolute top-[50%] left-[8%] block aspect-square w-[clamp(180px,56vw,300px)] cursor-pointer rounded-full outline-offset-4 will-change-transform [-webkit-tap-highlight-color:transparent] md:top-[46%] md:left-[17%] md:w-[clamp(220px,24vw,460px)]"
    >
      <span ref={glow} aria-hidden="true" className="pointer-events-none absolute inset-x-[8%] -bottom-[14%] h-[16%] rounded-[50%] mix-blend-screen blur-[18px]" style={GLOW} />
      <span ref={trail} aria-hidden="true" className="pointer-events-none absolute top-[62%] left-1/2 -z-10 h-[190%] w-[210%] origin-top opacity-0 blur-[clamp(6px,0.9vw,14px)]">
        <i className="absolute inset-0" style={TRAIL} />
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small still that only shows until the 3D model is drawn */}
      <img ref={still} src="/home/character-front.webp" alt="" width={420} height={420} className="absolute inset-0 size-full object-contain transition-opacity duration-300" />
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-0 transition-opacity duration-300" />
    </button>
  );
}
