// Our character (version 3), drawn live with three.js. The Home hero (components/sections/HeroCharacter.tsx), the intro's
// pictures and the showreel's 3D shots (design/showreel/build) all draw it with this, so it looks and moves the same
// everywhere. Its model is public/home/character.glb and its faces public/home/faces.webp, both made from the Blender
// model by design/hero/character/v3/webexport.py.
//
// The model: the body with its visor, ears, top stripe, lit seam and the rainbow ring (which spins about its own axis),
// and one glove (fingers along +y, palm toward +z, thumb on +x) drawn twice, once mirrored, for the two hands. The glove
// carries its poses as blend shapes: the open hand at rest, and `gun`, `point` and `wave`.
//
// A character's state, set each frame with `pose()`:
//   yaw, pitch, roll   how it is turned (radians; yaw > 0 turns its face to the right of the screen, pitch > 0 down)
//   look: [x, y]       where its face looks on the visor (-1..1)
//   from, to, t        the expression it is going from and to, and how far (0..1); see EXPRESSIONS
//   blink              0..1: its open eyes shut for a moment
//   ring               the ring's spin (radians)
//   sign               0..1: how far the sign of the expression it is going to (sparks, ?, !!) has popped in; the sign
//                      of the one it is leaving goes by itself in the first half of the change
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/** The faces in public/home/faces.webp, three to a row. */
export const FACES = ["happy", "neutral", "blink", "wink", "thinking", "surprised"];
const SHAPES = ["gun", "point", "wave"];

/**
 * Where the hands go, in the character's own space: x to the right of the screen, y up, z toward the viewer, its body
 * a ball of radius 1. `at` is the middle of the wrist, `fingers` and `palm` the ways they point, `size` its scale,
 * `shape` the glove's pose. R is its right hand (on the left of the screen), L its left.
 */
const REST = {
  R: { at: [-1.16, -0.34, 0.3], fingers: [-0.8, 0.5, 0.33], palm: [0.25, 0.4, 0.88], size: 1.22, shape: {} },
  L: { at: [1.16, -0.34, 0.3], fingers: [0.8, 0.5, 0.33], palm: [-0.25, 0.4, 0.88], size: 1.22, shape: {} },
};
export const EXPRESSIONS = {
  /** At rest: smiling, eyes shut in a happy curve, hands open at its sides. */
  happy: { face: "happy", hands: REST },
  /** Looking about: eyes open. */
  neutral: { face: "neutral", hands: REST },
  /** A wink and a finger gun, with a little burst of sparks. */
  wink: {
    face: "wink", sign: "spark",
    hands: { R: REST.R, L: { at: [0.82, -0.46, 0.98], fingers: [1, -0.08, 0.3], palm: [0, 0.05, 1], size: 1.34, shape: { gun: 1 } } },
  },
  /** Hmm: a finger on its chin, a question mark. */
  thinking: {
    face: "thinking", sign: "question",
    hands: { R: REST.R, L: { at: [0.5, -0.84, 1.24], fingers: [-0.56, 0.8, -0.16], palm: [0.12, 0.32, 1], size: 1.34, shape: { point: 1 } } },
  },
  /** Oh!: both hands up by its cheeks, palms out. */
  surprised: {
    face: "surprised", sign: "bang",
    hands: {
      R: { at: [-0.7, -0.42, 1.0], fingers: [0.16, 1, 0.1], palm: [0.1, 0, 1], size: 1.2, shape: { wave: 1 } },
      L: { at: [0.7, -0.42, 1.0], fingers: [-0.16, 1, 0.1], palm: [-0.1, 0, 1], size: 1.2, shape: { wave: 1 } },
    },
  },
};

const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
/** A hand's place as a transform: the glove's own frame turned so its fingers and palm point the given ways. */
function place(h, mirror) {
  const y = v3(h.fingers).normalize(), n = v3(h.palm), z = n.sub(y.clone().multiplyScalar(n.dot(y))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  return { p: v3(h.at).addScaledVector(y, 0.03 * h.size), q, s: h.size * (mirror ? -1 : 1), w: SHAPES.map((k) => h.shape[k] ?? 0) };
}
const PLACES = Object.fromEntries(Object.entries(EXPRESSIONS).map(([k, e]) => [k, { R: place(e.hands.R, false), L: place(e.hands.L, true) }]));
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

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

    // The ring spins about its own axis.
    this.ring = body.getObjectByName("Ring"); this.ring0 = this.ring.quaternion.clone();

    // The hands: the glove as it is (its right hand) and a mirrored copy (its left).
    glove.removeFromParent();
    this.hands = { R: glove, L: glove.clone(true) };
    for (const h of Object.values(this.hands)) {
      h.traverse((m) => { if (m.isMesh && m.morphTargetInfluences) h.userData.glove = m; });
      this.pivot.add(h);
    }

    // The signs: they stay beside it whichever way it turns.
    this.signs = {};
    for (const k of Object.keys(SIGN_AT)) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture(k), transparent: true, depthWrite: false, toneMapped: false }));
      s.position.copy(v3(SIGN_AT[k])); s.scale.setScalar(0); s.renderOrder = 3; this.group.add(s); this.signs[k] = s;
    }
    this.pose({});
  }

  /** Puts it on a stage. The visor gets its own, much dimmer copy of the studio's reflection (a material only dims a
   *  reflection that is its own), so its glass stays deep black with a soft gleam. */
  attach(stage) {
    stage.scene.add(this.group);
    this.visorMat.envMap = stage.scene.environment; this.visorMat.envMapIntensity = 0.1; this.visorMat.needsUpdate = true;
    return this;
  }

  /** Sets the whole state (see the top of this file); anything left out takes its resting value. */
  pose({ yaw = 0, pitch = 0, roll = 0, look = [0, 0], from = "happy", to = from, t = 1, blink = 0, ring = 0, sign = 0 } = {}) {
    this.pivot.rotation.set(pitch, yaw, roll);
    this.ring.quaternion.copy(this.ring0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ring));
    // The face changes halfway, while the hands are on their way.
    const k = ease(t), e = EXPRESSIONS[t < 0.5 ? from : to] ?? EXPRESSIONS.happy;
    const open = e.face === "neutral";
    const face = this.faces[open && blink > 0.5 ? "blink" : e.face];
    if (this.visorMat.emissiveMap !== face) { this.visorMat.emissiveMap = face; }
    face.offset.set(-look[0] * 0.045, look[1] * 0.04);
    for (const side of ["R", "L"]) {
      const a = (PLACES[from] ?? PLACES.happy)[side], b = (PLACES[to] ?? PLACES.happy)[side], h = this.hands[side];
      h.position.lerpVectors(a.p, b.p, k);
      h.quaternion.slerpQuaternions(a.q, b.q, k);
      // A hand that moves rises a little on the way, so it never passes through the body.
      const lift = a === b ? 0 : Math.sin(Math.PI * k) * 0.12; h.position.z += lift;
      const s = a.s + (b.s - a.s) * k; h.scale.set(s, Math.abs(s), Math.abs(s));
      const g = h.userData.glove; for (let i = 0; i < SHAPES.length; i++) g.morphTargetInfluences[i] = a.w[i] + (b.w[i] - a.w[i]) * k;
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
