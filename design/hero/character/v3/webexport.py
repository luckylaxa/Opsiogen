"""The version 3 character for the website: public/home/character.glb (the 3D model) and public/home/faces.webp (its faces).
Builds the model with build.py (no renders), keeps the character's own parts at a size fit for a web page, builds one
glove at the origin with its poses as blend shapes (the page draws it twice, once mirrored, for the two hands), maps
the visor for the face pictures, and exports a GLB. Run with Blender's Python:  python webexport.py   (then: npx @gltf-transform/cli meshopt out/character-v3-raw.glb
../../../../public/home/character.glb --level medium, and copy out/faces.webp to public/home/)
The page swaps in its own materials by name (src/components/sections/HeroCharacter.tsx)."""
import bpy, bmesh, math, os, sys, json
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
G = {'__file__': os.path.join(HERE, 'build.py' if os.path.exists(os.path.join(HERE, 'build.py')) else 'build3.py'), '__name__': 'model'}
exec(open(G['__file__']).read(), G)
OUT = G['OUT']; root = G['root']
DEST = os.environ.get('WEBOUT', OUT)
POSES = tuple(os.environ.get('POSES', 'gun,point,wave,thumbsup,fist,hold').split(','))   # the glove's blend shapes (build.py's HAND_POSES); its resting shape is the open hand
LOW = int(os.environ.get('GLOVEVERTS', 7000))                     # how many points the glove keeps


def drop(o):
    for c in list(o.children): drop(c)
    bpy.data.objects.remove(o, do_unlink=True)


# ---------------------------------------------------------------- only the character: no lights, camera or posed hands
for n in ('TurnL', 'TurnR', 'ThinkL', 'IdeaL', 'CoolR', 'WinkL', 'SurpL', 'SurpR'):
    if n in bpy.data.objects: drop(bpy.data.objects[n])
for o in list(bpy.data.objects):
    if o.type in ('LIGHT', 'CAMERA'): bpy.data.objects.remove(o, do_unlink=True)
root.matrix_world = Matrix.Identity(4)

# ---------------------------------------------------------------- one glove, at the origin: fingers along +Z, palm facing -Y, thumb on +X
e = G['hand']('Hand', 'open', 1, Vector((0, 0, 0)), (0, 0, 1), (0, -1, 0), 1.0, gap=0.036)
e.parent = None; e.matrix_world = Matrix.Identity(4); bpy.context.view_layer.update()
palm, rig = bpy.data.objects['HandPalm'], bpy.data.objects['HandRig']


def evaluated(pose):
    G['pose_glove'](rig, 1, G['HAND_POSES'][pose]); bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get(); ev = palm.evaluated_get(dg); me = ev.to_mesh()
    v = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', v); v = v.reshape(-1, 3)
    me.calc_loop_triangles(); t = np.empty(len(me.loop_triangles) * 3, dtype=np.int64); me.loop_triangles.foreach_get('vertices', t)
    ev.to_mesh_clear(); return v, t.reshape(-1, 3)


base, tris = evaluated('open')
posed = {p: evaluated(p)[0] for p in POSES}
G['pose_glove'](rig, 1, G['HAND_POSES']['open'])

# the open glove, thinned out to LOW points (smooth shapes keep well)
dense = bpy.data.meshes.new('GloveDense'); dense.from_pydata(base.tolist(), [], tris.tolist())
lo = bpy.data.objects.new('GloveLow', dense); bpy.context.collection.objects.link(lo)
dm = lo.modifiers.new('thin', 'DECIMATE'); dm.ratio = min(1.0, LOW / len(base)); dm.use_collapse_triangulate = True
dg = bpy.context.evaluated_depsgraph_get(); me = lo.evaluated_get(dg).to_mesh()
lv = np.empty(len(me.vertices) * 3); me.vertices.foreach_get('co', lv); lv = lv.reshape(-1, 3)
me.calc_loop_triangles(); lt = np.empty(len(me.loop_triangles) * 3, dtype=np.int64); me.loop_triangles.foreach_get('vertices', lt); lt = lt.reshape(-1, 3)
lo.evaluated_get(dg).to_mesh_clear()

# each pose carried over to the thin glove: every point keeps its place on the dense glove's surface as it bends
bvh = BVHTree.FromPolygons(base.tolist(), tris.tolist())
shapes = {p: np.empty_like(lv) for p in POSES}
for i, q in enumerate(lv):
    loc, nrm, fi, dist = bvh.find_nearest(Vector(q)); a, b, c = tris[fi]
    A, B, C = Vector(base[a]), Vector(base[b]), Vector(base[c])
    for p in POSES:
        P_ = posed[p]; shapes[p][i] = barycentric_transform(Vector(q), A, B, C, Vector(P_[a]), Vector(P_[b]), Vector(P_[c]))

gm = bpy.data.meshes.new('Glove'); gm.from_pydata(lv.tolist(), [], lt.tolist())
for f in gm.polygons: f.use_smooth = True
glove = bpy.data.objects.new('Glove', gm); bpy.context.collection.objects.link(glove); gm.materials.append(G['M_glove']); glove.parent = e
glove.shape_key_add(name='Basis')
for p in POSES:
    k = glove.shape_key_add(name=p, from_mix=False); k.data.foreach_set('co', shapes[p].ravel())
for o in (palm, rig, lo): bpy.data.objects.remove(o, do_unlink=True)
print('glove', len(lv), 'points,', len(lt), 'triangles')

# ---------------------------------------------------------------- the character's own parts, at web size
VA, VB, VZ, VN, BULGE, proj, bnd = G['VA'], G['VB'], G['VZ'], G['VN'], G['BULGE'], G['proj'], G['bnd']
MS, KS = 128, 18                                                  # the visor again, with fewer points; its face mapping as before
verts, faces, uvs = [], [], []
c_ = proj(0, VZ); verts.append(c_ - Vector((0, BULGE, 0))); uvs.append((0.5, 0.5))
for k in range(1, KS + 1):
    f = k / KS
    for j in range(MS):
        bx, bz = bnd(2 * math.pi * j / MS); x, z = f * bx, VZ + f * bz; p = proj(x, z); p.y -= BULGE * (1 - f ** 2.2) ** 0.85
        verts.append(p); uvs.append((0.5 + x / (2 * VA), 0.5 + (z - VZ) / (2 * VB)))
for j in range(MS): faces.append((0, 1 + j, 1 + (j + 1) % MS))
for i in range(KS - 1):
    for j in range(MS): p, q = 1 + i * MS + j, 1 + i * MS + (j + 1) % MS; faces.append((p, p + MS, q + MS, q))
old = bpy.data.objects['Visor']; bpy.data.objects.remove(old, do_unlink=True)
visor = G['mesh_object']('Visor', verts, faces, G['M_visor'], uvs=uvs, parent=root)

old = bpy.data.objects['Ring']; loc, rot = old.location.copy(), old.rotation_euler.copy(); bpy.data.objects.remove(old, do_unlink=True)
ring = G['logo_ring']('Ring', G['RING_R'], 0.07, 0.07, G['M_ring'], n=240, m=16, twist=0.0); ring.location = loc; ring.rotation_euler = rot   # spins about its own axis on the page

THIN = {'Body': 0.32, 'EarCupL': 0.2, 'EarCupR': 0.2, 'EarCentreL': 0.3, 'EarCentreR': 0.3, 'TopShell': 0.4, 'HandBand': 0.5}
for n, r in THIN.items():
    o = bpy.data.objects[n]; d_ = o.modifiers.new('thin', 'DECIMATE'); d_.ratio = r; d_.use_collapse_triangulate = True
    bpy.context.view_layer.objects.active = o
    with bpy.context.temp_override(object=o, active_object=o): bpy.ops.object.modifier_apply(modifier='thin')

# no picture in the visor's material: the page draws the faces itself
nt = G['M_visor'].node_tree
for l in list(nt.links):
    if l.from_node.bl_idname == 'ShaderNodeTexImage': nt.links.remove(l)

# ---------------------------------------------------------------- export
bpy.ops.object.select_all(action='DESELECT')
keep = [root, e]
def mark(o):
    o.select_set(True)
    for c in o.children: mark(c)
for o in keep: mark(o)
path = os.path.join(DEST, 'character-v3-raw.glb')
bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=True, export_texcoords=True,
                          export_normals=True, export_materials='EXPORT', export_image_format='NONE', export_vertex_color='ACTIVE',
                          export_all_vertex_colors=False, export_morph=True, export_morph_normal=True, export_skins=False, export_animations=False,
                          export_cameras=False, export_lights=False, export_extras=False)
tot = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH' and o.select_get())
print('exported', path, os.path.getsize(path) // 1024, 'KB,', tot, 'points')

# ---------------------------------------------------------------- the faces: one picture, six faces side by side (3 x 2), as the visor maps them
FACES = ('happy', 'neutral', 'blink', 'wink', 'thinking', 'surprised')
FW = int(os.environ.get('FACEW', 640)); FH = round(FW * G['TH'] / G['TW'])
sheet = Image.new('RGB', (FW * 3, FH * 2), (0, 0, 0))
for i, kind in enumerate(FACES):
    im = Image.open(G['face_image'](kind)).convert('RGB').resize((FW, FH), Image.LANCZOS); sheet.paste(im, ((i % 3) * FW, (i // 3) * FH))
fp = os.path.join(DEST, 'faces.webp'); sheet.save(fp, 'WEBP', quality=86, method=6)
json.dump({'faces': FACES, 'cols': 3, 'rows': 2, 'w': FW, 'h': FH}, open(os.path.join(DEST, 'faces.json'), 'w'))
print('faces', fp, os.path.getsize(fp) // 1024, 'KB', sheet.size)
