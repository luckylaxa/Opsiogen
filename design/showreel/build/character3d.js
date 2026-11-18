// Our character for the film, drawn live from the Home hero's 3D model (public/home/character.glb) with the hero's own
// studio, lights and materials (src/components/sections/HeroCharacter.tsx), so it moves exactly as it does on the site:
// it turns right round (a press on the site gives one full turn), looks about, tilts and blinks its light.
// window.CH3D.ready resolves once the model is in. CH3D.draw(canvas, {yaw, pitch, roll, blink, look}) renders one frame
// into that canvas: yaw and pitch in radians (yaw > 0 turns its eye to the right of the screen, pitch > 0 down), roll
// tilts it, blink is 0..1 through a blink (0: none), look shifts its eye screen the way it looks (-1..1, as lean on the site).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const load = (url) => new Promise((ok, no) => {
  const x = new XMLHttpRequest(); x.open('GET', url); x.responseType = 'arraybuffer';
  x.onload = () => (x.status === 0 || x.status === 200 ? ok(x.response) : no(new Error('model ' + x.status))); x.onerror = () => no(new Error('model')); x.send();
});

const renderers = new Map();
let model = null;

async function start() {
  THREE.ColorManagement.enabled = false;
  const buf = await load('../../../public/home/character.glb');
  model = await new GLTFLoader().parseAsync(buf, '');
}

// One renderer (and scene) per canvas, built on first use: the hero's studio reflections, key light and coloured
// lights from below, and its materials.
function sceneFor(canvas) {
  if (renderers.has(canvas)) return renderers.get(canvas);
  const gl = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearColor(0x000000, 0); gl.setPixelRatio(1);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(20, 1, 1, 20); cam.position.set(0, 0, 6.75);
  const W = 512, H = 256, data = new Float32Array(W * H * 4);
  const wins = [[0.835, 0.885, 0.6, 0.8], [0.895, 0.93, 0.6, 0.8], [0.595, 0.64, 0.6, 0.77], [0.652, 0.682, 0.6, 0.77]];
  const blob = (u, v, cu, cv2, r) => { const a = (u - cu) * 2, b = v - cv2, q = 1 - Math.sqrt(a * a + b * b) / r; return q > 0 ? q * q : 0; };
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
  const key = new THREE.DirectionalLight(0xffffff, 0.5); key.position.set(-3, 4, 4); scene.add(key);
  const blue = new THREE.PointLight(0x3f7bff, 0.9, 6, 0); blue.position.set(-1.3, -2.3, 1.7); scene.add(blue);
  const pink = new THREE.PointLight(0xff4fa0, 0.8, 6, 0); pink.position.set(1.4, -2.3, 1.7); scene.add(pink);
  const looks = {
    body: new THREE.MeshPhysicalMaterial({ color: 0xeef0f6, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.04 }),
    base: new THREE.MeshPhysicalMaterial({ color: 0xdfe2ec, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }),
    socket: new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.6 }),
    gasket: new THREE.MeshPhysicalMaterial({ color: 0x07090d, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x020406, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
    seam: new THREE.MeshBasicMaterial({ color: 0xa9aebd }),
    strip: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    stripGlow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  };
  const root = model.scene.clone(true);
  let hud = null, hudMat = null;
  root.traverse((o) => {
    if (!o.isMesh) return;
    const name = o.material.name;
    if (name === 'hud') { const src = o.material; hudMat = new THREE.MeshBasicMaterial({ map: src.emissiveMap || src.map, toneMapped: false }); o.material = hudMat; hud = o; }
    else if (looks[name]) { o.material = looks[name]; if (name === 'glass' || name === 'stripGlow') o.renderOrder = 2; }
  });
  const pivot = new THREE.Group(); pivot.rotation.order = 'YXZ'; pivot.add(root); scene.add(pivot);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x4de9ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.014), lineMat);
  if (hud) { const bb = new THREE.Box3().setFromObject(hud); line.position.set(0, (bb.min.y + bb.max.y) / 2, bb.max.z + 0.02); }
  line.renderOrder = 1; pivot.add(line);
  const s = { gl, scene, cam, pivot, hud, hudMat, lineMat, size: 0 };
  renderers.set(canvas, s);
  return s;
}

function draw(canvas, o = {}) {
  if (!model) return;
  const s = sceneFor(canvas), px = canvas.width;
  if (s.size !== px) { s.gl.setSize(px, px, false); s.size = px; }
  s.pivot.rotation.y = o.yaw || 0; s.pivot.rotation.x = o.pitch || 0; s.pivot.rotation.z = o.roll || 0;
  // The blink is light, not lids: the eye screen dims, a line of light crosses it, then a flash as it comes back.
  const b = o.blink || 0, ph = b, dim = b <= 0 ? 0 : ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : Math.max(0, 1 - (ph - 0.5) / 0.12);
  const fl = b > 0 && ph > 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
  if (s.hud) { const lk = o.look || [0, 0]; s.hud.position.x = lk[0] * 0.06; s.hud.position.y = -lk[1] * 0.05; s.hudMat.color.setScalar(1.5 * (1 - dim * 0.94) + fl * 1.2); }
  s.lineMat.opacity = dim;
  s.gl.render(s.scene, s.cam);
}

window.CH3D = { ready: start().then(() => true, (e) => { console.log('MISSING character model ' + e.message); return false; }), draw };
