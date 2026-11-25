// Our character (version 3), drawn live with three.js. The Home hero (components/sections/HeroCharacter.tsx), the intro's
// pictures and the showreel's 3D shots (design/showreel/build) all draw it with this, so it looks and moves the same
// everywhere. Its model is public/home/character.glb and its faces public/home/faces.webp, both made from the Blender
// model by design/hero/character/v3/webexport.py (the showreel loads a fuller model with more hand shapes).
//
// The model: the body with its visor, ears, top stripe, lit seam and the rainbow ring (which spins about its own axis),
// and one glove (fingers along +y, palm toward +z, thumb on +x) drawn twice, once mirrored, for the two hands. The glove
// carries its poses as blend shapes: the open hand at rest, and `gun`, `point` and `wave` (the showreel's model also
// `thumbsup`, `fist` and `hold`).
//
// A character's state, set each frame with `pose()`:
//   yaw, pitch, roll   how it is turned (radians; yaw > 0 turns its face to the right of the screen, pitch > 0 down)
//   look: [x, y]       where its face looks on the visor (-1..1)
//   from, to, t        the expression it is going from and to, and how far (0..1); see EXPRESSIONS
//   blink              0..1: its open eyes shut for a moment
//   ring               the ring's spin (radians)
//   sign               0..1: how far the sign of the expression it is going to (sparks, ?, !!) has popped in; the sign
//                      of the one it is leaving goes by itself in the first half of the change
//   hands: { R, L }    hand poses that take over from the expression's, each or both: a pose (HAND, hand()), a name,
//                      or [from, to, k] for a hand on its way from one pose to another (see travel())
//   handsMix           0..1: how far they have taken over (default 1)
//   time               seconds, for the hands' gentle float (they never hang quite still)
//   drift: [x, y]      which way it is moving on screen, about -1..1 each: its hands trail behind
// Whatever the pose, a hand never goes into the ring, the body, the visor or an ear: it is pushed clear (keepClear).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/** The faces in public/home/faces.webp, three to a row. */
export const FACES = ["happy", "neutral", "blink", "wink", "thinking", "surprised"];

/**
 * Hand poses, given for its right hand (on the left of the screen) in the character's own space: x to the right of the
 * screen, y up, z toward the viewer, its body a ball of radius 1. `at` is the middle of the wrist, `fingers` and `palm`
 * the ways they point, `size` its scale, `shape` the glove's blend shapes. Its left hand takes the mirror image
 * (mirror()). The ring runs round the body just under the visor, lower on its right side than its left, and the ears
 * stand out at the sides of the head, so a hand at its side rests below the ring and comes up in front of the ears.
 */
export const HAND = {
  /** At rest: open at its side below the ring, palm up and turned to us, fingers out. */
  rest: { at: [-1.18, -0.71, 0.36], fingers: [-0.85, 0.32, 0.42], palm: [0.22, 0.6, 0.77], size: 1.14 },
  /** Hello: up beside its head, palm to us (wave() waves it). */
  hi: { at: [-1.2, 0.64, 0.52], fingers: [-0.32, 0.95, 0.05], palm: [0.08, 0, 1], size: 1.12, shape: { wave: 1 } },
  /** Hooray: up high, open. */
  cheer: { at: [-0.98, 0.98, 0.44], fingers: [-0.3, 0.95, 0.05], palm: [0.05, 0.05, 1], size: 1.1, shape: { wave: 1 } },
  /** A fist punched up. */
  pump: { at: [-1.02, 0.88, 0.44], fingers: [-0.12, 0.99, 0.05], palm: [0.25, 0, 0.97], size: 1.12, shape: { fist: 1 } },
  /** Pointing out to its side (pointTo() points it anywhere). */
  point: { at: [-1.1, -0.04, 0.86], fingers: [-0.9, 0.1, 0.42], palm: [0, -1, 0.1], size: 1.14, shape: { point: 1 } },
  /** A finger gun, low and out to its side, thumb up. */
  gun: { at: [-1.02, -0.68, 1.02], fingers: [-0.88, 0.12, 0.45], palm: [0, 0.1, 1], size: 1.24, shape: { gun: 1 } },
  /** Thumbs up, in front. */
  thumbsup: { at: [-0.96, -0.56, 1.06], fingers: [0.5, 0, 0.86], palm: [0.86, 0, -0.5], size: 1.24, shape: { thumbsup: 1 } },
  /** Thinking: its first finger up on its chin, the back of the hand to us, the wrist coming up from below. */
  chin: { at: [-0.36, -0.3, 1.33], fingers: [0.2, 0.68, -0.7], palm: [0, 0.18, -1], size: 1.2, shape: { point: 1 } },
  /** On its cheek, the back of the hand to us (both: "oh!"). */
  cheek: { at: [-0.78, 0.06, 1.0], fingers: [0.28, 0.95, -0.15], palm: [0.4, -0.05, -0.92], size: 1.14, shape: { wave: 1 } },
  /** Ta-da: palm up, held out to the side and in front. */
  present: { at: [-1.12, -0.36, 1.02], fingers: [-0.8, 0.15, 0.58], palm: [0.1, 0.95, 0.2], size: 1.18 },
  /** Shading its eyes to look far off. */
  shade: { at: [-0.58, 0.64, 1.06], fingers: [0.95, 0.1, 0.22], palm: [0, -1, 0.2], size: 1.12, shape: { wave: 1 } },
  /** Ready to clap: in front, palm facing the other hand (clap() claps). */
  clap: { at: [-0.22, -0.2, 1.36], fingers: [0.1, 0.99, 0.12], palm: [1, 0, 0.02], size: 1.12, shape: { wave: 1 } },
  /** Out wide for balance, below the ring. */
  balance: { at: [-1.2, -0.78, 0.25], fingers: [-0.9, 0.38, 0.2], palm: [0.05, -1, 0.05], size: 1.1, shape: { wave: 1 } },
  /** A fist out in front, as it flies (turned to face where it goes). */
  fist: { at: [-0.36, 0.14, 1.42], fingers: [0.05, 0.1, 1], palm: [1, 0, 0], size: 1.15, shape: { fist: 1 } },
  /** Trailing behind it as it flies. */
  trail: { at: [-0.85, -0.56, -0.86], fingers: [-0.3, -0.25, -0.92], palm: [0, -1, 0.2], size: 1.1, shape: { wave: 1 } },
};

/** The same pose for the other hand. */
export const mirror = (h) => ({ ...h, at: [-h.at[0], h.at[1], h.at[2]], fingers: [-h.fingers[0], h.fingers[1], h.fingers[2]], palm: [-h.palm[0], h.palm[1], h.palm[2]] });
const lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Partway from one hand pose to another (k may run a little past 1 for an overshoot). */
export function mixHand(a, b, k) {
  const shape = {};
  for (const n of new Set([...Object.keys(a.shape ?? {}), ...Object.keys(b.shape ?? {})])) shape[n] = clamp01((a.shape?.[n] ?? 0) + ((b.shape?.[n] ?? 0) - (a.shape?.[n] ?? 0)) * k);
  return { at: lerp3(a.at, b.at, k), fingers: lerp3(a.fingers, b.fingers, k), palm: lerp3(a.palm, b.palm, k), size: a.size + (b.size - a.size) * k, shape };
}
/** Turns a hand's fingers about its palm (radians): a wave, a wag. */
function twist(h, a) {
  const f = new THREE.Vector3(...h.fingers).applyAxisAngle(new THREE.Vector3(...h.palm).normalize(), a);
  return { ...h, fingers: f.toArray() };
}
const add3 = (h, d) => ({ ...h, at: [h.at[0] + d[0], h.at[1] + d[1], h.at[2] + d[2]] });
const TAU = Math.PI * 2;
/** Hand moves that play over time t (seconds), for its right hand; hand() mirrors them for the left. */
const MOVES = {
  /** Waving hello. */
  wave: (t) => add3(twist(HAND.hi, 0.42 * Math.sin(TAU * 2.4 * t)), [0.05 * Math.sin(TAU * 2.4 * t + 0.6), 0, 0]),
  /** Clapping: the hands meet in the middle three times a second. */
  clap: (t) => { const k = Math.pow(0.5 - 0.5 * Math.cos(TAU * 3 * t), 0.6); return add3(twist(HAND.clap, -0.15 * k), [0.3 * (1 - k) - 0.16, 0, 0]); },
  /** A fist pumped up and down. */
  pump: (t) => add3(HAND.pump, [0, 0.14 * Math.pow(Math.abs(Math.sin(TAU * 1.6 * t)), 0.7) - 0.07, 0]),
};
/**
 * A hand pose by name, for its right hand ("R") or left ("L"): one of HAND, or a move in MOVES played at time t. A
 * pose object passes through (mirrored for "L" only if asked with mirrored = true).
 */
export function hand(name, side = "R", t = 0) {
  const h = typeof name === "string" ? (MOVES[name] ? MOVES[name](t, side) : HAND[name] ?? HAND.rest) : name;
  return side === "L" && typeof name === "string" ? mirror(h) : h;
}
/** Points a hand's first finger along a direction in the character's own space (for side R or L), from near its side. */
export function pointTo(dir, side = "R") {
  const d = new THREE.Vector3(...dir).normalize(), s = side === "L" ? 1 : -1;
  const at = [s * 0.95 + d.x * 0.25, 0.02 + d.y * 0.3, 0.8 + d.z * 0.2];
  const palm = new THREE.Vector3(0, -1, 0).addScaledVector(d, d.y).normalize();
  return { at, fingers: d.toArray(), palm: palm.toArray(), size: 1.14, shape: { point: 1 } };
}

const REST = { R: HAND.rest, L: mirror(HAND.rest) };
export const EXPRESSIONS = {
  /** At rest: smiling, eyes shut in a happy curve, hands open at its sides. */
  happy: { face: "happy", hands: REST },
  /** Looking about: eyes open. */
  neutral: { face: "neutral", hands: REST },
  /** A wink and a finger gun, with a little burst of sparks. */
  wink: { face: "wink", sign: "spark", hands: { R: HAND.rest, L: mirror(HAND.gun) } },
  /** Hmm: a finger on its chin, a question mark. */
  thinking: { face: "thinking", sign: "question", hands: { R: HAND.rest, L: mirror(HAND.chin) } },
  /** Oh!: both hands on its cheeks. */
  surprised: { face: "surprised", sign: "bang", hands: { R: HAND.cheek, L: mirror(HAND.cheek) } },
};

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

/** The studio it is lit in, as on the Home hero: soft white with two bright windows, a warm glow, and our colours from below. */
function studio(gl, scene) {
  const W = 512, H = 256, data = new Float32Array(W * H * 4);
  const wins = [[0.835, 0.885, 0.6, 0.8], [0.895, 0.93, 0.6, 0.8], [0.595, 0.64, 0.6, 0.77], [0.652, 0.682, 0.6, 0.77]];
  const blob = (u, v, cu, cv, r) => { const a = (u - cu) * 2, b = v - cv, q = 1 - Math.sqrt(a * a + b * b) / r; return q > 0 ? q * q : 0; };
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
  const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromEquirectangular(env).texture; env.dispose(); pm.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 0.55); key.position.set(-3, 4, 4); scene.add(key);
  const blue = new THREE.PointLight(0x3f7bff, 0.9, 7, 0); blue.position.set(-1.4, -2.4, 1.8); scene.add(blue);
  const pink = new THREE.PointLight(0xff4fa0, 0.8, 7, 0); pink.position.set(1.5, -2.4, 1.8); scene.add(pink);
}

/**
 * A canvas to draw the character in: renderer, scene and camera. `distance` sets how much of the space shows (the
 * character with its hands at rest fills about 0.8 of the square at the default).
 */
export function createStage(canvas, { distance = 9.6, fov = 20, keep = false } = {}) {
  THREE.ColorManagement.enabled = false;
  const gl = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: keep });
  gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(fov, 1, 1, 60); cam.position.set(0, 0, distance);
  studio(gl, scene);
  return { gl, scene, cam, render: () => gl.render(scene, cam) };
}

/** A glossy material whose vertex colours also glow (the ring, the ear lights): lit like the body, bright like a light. */
function glowing(params, k) {
  const m = new THREE.MeshPhysicalMaterial({ ...params, vertexColors: true });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += vColor.rgb * ${k.toFixed(3)};`);
  };
  return m;
}

/** The little signs that pop up beside it: a burst of sparks, a question mark, two exclamation marks. */
function signTexture(kind) {
  const S = 256, c = document.createElement("canvas"); c.width = c.height = S; const x = c.getContext("2d");
  x.lineCap = "round"; x.lineJoin = "round";
  if (kind === "spark") {                                          // three short strokes fanning out, orange
    x.strokeStyle = "#ff9a2e"; x.lineWidth = 22;
    for (const a of [-8, -45, -82]) {
      const r = (a * Math.PI) / 180, cx = 56, cy = 200, r0 = 70, r1 = a === -45 ? 165 : 150;
      x.beginPath(); x.moveTo(cx + Math.cos(r) * r0, cy + Math.sin(r) * r0); x.lineTo(cx + Math.cos(r) * r1, cy + Math.sin(r) * r1); x.stroke();
    }
  } else if (kind === "question") {                                // a fat round question mark, purple
    const g = x.createLinearGradient(0, 30, 0, 230); g.addColorStop(0, "#b44dff"); g.addColorStop(1, "#7a2bf0");
    x.strokeStyle = g; x.fillStyle = g; x.lineWidth = 34;
    x.beginPath(); x.arc(128, 86, 50, Math.PI * 1.1, Math.PI * 2.25); x.quadraticCurveTo(128, 130, 128, 158); x.stroke();
    x.beginPath(); x.arc(128, 212, 21, 0, Math.PI * 2); x.fill();
  } else {                                                         // two slanted exclamation marks, pink
    const g = x.createLinearGradient(0, 20, 0, 240); g.addColorStop(0, "#ff4fa8"); g.addColorStop(1, "#e8197a");
    x.fillStyle = g; x.strokeStyle = g;
    for (const dx of [-46, 46]) {
      x.save(); x.translate(128 + dx, 128); x.rotate(0.26);
      x.lineWidth = 34; x.beginPath(); x.moveTo(0, -92); x.lineTo(0, 30); x.stroke();
      x.beginPath(); x.arc(0, 86, 20, 0, Math.PI * 2); x.fill(); x.restore();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const SIGN_AT = { spark: [1.18, 0.98, 0.5], question: [1.08, 1.28, 0.3], bang: [1.12, 1.18, 0.3] };

/**
 * What a hand keeps clear of, in the character's own space: the ring (fitted from the model in the constructor), the
 * body, the visor's bulge and the two ears. Each is a distance: how far a point is outside it (less than 0 inside), and
 * the way out.
 */
const GAP = { ring: 0.035, body: 0.02 };
const EAR = { x: 0.93, y: 0.125, z: 0.19, r: 0.37, half: 0.12 };       // an ear: a disc on the side of the head
function sphereOut(p, cx, cy, cz, r, out) {
  const dx = p.x - cx, dy = p.y - cy, dz = p.z - cz, l = Math.hypot(dx, dy, dz) || 1e-6;
  out.set(dx / l, dy / l, dz / l); return l - r;
}
function earOut(p, s, out) {
  const ax = s * (p.x - s * EAR.x), dy = p.y - EAR.y, dz = p.z - EAR.z, rho = Math.hypot(dy, dz) || 1e-6;
  const a = Math.abs(p.x - s * EAR.x) - EAR.half, b = rho - EAR.r;
  if (a > 0 && b > 0) { const l = Math.hypot(a, b); out.set((Math.sign(ax) * s * a) / l, (dy / rho) * (b / l), (dz / rho) * (b / l)); return l; }
  if (a > b) { out.set(Math.sign(ax || 1) * s, 0, 0); return a; }
  out.set(0, dy / rho, dz / rho); return b;
}

export class Character {
  /** @param {THREE.Object3D} model the loaded glTF scene  @param {HTMLImageElement | ImageBitmap} sheet the faces */
  constructor(model, sheet) {
    this.group = new THREE.Group();                                // add this to a stage's scene
    this.pivot = new THREE.Group(); this.pivot.rotation.order = "YXZ"; this.group.add(this.pivot);
    const body = model.getObjectByName("Character"), glove = model.getObjectByName("Hand");
    this.pivot.add(body);

    // Materials, by the names they have in Blender.
    const body_ = { color: 0xf1f2f7, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 };
    this.visorMat = new THREE.MeshPhysicalMaterial({ color: 0x020205, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06, emissive: 0xffffff, emissiveIntensity: 1.5 });
    const looks = {
      body: new THREE.MeshPhysicalMaterial(body_),
      base: new THREE.MeshPhysicalMaterial({ color: 0xd4d8ec, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }),
      socket: new THREE.MeshStandardMaterial({ color: 0x06080d, roughness: 0.4 }),
      visor: this.visorMat,
      rim: new THREE.MeshPhysicalMaterial({ color: 0xb7b0de, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
      earBlack: new THREE.MeshPhysicalMaterial({ color: 0x030306, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 }),
      earWhite: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      earLine: new THREE.MeshBasicMaterial({ color: 0xaeb2c4 }),
      earDome: glowing({ color: 0x0a0c18, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 }, 0.9),
      earRing: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      headStripe: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      lowSeam: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
      lowSeamGlow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }),
      ring: glowing({ roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }, 0.75),
      glove: new THREE.MeshPhysicalMaterial({ color: 0xf5f3fc, roughness: 0.55, sheen: 0.35, sheenColor: 0xd8ccff, sheenRoughness: 0.6 }),
      cuffBand: new THREE.MeshPhysicalMaterial({ color: 0x07080c, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.1 }),
      cuffLight: new THREE.MeshBasicMaterial({ color: 0x3ee6ff, toneMapped: false }),
    };
    const dress = (o) => o.traverse((m) => {
      if (!m.isMesh) return;
      const n = m.material.name;
      if (looks[n]) m.material = looks[n];
      if (n === "lowSeamGlow") m.renderOrder = 2;
    });
    dress(body); dress(glove);
    this.bottomCut(body);

    // The faces: one picture, cut into one texture per face; the visor maps a face across its width.
    this.faces = {};
    const fw = sheet.width / 3, fh = sheet.height / 2;
    FACES.forEach((f, i) => {
      const c = document.createElement("canvas"); c.width = fw; c.height = fh;
      c.getContext("2d").drawImage(sheet, (i % 3) * fw, Math.floor(i / 3) * fh, fw, fh, 0, 0, fw, fh);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; this.faces[f] = t;
    });
    this.visorMat.emissiveMap = this.faces.happy;

    // The ring spins about its own axis, so the space it takes never changes: a tube round a circle (the torus a hand
    // keeps clear of), measured from the model.
    this.ring = body.getObjectByName("Ring"); this.ring0 = this.ring.quaternion.clone();
    this.group.updateMatrixWorld(true);
    {
      const pts = [];
      this.ring.traverse((m) => {
        if (!m.isMesh) return; const a = m.geometry.attributes.position, step = Math.max(1, Math.floor(a.count / 600));
        for (let i = 0; i < a.count; i += step) pts.push(new THREE.Vector3().fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld));
      });
      const c = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
      const n = new THREE.Vector3(0, 1, 0).applyQuaternion(this.ring.getWorldQuaternion(new THREE.Quaternion())).normalize();
      let R = 0; for (const p of pts) { const q = p.clone().sub(c); R += q.addScaledVector(n, -q.dot(n)).length(); } R /= pts.length;
      let r = 0; for (const p of pts) { const q = p.clone().sub(c), h = q.dot(n); r = Math.max(r, Math.hypot(q.addScaledVector(n, -h).length() - R, h)); }
      this.torus = { c, n, R, r };
    }

    // The hands: the glove as it is (its right hand) and a mirrored copy (its left). Its blend shapes by name.
    glove.removeFromParent(); glove.position.set(0, 0, 0); glove.quaternion.identity(); glove.scale.set(1, 1, 1); glove.updateMatrixWorld(true);
    this.hands = { R: glove, L: glove.clone(true) };
    for (const h of Object.values(this.hands)) {
      h.traverse((m) => { if (m.isMesh && m.morphTargetInfluences) h.userData.glove = m; });
      this.pivot.add(h);
    }
    const dict = this.hands.R.userData.glove?.morphTargetDictionary ?? {};
    this.shapes = Object.keys(dict).sort((a, b) => dict[a] - dict[b]);
    // Points spread evenly over the glove and its cuff (one in each small cube of the hand's own space, with how it
    // moves in each blend shape): what is checked against the ring and the body.
    this.samples = [];
    {
      const inv = new THREE.Matrix4().copy(glove.matrixWorld).invert(), seen = new Set(), CELL = 0.03;
      glove.traverse((m) => {
        if (!m.isMesh) return;
        const rel = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld), lin = new THREE.Matrix3().setFromMatrix4(rel);
        const a = m.geometry.attributes.position, morph = m.geometry.morphAttributes.position;
        for (let i = 0; i < a.count; i++) {
          const p = new THREE.Vector3().fromBufferAttribute(a, i).applyMatrix4(rel);
          const key = `${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)},${Math.floor(p.z / CELL)}`;
          if (seen.has(key)) continue; seen.add(key);
          this.samples.push({ p, d: morph ? morph.map((ma) => new THREE.Vector3().fromBufferAttribute(ma, i).applyMatrix3(lin)) : null });
        }
      });
    }
    this._p = new THREE.Vector3(); this._n = new THREE.Vector3(); this._best = new THREE.Vector3(); this._q = new THREE.Quaternion();

    // The signs: they stay beside it whichever way it turns.
    this.signs = {};
    for (const k of Object.keys(SIGN_AT)) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture(k), transparent: true, depthWrite: false, toneMapped: false }));
      s.position.copy(v3(SIGN_AT[k])); s.scale.setScalar(0); s.renderOrder = 3; this.group.add(s); this.signs[k] = s;
    }
    this.pose({});
  }

  /**
   * The bottom panel and the cut round it (Lucky, 25 Nov, from reference pictures: "it has a cutting ... this bottom
   * rack will open ... inside that cutting that light gradient light comes in"). The cut follows the reference sheet:
   * level and even from the front ("from the front view, it should look the straight cutting") and an S from the side,
   * low under the face and high across the back. The panel is part of the same ball as the shell, so the outline stays a perfect circle with only the cut
   * between them; both edges of the cut are rounded, with walls down into it; and the light is inside the cut, on the
   * panel's edge, spilling onto the panel and the walls, dark across the back. The model's own bottom (its panel,
   * groove, drawn line and the shell round them) is replaced here, and the shell is shaded as the true ball it is.
   */
  bottomCut(body) {
    const V3 = THREE.Vector3, rad = Math.PI / 180;
    body.updateMatrixWorld(true);
    const chin = body.getObjectByName("SeamChin"), seamMat = chin?.material;
    for (const n of ["Sphere_1", "Sphere_2", "LowSeam", "LowSeamGlow", "SeamChin"]) body.getObjectByName(n)?.removeFromParent();
    // The cut, as on the reference sheet (Lucky's markup, 25 Nov: "you can see that curve shape. Follow this"): round the
    // ball at RHO(f) from its lowest point, f being the way round from the front. A gentle, even curve under the face
    // (Lucky: "a slight curve in front view, but it's a symmetric curve"), then a smooth S up each side to high across
    // the back, so it is an even smile from the front and an S from the side.
    const smooth = (t) => { const k = Math.min(1, Math.max(0, t)); return k * k * k * (k * (6 * k - 15) + 10); };
    const FRONT = 33 * rad, BACK = 70 * rad;
    const RHO = (f) => { const a = Math.abs(Math.atan2(Math.sin(f), Math.cos(f))); return FRONT + 12 * rad * (1 - Math.cos(a)) / 2 + (BACK - FRONT - 12 * rad) * smooth((a - 55 * rad) / (95 * rad)); };
    const AX = new V3(0, -1, 0), U = new V3(0, 0, 1), V = AX.clone().cross(U);
    // The same gap all the way round (Lucky: "all the side cutting gaps should be the same"): widths are measured across
    // the cut, so where it climbs steeply they are spread a little further along RHO (K) to stay the same across it.
    const K = (f) => { const e = 1e-3, d = (RHO(f + e) - RHO(f - e)) / (2 * e); return Math.hypot(1, d / Math.sin(RHO(f))); };
    const dir = (th, f) => new V3().copy(U).multiplyScalar(Math.cos(f)).addScaledVector(V, Math.sin(f)).multiplyScalar(Math.sin(th)).addScaledVector(AX, Math.cos(th));
    const tang = (th, f) => new V3().copy(U).multiplyScalar(Math.cos(f)).addScaledVector(V, Math.sin(f)).multiplyScalar(Math.cos(th)).addScaledVector(AX, -Math.sin(th));
    const polar = (q) => { const d = q.clone().normalize(); return [Math.acos(Math.max(-1, Math.min(1, d.dot(AX)))), Math.atan2(d.dot(V), d.dot(U))]; };
    const RP = 1, BP = 0.022, BS = 0.009, FLOOR = 0.9, OUT = 80 * rad, N = 240;
    const edgeOf = (f) => RHO(f) - 0.033 * K(f);                         // the panel's edge
    const wallOf = (f) => RHO(f) + 0.006 * K(f);                         // the shell's wall
    // The shell: shaded as a ball (its points are packed small numbers: normals are rewritten, points never), and
    // open round the bottom, where the new shell edge and the panel go.
    const toPivot = new THREE.Matrix4(), toLocal = new THREE.Matrix3(), p = new V3(), nn = new V3();
    const inv = new THREE.Matrix4().copy(this.pivot.matrixWorld).invert();
    const shell = body.getObjectByName("Sphere");
    if (shell?.isMesh) {
      toPivot.multiplyMatrices(inv, shell.matrixWorld); toLocal.setFromMatrix4(toPivot).transpose();
      const g = shell.geometry, pos = g.attributes.position, nor = g.attributes.normal, at = [];
      for (let i = 0; i < pos.count; i++) {
        at.push(p.fromBufferAttribute(pos, i).applyMatrix4(toPivot).clone());
        if (Math.abs(p.length() - 1) > 0.02) continue;                   // only points on the ball itself
        nn.copy(p).applyMatrix3(toLocal).normalize(); nor.setXYZ(i, nn.x, nn.y, nn.z);
      }
      nor.needsUpdate = true;
      const idx = g.index ? g.index.array : Array.from({ length: pos.count }, (_, i) => i), keep = [];
      for (let i = 0; i < idx.length; i += 3) {
        const [th, f] = polar(at[idx[i]].clone().add(at[idx[i + 1]]).add(at[idx[i + 2]]));
        if (th > wallOf(f) + BS * K(f) + 0.03) keep.push(idx[i], idx[i + 1], idx[i + 2]);
      }
      g.setIndex(keep);
    }
    // The light's colours round the cut, as the model's line had them: red at the lowest point, then magenta, purple,
    // blue and cyan up each side, dark across the back.
    const STOPS = [[0, [1, 0.34, 0.12]], [0.04, [1, 0.2, 0.22]], [0.1, [1, 0.24, 0.72]], [0.18, [0.62, 0.3, 1]], [0.27, [0.2, 0.5, 1]], [0.36, [0.1, 0.8, 1]],
      [0.4, [0.02, 0.03, 0.05]], [0.6, [0.02, 0.03, 0.05]], [0.64, [0.1, 0.85, 1]], [0.72, [0.2, 0.5, 1]], [0.8, [0.62, 0.3, 1]], [0.87, [1, 0.24, 0.72]],
      [0.93, [1, 0.22, 0.2]], [0.975, [1, 0.5, 0.12]], [1, [1, 0.34, 0.12]]];
    const light = (f) => {
      const t = (f / (2 * Math.PI) + 0.04) % 1; let i = 1; while (STOPS[i][0] < t) i++;
      const [t0, a] = STOPS[i - 1], [t1, c] = STOPS[i], k = (t - t0) / (t1 - t0);
      return a.map((x, j) => Math.pow(x + (c[j] - x) * k, 2.2));
    };
    const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k], NONE = [0, 0, 0];
    const sc = shell?.material?.color, WHITE = sc ? [sc.r, sc.g, sc.b] : [0.945, 0.949, 0.969], DARK = [0.02, 0.024, 0.034];   // the shell's own white, as it was made
    // One surface round the cut: rows(f) gives its profile at f, the same number of points all the way round, each
    // { th, r, a (the normal's tilt: 0 out, +90 toward the shell, -90 toward the panel), c (colour), g (light) }.
    const toBody = new THREE.Matrix4().copy(body.matrixWorld).invert().multiply(this.pivot.matrixWorld);
    const band = (rows, material) => {
      const pos = [], nor = [], col = [], glo = [], idx = []; let m = 0;
      const at = (q, f) => dir(q.th, f).multiplyScalar(q.r), E = 1e-3;
      for (let i = 0; i <= N; i++) {
        const f = (i / N) * 2 * Math.PI, row = rows(f), ahead = rows(f + E), back = rows(f - E); m = row.length;
        row.forEach((q, k) => {
          const pt = at(q, f), d = dir(q.th, f), a = q.a * rad, want = d.clone().multiplyScalar(Math.cos(a)).addScaledVector(tang(q.th, f), Math.sin(a));
          let nn = d;                                                     // on the ball: straight out, as the shell is
          if (q.a) {                                                       // elsewhere: square to the surface as built
            const along = at(ahead[k], f + E).sub(at(back[k], f - E)), down = at(row[Math.min(m - 1, k + 1)], f).sub(at(row[Math.max(0, k - 1)], f));
            nn = down.cross(along).normalize(); if (!(nn.lengthSq() > 0.5)) nn = want; else if (nn.dot(want) < 0) nn.negate();
          }
          pos.push(pt.x, pt.y, pt.z); nor.push(nn.x, nn.y, nn.z); col.push(...q.c); glo.push(...(q.g ?? NONE));
        });
      }
      for (let i = 0; i < N; i++) for (let k = 0; k < m - 1; k++) { const a = i * m + k, b = a + m; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("glow", new THREE.Float32BufferAttribute(glo, 3));
      g.setIndex(idx); g.applyMatrix4(toBody);
      const mesh = new THREE.Mesh(g, material); body.add(mesh); return mesh;
    };
    const lit = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 });
    lit.onBeforeCompile = (sh) => {                                       // the cut's light, carried by each point
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec3 glow;\nvarying vec3 vGlow;").replace("#include <begin_vertex>", "#include <begin_vertex>\n\tvGlow = glow;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vGlow;").replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += vGlow;");
    };
    const arc = (n, fn) => Array.from({ length: n + 1 }, (_, k) => fn(k / n));
    // The light at f as one pure colour at full strength (S), faded out where the line goes dark across the back.
    const pure = (f) => { const L = light(f), m = Math.max(...L), on = Math.min(1, Math.max(0, (m - 0.004) / 0.25)); return m > 0 ? L.map((x) => (x / m) * on) : NONE; };
    // The panel: the bottom of the same ball, white, with only a soft wash of the light near its edge.
    band((f) => {
      const S = pure(f), k = K(f), c = edgeOf(f) - (k * BP) / RP;
      return [
        ...arc(30, (u) => { const k = Math.exp(-(c - c * u) / 0.03); return { th: c * u, r: RP, a: 0, c: mul(WHITE, 1 - 0.35 * k), g: mul(S, 0.55 * k) }; }),
        ...arc(2, (u) => { const b = u * 12 * rad; return { th: c + ((k * BP) / RP) * Math.sin(b), r: RP - BP + BP * Math.cos(b), a: u * 12, c: mul(WHITE, 0.65 - 0.4 * u), g: mul(S, 0.55 + 0.5 * u) }; }),
      ];
    }, lit);
    // The light, on the panel's rounded edge and down its side into the cut: a sharp line, white-hot at its middle.
    band((f) => {
      const S = pure(f), k = K(f), c = edgeOf(f) - (k * BP) / RP, hot = (h) => S.map((x) => Math.min(1, x * 1.0 + 0.45 * h * Math.max(...S)));
      return [
        ...arc(8, (u) => { const b = (12 + u * 78) * rad; return { th: c + ((k * BP) / RP) * Math.sin(b), r: RP - BP + BP * Math.cos(b), a: 12 + u * 78, c: hot(Math.sin(Math.PI * Math.min(1, u * 1.15))) }; }),
        ...arc(3, (u) => ({ th: edgeOf(f), r: RP - BP - (RP - BP - FLOOR) * u, a: 90, c: mul(S, 0.75 - 0.5 * u) })),
      ];
    }, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }));
    // The floor of the cut, dark, with a little of the light on it.
    band((f) => {
      const S = pure(f), a = edgeOf(f), b = wallOf(f);
      return arc(2, (u) => ({ th: a + (b - a) * u, r: FLOOR, a: 0, c: DARK, g: mul(S, 0.6) }));
    }, lit);
    // The shell's edge: a dark wall up out of the cut (the light reflected low on it), a rounded white lip, and the
    // shell's surface from there out past where the model's shell now begins (a hair below it, so it never shows through).
    band((f) => {
      const S = pure(f), w = wallOf(f), k = K(f);
      return [
        ...arc(2, (u) => ({ th: w, r: FLOOR + (1 - BS - FLOOR) * u, a: -90, c: DARK, g: mul(S, 0.65 * (1 - 0.5 * u)) })),
        ...arc(7, (u) => { const b = (1 - u) * 90 * rad; return { th: w + k * BS * (1 - Math.sin(b)), r: 1 - BS + BS * Math.cos(b), a: -(1 - u) * 90, c: WHITE, g: mul(S, 0.45 * (1 - u)) }; }),
      ];
    }, lit);
    band((f) => { const w = wallOf(f) + BS * K(f); return arc(16, (u) => ({ th: w + (OUT - w) * u, r: u ? 0.9996 : 1, a: 0, c: WHITE })); }, shell?.material ?? lit);
    // The fine seam down the front, from under the visor to the cut.
    if (seamMat) {
      const pts = [];
      for (let lat = -27; lat > -89; lat -= 1) { const q = new V3(0, Math.sin(lat * rad), Math.cos(lat * rad)); const [th, f] = polar(q); if (th < wallOf(f) + BS * K(f) + 0.004) break; pts.push(q.multiplyScalar(1.0004)); }
      if (pts.length > 2) { const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.0032, 8), seamMat); tube.geometry.applyMatrix4(toBody); body.add(tube); }
    }
  }

  /** Puts it on a stage. The visor gets its own, much dimmer copy of the studio's reflection (a material only dims a
   *  reflection that is its own), so its glass stays deep black with a soft gleam. */
  attach(stage) {
    stage.scene.add(this.group);
    this.visorMat.envMap = stage.scene.environment; this.visorMat.envMapIntensity = 0.1; this.visorMat.needsUpdate = true;
    return this;
  }

  /** Puts a hand where a pose says: its place, turn, size (mirrored for the left hand) and blend shapes. */
  _place(h, spec, mirrored) {
    const y = v3(spec.fingers).normalize(), n = v3(spec.palm), z = n.sub(y.clone().multiplyScalar(n.dot(y))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
    h.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    h.position.copy(v3(spec.at)).addScaledVector(y, 0.03 * spec.size);
    const s = spec.size; h.scale.set(mirrored ? -s : s, s, s);
    const g = h.userData.glove; if (g) this.shapes.forEach((k, i) => { g.morphTargetInfluences[i] = clamp01(spec.shape?.[k] ?? 0); });
  }

  /** How far the nearest thing is from point p (less than 0: inside it), and the way out of it into `out`. */
  _distance(p, out) {
    const { c, n, R, r } = this.torus, e = this._n;
    // the ring: from the nearest point of its centre line
    const qx = p.x - c.x, qy = p.y - c.y, qz = p.z - c.z, h = qx * n.x + qy * n.y + qz * n.z;
    let rx = qx - n.x * h, ry = qy - n.y * h, rz = qz - n.z * h; const rl = Math.hypot(rx, ry, rz) || 1e-6;
    rx = c.x + (rx / rl) * R; ry = c.y + (ry / rl) * R; rz = c.z + (rz / rl) * R;
    const dx = p.x - rx, dy = p.y - ry, dz = p.z - rz, dl = Math.hypot(dx, dy, dz) || 1e-6;
    let best = dl - r - GAP.ring; out.set(dx / dl, dy / dl, dz / dl);
    let d = sphereOut(p, 0, 0, 0, 1 + GAP.body, e); if (d < best) { best = d; out.copy(e); }             // the body
    d = sphereOut(p, 0, 0.1, 0.25, 0.78 + GAP.body, e); if (d < best) { best = d; out.copy(e); }         // the visor's bulge
    for (const s of [-1, 1]) { d = earOut(p, s, e) - GAP.body; if (d < best) { best = d; out.copy(e); } } // the ears
    return best;
  }

  /**
   * Partway (k, 0..1) from hand pose a to pose b. A hand that goes from below the ring to above it (or back) swings out
   * round it on the way, and any other move bows out a little, so a hand never cuts through the ring or the body.
   */
  travel(a, b, k) {
    const m = mixHand(a, b, k); if (k <= 0 || k >= 1) return m;
    const { c, n, R, r } = this.torus, side = (h) => v3(h.at).sub(c).dot(n);
    const q = v3(mixHand(a, b, 0.5).at).sub(c), h = q.dot(n), u = q.addScaledVector(n, -h), rho = u.length() || 1e-6;
    const crosses = Math.sign(side(a)) !== Math.sign(side(b)) || Math.abs(h) < 0.35;
    const out = (crosses ? Math.max(0.12, R + r + 0.28 - rho) : 0.1) * Math.sin(Math.PI * clamp01(k));
    u.multiplyScalar(out / rho);
    return { ...m, at: [m.at[0] + u.x, m.at[1] + u.y, m.at[2] + u.z] };
  }

  /** Moves a placed hand out of anything it has gone into (a few small steps; poses are made to need none). */
  keepClear(h) {
    const g = h.userData.glove, w = g ? g.morphTargetInfluences : [], p = this._p, out = this._best, dir = new THREE.Vector3();
    for (let pass = 0; pass < 5; pass++) {
      let worst = 0;
      for (const s of this.samples) {
        p.copy(s.p); if (s.d) for (let k = 0; k < s.d.length; k++) if (w[k]) p.addScaledVector(s.d[k], w[k]);
        p.multiply(h.scale).applyQuaternion(h.quaternion).add(h.position);
        const d = this._distance(p, dir); if (d < worst) { worst = d; out.copy(dir); }
      }
      if (worst >= 0) return;
      h.position.addScaledVector(out, -worst + 0.002);
    }
  }

  /**
   * Sets the whole state (see the top of this file); anything left out takes its resting value.
   * @param {{ yaw?: number, pitch?: number, roll?: number, look?: number[], from?: string, to?: string, t?: number, blink?: number,
   *   ring?: number, sign?: number, hands?: { R?: any, L?: any }, handsMix?: number, time?: number, drift?: number[] }} [state]
   */
  pose({ yaw = 0, pitch = 0, roll = 0, look = [0, 0], from = "happy", to = from, t = 1, blink = 0, ring = 0, sign = 0, hands, handsMix = 1, time = 0, drift } = {}) {
    this.pivot.rotation.set(pitch, yaw, roll);
    this.ring.quaternion.copy(this.ring0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ring));
    // The face changes halfway, while the hands are on their way.
    const k = ease(t), e = EXPRESSIONS[t < 0.5 ? from : to] ?? EXPRESSIONS.happy;
    const open = e.face === "neutral";
    const face = this.faces[open && blink > 0.5 ? "blink" : e.face];
    if (this.visorMat.emissiveMap !== face) { this.visorMat.emissiveMap = face; }
    face.offset.set(-look[0] * 0.045, look[1] * 0.04);
    // Moving, its hands trail behind (the way it moves, in its own space).
    let dv = null;
    if (drift && (drift[0] || drift[1])) {
      const q = this._q.setFromEuler(this.pivot.rotation).invert();
      dv = new THREE.Vector3(drift[0], drift[1], 0).applyQuaternion(q);
    }
    for (const side of ["R", "L"]) {
      const a = (EXPRESSIONS[from] ?? EXPRESSIONS.happy).hands[side], b = (EXPRESSIONS[to] ?? EXPRESSIONS.happy).hands[side];
      let spec = a === b ? a : this.travel(a, b, k);
      // Its own hand poses: a pose, a name, or [from, to, k] for one on its way.
      let own = hands?.[side];
      if (typeof own === "string") own = hand(own, side, time);
      else if (Array.isArray(own)) own = this.travel(own[0], own[1], own[2]);
      if (own) spec = handsMix >= 1 ? own : this.travel(spec, own, handsMix);
      // A gentle float, each hand in its own time, and a little turn of the wrist.
      const ph = side === "R" ? 0 : 1.9;
      spec = twist(add3(spec, [0, 0.022 * Math.sin(time * 2.2 + ph), 0.01 * Math.sin(time * 1.4 + ph)]), 0.05 * Math.sin(time * 1.8 + ph * 1.3));
      if (dv) {
        const m = (v) => Math.max(-0.16, Math.min(0.16, -v * 0.08));
        spec = add3(spec, [m(dv.x), m(dv.y), m(dv.z)]);
        spec = { ...spec, fingers: [spec.fingers[0] - dv.x * 0.2, spec.fingers[1] - dv.y * 0.2, spec.fingers[2] - dv.z * 0.2] };
      }
      const h = this.hands[side];
      this._place(h, spec, side === "L");
      this.keepClear(h);
    }
    // The sign of the expression it is going to pops in with a little overshoot; the one it is leaving shrinks away.
    const toSign = EXPRESSIONS[to]?.sign, fromSign = from !== to ? EXPRESSIONS[from]?.sign : undefined;
    for (const [kind, s] of Object.entries(this.signs)) {
      const on = kind === toSign ? sign : kind === fromSign ? Math.max(0, 1 - t * 2) : 0;
      const pop = on <= 0 ? 0 : on < 0.6 ? (on / 0.6) * 1.18 : 1.18 - 0.18 * Math.min(1, (on - 0.6) / 0.4);
      s.scale.setScalar(0.62 * pop); s.material.opacity = Math.min(1, on * 3); s.material.rotation = (1 - Math.min(1, on)) * 0.5;
    }
  }
}

/** Loads the model and the faces and makes a character. Paths default to the site's own files. */
export async function loadCharacter({ model = "/home/character.glb", faces = "/home/faces.webp" } = {}) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const [gltf, sheet] = await Promise.all([loader.loadAsync(model), new THREE.ImageLoader().loadAsync(faces)]);
  return new Character(gltf.scene, sheet);
}

export { THREE };
