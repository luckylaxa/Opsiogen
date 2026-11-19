// Concept: the main character opens a door in its underside and a mini version of it rolls out (to become the mouse
// cursor). Drawn from the Home hero's model (public/home/character.glb) with the hero's own studio, lights and
// materials (as design/showreel/build/character3d.js). The model file is not changed: the door is the model's own base
// panel (the part below the colour line, material "base"), swung on a hinge at the back of its groove; the lit bay
// inside and the door's inner side are added parts that sit inside the body, so with the door shut nothing shows.
// window.DOOR.ready resolves once the model is in; DOOR.draw(canvas, state) renders one frame (see draw()).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const load = (url) => new Promise((ok, no) => {
  const x = new XMLHttpRequest(); x.open('GET', url); x.responseType = 'arraybuffer';
  x.onload = () => (x.status === 0 || x.status === 200 ? ok(x.response) : no(new Error('model ' + x.status))); x.onerror = () => no(new Error('model')); x.send();
});
let model = null;
async function start() { THREE.ColorManagement.enabled = false; model = await new GLTFLoader().parseAsync(await load('../../public/home/character.glb'), ''); }

// ---- the groove the base panel sits in, from the model's build script (design/hero/character/model/build.py),
// turned from Blender's axes (Z up, eye along -Y) into the file's (Y up, eye along +Z): (x, y, z) -> (x, z, -y).
const V3 = (x, y, z) => new THREE.Vector3(x, y, z), toGl = (v) => V3(v.x, v.z, -v.y), rad = Math.PI / 180;
const RHO = 53 * rad, h0 = V3(Math.sin(212 * rad), -Math.cos(212 * rad), 0);
const AXb = V3(0, 0, -1).multiplyScalar(Math.cos(21 * rad)).add(h0.clone().multiplyScalar(Math.sin(21 * rad))).normalize();
const nh0 = h0.clone().negate(), Ub = nh0.clone().sub(AXb.clone().multiplyScalar(nh0.dot(AXb))).normalize(), Vb = AXb.clone().cross(Ub);
const AX = toGl(AXb), U = toGl(Ub), Vv = toGl(Vb);
const groove = (phi) => AX.clone().multiplyScalar(Math.cos(RHO)).add(U.clone().multiplyScalar(Math.sin(RHO) * Math.cos(phi))).add(Vv.clone().multiplyScalar(Math.sin(RHO) * Math.sin(phi)));
// the hinge: the groove's back-most point (furthest from the viewer), so the door swings down toward the front
let PHI_H = 0; { let best = 1e9; for (let i = 0; i < 720; i++) { const f = (i / 720) * 2 * Math.PI, z = groove(f).z; if (z < best) { best = z; PHI_H = f; } } }
const ORIGIN = V3(0, 0, 0), HINGE = groove(PHI_H), HAXIS = U.clone().multiplyScalar(-Math.sin(PHI_H)).add(Vv.clone().multiplyScalar(Math.cos(PHI_H))).normalize();

function studio(gl, scene) {                                   // the hero's studio reflections and lights
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
}
const LOOKS = () => ({
  body: new THREE.MeshPhysicalMaterial({ color: 0xeef0f6, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.04 }),
  base: new THREE.MeshPhysicalMaterial({ color: 0xdfe2ec, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }),
  socket: new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.6 }),
  gasket: new THREE.MeshPhysicalMaterial({ color: 0x07090d, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x020406, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
  seam: new THREE.MeshBasicMaterial({ color: 0xa9aebd }),
  strip: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
  stripGlow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
});
function dress(root, L) {                                       // the hero's materials, and its eye light and blink line
  let hud = null, hudMat = null, base = null;
  root.traverse((o) => {
    if (!o.isMesh) return;
    const name = o.material.name;
    if (name === 'hud') { const src = o.material; hudMat = new THREE.MeshBasicMaterial({ map: src.emissiveMap || src.map, toneMapped: false }); o.material = hudMat; hud = o; }
    else if (L[name]) { if (name === 'base') base = o; o.material = L[name]; if (name === 'glass' || name === 'stripGlow') o.renderOrder = 2; }
  });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x4de9ff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.014), lineMat);
  if (hud) { const bb = new THREE.Box3().setFromObject(hud); line.position.set(0, (bb.min.y + bb.max.y) / 2, bb.max.z + 0.02); }
  line.renderOrder = 1; root.add(line);
  return { hud, hudMat, lineMat, base };
}
function blinkTo(d, b, look) {                                  // the light blink, as on the site
  const ph = b || 0, dim = ph <= 0 ? 0 : ph < 0.3 ? ph / 0.3 : ph < 0.5 ? 1 : Math.max(0, 1 - (ph - 0.5) / 0.12);
  const fl = ph > 0.55 ? Math.sin(((ph - 0.55) / 0.45) * Math.PI) : 0;
  if (d.hud) { const lk = look || [0, 0]; d.hud.position.x = lk[0] * 0.06; d.hud.position.y = -lk[1] * 0.05; d.hudMat.color.setScalar(1.5 * (1 - dim * 0.94) + fl * 1.2); }
  d.lineMat.opacity = dim;
}
const OURS = [[0.21, 0.83, 1.0], [0.35, 0.49, 1.0], [0.71, 0.4, 1.0], [1.0, 0.37, 0.71], [1.0, 0.6, 0.24]];   // the mark's colours
function ours(t) { t = ((t % 1) + 1) % 1; const f = t * OURS.length, i = Math.floor(f), k = f - i, a = OURS[i], b = OURS[(i + 1) % OURS.length]; return a.map((v, j) => v + (b[j] - v) * k); }

const scenes = new Map();
function sceneFor(canvas, addOns) {
  const keyName = canvas.id + (addOns ? '+' : '-');
  if (scenes.has(keyName)) return scenes.get(keyName);
  const gl = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  gl.outputColorSpace = THREE.SRGBColorSpace; gl.setClearColor(0x000000, 0); gl.setPixelRatio(1);
  const scene = new THREE.Scene(); studio(gl, scene);
  const cam = new THREE.PerspectiveCamera(20, 1, 0.5, 40);
  const L = LOOKS(), root = model.scene.clone(true), main = dress(root, L);
  const pivot = new THREE.Group(); pivot.rotation.order = 'YXZ'; pivot.add(root); scene.add(pivot);
  const s = { gl, scene, cam, pivot, main, addOns, w: 0, h: 0 };
  if (addOns) {
    // the door: the base panel, moved onto a hinge at the back of its groove
    const hinge = new THREE.Group(); hinge.position.copy(HINGE); main.base.parent.add(hinge); hinge.add(main.base); main.base.position.copy(HINGE).negate();
    // its inner side, dark, just inside it (seen only once it swings open)
    const liner = new THREE.Mesh(main.base.geometry, new THREE.MeshStandardMaterial({ color: 0x0e0f13, roughness: 0.6, metalness: 0, envMapIntensity: 0.25, side: THREE.BackSide }));
    liner.scale.setScalar(0.992); main.base.add(liner);
    // the bay: a dark hollow lit in our colours, brightest by the opening
    const g = new THREE.SphereGeometry(0.86, 96, 48), pos = g.attributes.position, col = new Float32Array(pos.count * 3), d = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      d.fromBufferAttribute(pos, i).normalize(); const k = Math.max(0, d.dot(AX)), glow = Math.pow(k, 1.7);
      const az = Math.atan2(d.dot(Vv), d.dot(U)) / (2 * Math.PI) + 0.5, c = ours(az);
      for (let j = 0; j < 3; j++) col[i * 3 + j] = 0.015 + c[j] * glow * 0.8;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const bayMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, toneMapped: false });
    const bay = new THREE.Mesh(g, bayMat); root.add(bay);
    // the mini: the same character, small, with its own eye light
    const mroot = model.scene.clone(true), mini = dress(mroot, L);
    const mpivot = new THREE.Group(); mpivot.rotation.order = 'YXZ'; mpivot.add(mroot);
    const mholder = new THREE.Group(); mholder.add(mpivot); scene.add(mholder);
    // a pool of our colours on the floor, for the landing
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    const lg = x.createLinearGradient(0, 0, 256, 0); [['#35d4ff', 0.04], ['#5a7dff', 0.26], ['#b667ff', 0.48], ['#ff5fb4', 0.7], ['#ff9a3c', 0.96]].forEach(([c, o]) => lg.addColorStop(o, c));
    x.fillStyle = lg; x.fillRect(0, 0, 256, 256); x.globalCompositeOperation = 'destination-in';
    const rg = x.createRadialGradient(128, 128, 0, 128, 128, 128); rg.addColorStop(0.15, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    const pool = (o) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };
    // a beam of light from the opening to the floor: a soft glow that always faces the viewer (no hard tube edges),
    // light cyan at its core and our violet at its edges, fading toward the floor
    const bc = document.createElement('canvas'); bc.width = 128; bc.height = 128; const bx = bc.getContext('2d');
    const across = bx.createLinearGradient(0, 0, 128, 0);
    [['rgba(182,103,255,0)', 0], ['rgba(182,103,255,0.55)', 0.18], ['rgba(120,170,255,0.8)', 0.36], ['rgba(200,245,255,1)', 0.5], ['rgba(120,170,255,0.8)', 0.64], ['rgba(255,95,180,0.55)', 0.82], ['rgba(255,95,180,0)', 1]].forEach(([c, o]) => across.addColorStop(o, c));
    bx.fillStyle = across; bx.fillRect(0, 0, 128, 128); bx.globalCompositeOperation = 'destination-in';
    const down = bx.createLinearGradient(0, 0, 0, 128); down.addColorStop(0, 'rgba(0,0,0,1)'); down.addColorStop(0.7, 'rgba(0,0,0,0.55)'); down.addColorStop(1, 'rgba(0,0,0,0.15)');
    bx.fillStyle = down; bx.fillRect(0, 0, 128, 128);
    const btex = new THREE.CanvasTexture(bc);
    const beamMat = new THREE.MeshBasicMaterial({ map: btex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1), beamMat); beam.renderOrder = 3; scene.add(beam);
    Object.assign(s, { hinge, liner, bay, bayMat, beam, beamMat, mini, mpivot, mholder, mainPool: pool(0.9), miniPool: pool(0.9) });
  }
  scenes.set(keyName, s);
  return s;
}

/*
 * state: yaw/pitch/roll (main, radians), blink (0..1), look [x,y], lift (main's height), door (0 shut .. 1 open),
 * bay (light 0..1), cam {fov, pos:[x,y,z], at:[x,y,z]}, floor (the floor's height, for the pools),
 * mini {show, pos:[x,y,z], scale, yaw, pitch, roll, blink}, mainPool / miniPool (0..1), addOns (false: the model alone).
 */
function draw(canvas, st = {}) {
  if (!model) return;
  const s = sceneFor(canvas, st.addOns !== false);
  if (s.w !== canvas.width || s.h !== canvas.height) { s.gl.setSize(canvas.width, canvas.height, false); s.cam.aspect = canvas.width / canvas.height; s.cam.updateProjectionMatrix(); s.w = canvas.width; s.h = canvas.height; }
  if (st.site) {
    // st.site {cx, cy, ppu}: the character's middle on the screen (px) and pixels per body radius there. The hero's
    // camera (6.75 away, looking straight at it) with its view widened to the whole canvas, so the character looks
    // exactly as on the page and the mini can go anywhere on the screen in the same space.
    const { cx, cy, ppu } = st.site, d = 6.75, n = s.cam.near, k = n / d / ppu;
    s.cam.position.set(0, 0, d); s.cam.quaternion.identity();
    s.cam.projectionMatrix.makePerspective(-cx * k, (canvas.width - cx) * k, cy * k, (cy - canvas.height) * k, n, s.cam.far);
    s.cam.projectionMatrixInverse.copy(s.cam.projectionMatrix).invert();
  } else {
    const c = st.cam || { fov: 20, pos: [0, 0, 6.75], at: [0, 0, 0] };
    s.cam.fov = c.fov; s.cam.position.set(...c.pos); s.cam.lookAt(...c.at); s.cam.updateProjectionMatrix();
  }
  s.pivot.rotation.set(st.pitch || 0, st.yaw || 0, st.roll || 0); s.pivot.position.y = st.lift || 0;
  s.pivot.visible = !st.hideMain;                                   // hideMain: only the character in its own view
  blinkTo(s.main, st.blink, st.look);
  if (s.addOns) {
    // the added parts are there only while the door is open: shut, it is the model alone, pixel for pixel
    const open = (st.door || 0) > 0;
    const flap = st.doorMode === 'flap', k = st.door || 0;
    s.hinge.position.copy(flap ? HINGE : ORIGIN); s.main.base.position.copy(flap ? HINGE : ORIGIN).negate();
    s.hinge.quaternion.setFromAxisAngle(HAXIS, k * (flap ? st.doorMax || 1.25 : st.slideMax || 1.15));
    s.hinge.scale.setScalar(flap ? 1 : 1 + 0.006 * Math.min(1, k * 6));          // sliding, it rides just over the body
    s.liner.visible = s.bay.visible = open;
    // the beam: from the opening's middle down to the floor
    s.pivot.updateMatrixWorld(true);
    const top = AX.clone().multiplyScalar(0.62).applyMatrix4(s.pivot.matrixWorld), fy0 = st.floor ?? -1.55, len = Math.max(0.01, top.y - fy0);
    s.beam.visible = (st.beam || 0) > 0; s.beamMat.opacity = st.beam || 0;
    s.beam.position.set(top.x, top.y - len / 2, top.z + 0.25); s.beam.scale.set(1, len, 1); s.beam.quaternion.copy(s.cam.quaternion);
    s.bayMat.color.setScalar(st.bay || 0);
    const m = st.mini || {};
    s.mholder.visible = !!m.show && !m.solo;
    if (m.show) {
      s.mholder.position.set(...(m.pos || [0, 0, 0])); s.mholder.scale.setScalar(m.scale || 0.24);
      s.mpivot.rotation.set(m.pitch || 0, m.yaw || 0, m.roll || 0); blinkTo(s.mini, m.blink, m.look);
    }
    const fy = st.floor ?? -1.55;
    s.mainPool.position.set(0, fy, 0.1); s.mainPool.scale.set(2.6, 1.1, 1); s.mainPool.material.opacity = st.mainPool ?? 0.9;
    s.miniPool.visible = !!m.show && (st.miniPool || 0) > 0;
    if (s.miniPool.visible) { s.miniPool.position.set(m.pos[0], fy + 0.002, m.pos[2]); const k = (m.scale || 0.24) * 2.4; s.miniPool.scale.set(k, k * 0.45, 1); s.miniPool.material.opacity = st.miniPool; }
  }
  s.gl.render(s.scene, s.cam);
  const m = st.mini || {};
  if (s.addOns && m.show && m.solo && st.site) {
    // Away from the main character, the mini gets a view of its own: the same camera spot, but looking straight at it,
    // so it stays round wherever it is on the screen (a wide view would stretch it toward the edges).
    const { cx, cy, ppu } = st.site, d = 6.75, [mx, my, mz] = m.pos, L = Math.hypot(mx, my, d - mz);
    const px = cx + mx * ppu * d / (d - mz), py = cy - my * ppu * d / (d - mz), W = Math.max(160, Math.ceil(3.2 * (m.scale || 0.24) * ppu * d / (d - mz)));
    if (!s.solo) s.solo = new THREE.PerspectiveCamera(20, 1, 0.5, 40);
    s.solo.position.set(0, 0, d); s.solo.lookAt(mx, my, mz);
    s.solo.fov = 2 * Math.atan((W * (d - mz)) / (2 * L * ppu * d)) * 180 / Math.PI; s.solo.aspect = 1; s.solo.updateProjectionMatrix();
    const hide = [s.pivot, s.beam, s.mainPool, s.miniPool], was = hide.map((o) => o.visible);
    hide.forEach((o) => (o.visible = false)); s.mholder.visible = true;
    s.mholder.position.set(mx, my, mz); s.mholder.scale.setScalar(m.scale || 0.24);
    // m.face (0..1): turn it toward the camera, so that as the cursor it looks straight out of the screen
    const f = m.face || 0, vx = -mx, vy = -my, vz = d - mz, vl = Math.hypot(vx, vy, vz);
    s.mpivot.rotation.set((m.pitch || 0) + f * Math.asin(-vy / vl), (m.yaw || 0) + f * Math.atan2(vx, vz), m.roll || 0);
    const x = Math.round(px - W / 2), y = Math.round(canvas.height - py - W / 2);
    s.gl.autoClear = false; s.gl.setScissorTest(true); s.gl.setViewport(x, y, W, W); s.gl.setScissor(x, y, W, W); s.gl.clearDepth();
    s.gl.render(s.scene, s.solo);
    s.gl.setScissorTest(false); s.gl.setViewport(0, 0, canvas.width, canvas.height); s.gl.autoClear = true;
    hide.forEach((o, i) => (o.visible = was[i]));
  }
}
// Where the door's far edge is when open (for the mini's path), and the hinge, for the timeline.
function doorEdge(open, doorMax = 1.25) {
  const q = new THREE.Quaternion().setFromAxisAngle(HAXIS, open * doorMax), far = groove(PHI_H + Math.PI);
  return far.clone().sub(HINGE).applyQuaternion(q).add(HINGE).toArray();
}
window.DOOR = { ready: start().then(() => true, (e) => { console.log('MISSING model ' + e.message); return false; }), draw, doorEdge, info: () => ({ AX: AX.toArray(), HINGE: HINGE.toArray(), HAXIS: HAXIS.toArray(), far: groove(PHI_H + Math.PI).toArray() }) };
