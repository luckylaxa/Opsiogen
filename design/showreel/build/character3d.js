// Our character for the film: the site's own character (src/lib/character3d.js), lit and drawn exactly as on the Home
// page, from the fuller model with all its hand shapes (design/hero/character/v3/web/character-full.glb: thumbs up,
// fist and hold as well as the site's finger gun, point and wave; webexport.py) and the site's faces
// (public/home/faces.webp). The pages here are opened from disk (file://), where fetch() cannot read files, so the
// model is read with XMLHttpRequest and handed to the module. window.CH3D.ready resolves once the model is in.
// CH3D.draw(canvas, state) renders one frame into that canvas; the state is the module's (see `pose()` there: yaw,
// pitch, roll, look, from, to, t, blink, ring, sign, hands, time, drift). CH3D also hands on the module's hand poses
// (HAND, hand, pointTo, mirror, EXPRESSIONS) for frames.html's hand tracks.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Character, createStage, HAND, hand, pointTo, mirror, EXPRESSIONS } from '../../../src/lib/character3d.js';

const HOME = '../../../public/home/', MODEL = '../../hero/character/v3/web/character-full.glb';
const load = (url) => new Promise((ok, no) => {
  const x = new XMLHttpRequest(); x.open('GET', url); x.responseType = 'arraybuffer';
  x.onload = () => (x.status === 0 || x.status === 200 ? ok(x.response) : no(new Error('model ' + x.status))); x.onerror = () => no(new Error('model')); x.send();
});

let ch = null;
const stages = new Map();
async function start() {
  const [buf, sheet] = await Promise.all([load(MODEL), new THREE.ImageLoader().loadAsync(HOME + 'faces.webp')]);
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

window.CH3D = { ready: start().then(() => true, (e) => { console.log('MISSING character model ' + e.message); return false; }), draw, HAND, hand, pointTo, mirror, EXPRESSIONS };
