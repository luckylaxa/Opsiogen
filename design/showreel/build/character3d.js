// Our character for the film: the site's own character (src/lib/character3d.js), from public/home/character.glb and its
// faces (public/home/faces.webp), lit and drawn exactly as on the Home page. The pages here are opened from disk
// (file://), where fetch() cannot read files, so the model is read with XMLHttpRequest and handed to the module.
// window.CH3D.ready resolves once the model is in. CH3D.draw(canvas, state) renders one frame into that canvas; the state
// is the module's (yaw, pitch, roll, look, from, to, t, blink, ring, sign: see `pose()` there).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Character, createStage } from '../../../src/lib/character3d.js';

const HOME = '../../../public/home/';
const load = (url) => new Promise((ok, no) => {
  const x = new XMLHttpRequest(); x.open('GET', url); x.responseType = 'arraybuffer';
  x.onload = () => (x.status === 0 || x.status === 200 ? ok(x.response) : no(new Error('model ' + x.status))); x.onerror = () => no(new Error('model')); x.send();
});

let ch = null;
const stages = new Map();
async function start() {
  const [buf, sheet] = await Promise.all([load(HOME + 'character.glb'), new THREE.ImageLoader().loadAsync(HOME + 'faces.webp')]);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buf, '');
  ch = new Character(gltf.scene, sheet);
}

// One stage per canvas, made on first use; the one character moves to whichever stage draws it.
function draw(canvas, state = {}) {
  if (!ch) return;
  let s = stages.get(canvas);
  if (!s) { s = { st: createStage(canvas, { keep: true }), size: 0 }; s.st.gl.setPixelRatio(1); stages.set(canvas, s); }
  if (ch.group.parent !== s.st.scene) ch.attach(s.st);
  if (s.size !== canvas.width) { s.st.gl.setSize(canvas.width, canvas.width, false); s.size = canvas.width; }
  ch.pose(state); s.st.render();
}

window.CH3D = { ready: start().then(() => true, (e) => { console.log('MISSING character model ' + e.message); return false; }), draw };
