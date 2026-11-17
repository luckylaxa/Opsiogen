"""Builds our own electric supercar in Blender: a low, wide wedge with smooth surfaces between sharp character lines. Run with --render for check views.
Coordinates: metres; the nose points along -Y, Z is up, the ground is z = 0."""
import bpy, bmesh, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, col, rough=0.3, metal=0.0, coat=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.03
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    return m
PAINT = tuple(float(v) for v in os.environ.get('PAINT', '0.80,0.81,0.84').split(',')); TAG = os.environ.get('TAG', '')      # other paint colours for the build-your-car screen
M_paint = material('paint', PAINT, rough=0.3, metal=0.2, coat=1.0)
M_glass = material('glass', (0.012, 0.014, 0.018), rough=0.04, coat=1.0)
M_black = material('black', (0.018, 0.018, 0.02), rough=0.42)
M_tyre = material('tyre', (0.012, 0.012, 0.013), rough=0.85)
M_rim = material('rim', (0.09, 0.095, 0.105), rough=0.3, metal=0.9)
M_blade = material('blade', (0, 0, 0), rough=0.5, emit=(1.0, 0.36, 0.14), strength=9.0)
M_ring = material('ring', (0, 0, 0), rough=0.5, emit=(1.0, 0.45, 0.2), strength=4.0)
MATS = [M_paint, M_glass, M_black]

# Each station is one slice across the car, front to back: (y, sweep, [(x, z) x 9]) from the centre of the top, round the side, to the centre of the floor.
# Points: 0 centre of roof, 1 edge of the glass, 2 inner shoulder, 3 fender crest, 4 side line, 5 top of sill, 6 bottom of sill, 7 underside, 8 centre of floor.
ST = [
 (-2.34, 0.30, [(0, .315), (.34, .315), (.58, .31), (.73, .30), (.775, .255), (.78, .20), (.75, .125), (.50, .105), (0, .105)]),  # nose tip
 (-2.02, 0.07, [(0, .425), (.40, .435), (.70, .49), (.94, .50), (1.0, .37), (1.0, .22), (.96, .125), (.60, .10), (0, .10)]),       # front corners
 (-1.38, 0.00, [(0, .645), (.44, .655), (.72, .775), (.975, .805), (1.03, .60), (1.03, .23), (.97, .125), (.60, .10), (0, .10)]),   # front axle
 (-0.92, 0.00, [(0, .79), (.56, .80), (.84, .825), (.99, .80), (1.01, .57), (1.0, .23), (.96, .125), (.60, .10), (0, .10)]),   # base of the windscreen
 (-0.02, 0.00, [(0, 1.115), (.46, 1.095), (.86, .835), (.99, .79), (.985, .57), (.97, .23), (.96, .125), (.60, .10), (0, .10)]), # top of the windscreen
 ( 0.72, 0.00, [(0, 1.085), (.44, 1.055), (.88, .865), (1.0, .82), (.90, .62), (.89, .27), (.96, .125), (.60, .10), (0, .10)]),  # back of the cabin, where the side tucks in for the intake
 ( 1.30, 0.00, [(0, .965), (.40, .945), (.84, .93), (1.03, .92), (1.06, .66), (1.06, .27), (.99, .135), (.60, .12), (0, .12)]), # rear axle
 ( 1.98, 0.00, [(0, .845), (.38, .85), (.82, .87), (1.0, .835), (1.02, .64), (1.0, .44), (.94, .26), (.60, .22), (0, .22)]),    # tail top
 ( 2.30, 0.00, [(0, .855), (.38, .86), (.80, .865), (.95, .81), (.96, .62), (.95, .46), (.90, .32), (.60, .30), (0, .30)]),        # tail end
]
NP = 9
def pt(st, i, side=1):
    y, sw, ps = st; x, z = ps[i]; return Vector((side * x, y + sw * x ** 1.5, z))

bm = bmesh.new(); V = {}
for s, st in enumerate(ST):
    for i in range(NP):
        V[(s, i, 1)] = bm.verts.new(pt(st, i))
        V[(s, i, -1)] = V[(s, i, 1)] if st[2][i][0] == 0 else bm.verts.new(pt(st, i, -1))
def face(vs, mat, flip=False):
    vs = list(dict.fromkeys(vs))
    if len(vs) < 3: return
    f = bm.faces.new(vs[::-1] if flip else vs); f.material_index = mat
def strip_mat(s, i):                                   # which material a panel between two slices carries
    if i == 0 and 3 <= s <= 6: return 1                # the glass canopy runs from the windscreen to the tail
    if i == 1 and 3 <= s <= 4: return 1                # side windows
    if i >= 5: return 2                                # sills and floor are black
    if i == 4 and s == 5: return 2                     # the side intake ahead of the rear wheel
    return 0
for s in range(len(ST) - 1):
    for i in range(NP - 1):
        m = strip_mat(s, i)
        face([V[(s, i, 1)], V[(s + 1, i, 1)], V[(s + 1, i + 1, 1)], V[(s, i + 1, 1)]], m)
        face([V[(s, i, -1)], V[(s + 1, i, -1)], V[(s + 1, i + 1, -1)], V[(s, i + 1, -1)]], m, flip=True)
for s, flip in ((0, True), (len(ST) - 1, False)):      # close the nose and the tail
    ring = [V[(s, i, 1)] for i in range(NP)] + [V[(s, i, -1)] for i in range(NP - 2, 0, -1)]
    f = bm.faces.new(ring[::-1] if flip else ring); f.material_index = 2
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
# character lines: these edges stay sharp when the surface is smoothed
cr = bm.edges.layers.float.new('crease_edge'); bm.edges.ensure_lookup_table()
def crease(a, b, w):
    e = bm.edges.get((a, b))
    if e: e[cr] = max(e[cr], w)
LINES = {1: 1.0, 2: 0.45, 3: 0.95, 4: 0.8, 5: 0.85, 6: 0.9}     # glass edge, fender crest, side line, sill top, sill bottom
for s in range(len(ST) - 1):
    for side in (1, -1):
        for i, w in LINES.items(): crease(V[(s, i, side)], V[(s + 1, i, side)], w if not (i == 1 and s < 3) else 0.25)
for s, w in ((0, 1.0), (len(ST) - 1, 1.0), (3, 0.8), (4, 0.6), (5, 0.9), (6, 0.5)):  # the nose and tail faces, and the base of the windscreen
    for side in (1, -1):
        for i in range(NP - 1):
            if s in (3, 4) and i > 1: continue
            if s in (5, 6) and i not in (3, 4): continue
            crease(V[(s, i, side)], V[(s, i + 1, side)], w)
me = bpy.data.meshes.new('Body'); bm.to_mesh(me); bm.free()
for m in MATS: me.materials.append(m)
body = bpy.data.objects.new('Body', me); bpy.context.scene.collection.objects.link(body)
bpy.context.view_layer.objects.active = body
sub = body.modifiers.new('smooth', 'SUBSURF'); sub.levels = 4; sub.render_levels = 4; bpy.ops.object.modifier_apply(modifier=sub.name)
for p in body.data.polygons: p.use_smooth = True
body.data.set_sharp_from_angle(angle=math.radians(32))

def add(obj): bpy.context.scene.collection.objects.link(obj); return obj
def cylinder(name, r, depth, loc, mat, segs=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc, rotation=(0, math.pi / 2, 0)); o = bpy.context.object; o.name = name
    if mat: o.data.materials.append(mat)
    return o
AX = [(-1.38, 0.33), (1.30, 0.365)]                    # axles: (y, wheel radius)
for k, (y, r) in enumerate(AX):                         # wheel arches cut out of the body
    for side in (1, -1):
        c = cylinder(f'ArchCut{k}{side}', r + 0.04, 0.50, (side * 0.96, y, r), M_black, segs=48)
        mod = body.modifiers.new('arch', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = c; mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'
        bpy.context.view_layer.objects.active = body; bpy.ops.object.modifier_apply(modifier=mod.name); bpy.data.objects.remove(c)
for k, (y, r) in enumerate(AX):                         # wheels: closed turbine discs with a thin ring of light
    for side in (1, -1):
        x = side * (0.845 if k == 0 else 0.875)
        cylinder(f'Tyre{k}{side}', r, 0.30, (x, y, r), M_tyre)
        cylinder(f'Rim{k}{side}', r * 0.76, 0.31, (x, y, r), M_rim, segs=48)
        cylinder(f'Hub{k}{side}', r * 0.2, 0.33, (x, y, r), M_black, segs=24)
        for q in range(12):                                # turbine fins on the closed disc
            ang = 2 * math.pi * q / 12
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x + side * 0.153, y + math.cos(ang) * r * 0.44, r + math.sin(ang) * r * 0.44)); f = bpy.context.object; f.name = f'Fin{k}{side}{q}'
            f.scale = (0.012, r * 0.40, 0.012); f.rotation_euler = (ang + 0.5 * side, 0, 0); f.data.materials.append(M_black)
        bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.69, minor_radius=0.006, location=(x + side * 0.156, y, r), rotation=(0, math.pi / 2, 0)); t = bpy.context.object; t.name = f'Ring{k}{side}'; t.data.materials.append(M_ring)

def blade(name, s, i0, zt, zb, dy):                     # a thin blade of light across the full width of the nose or the tail
    xs = []; n = 24
    y0, sw, ps = ST[s]; xm = ps[i0][0]
    verts, faces = [], []
    for j in range(n + 1):
        x = -xm + 2 * xm * j / n; y = y0 + sw * abs(x) ** 1.5 + dy
        verts += [(x, y, zt), (x, y, zb)]
    for j in range(n): a = j * 2; faces.append((a, a + 2, a + 3, a + 1))
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces); o = add(bpy.data.objects.new(name, m)); o.data.materials.append(M_blade); return o
blade('BladeFront', 0, 3, 0.285, 0.268, -0.004)
blade('BladeRear', len(ST) - 1, 3, 0.70, 0.674, 0.012)

for q in range(-3, 4):                                   # diffuser fins under the tail
    bpy.ops.mesh.primitive_cube_add(size=1, location=(q * 0.2, 2.11, 0.245)); f = bpy.context.object; f.name = f'Diffuser{q}'; f.scale = (0.012, 0.40, 0.13); f.data.materials.append(M_black)
root = bpy.data.objects.new('Car', None); add(root)
for o in list(bpy.context.scene.collection.objects):
    if o is not root and o.parent is None: o.parent = root
if not TAG: bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'car.blend'))
if not TAG: bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, 'car.glb'), export_format='GLB', export_yup=True, export_apply=True)

if '--render' in sys.argv:
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 72; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720; sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.82, 0.84, 0.9, 1); bg.inputs['Strength'].default_value = 0.3
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0)); floor = bpy.context.object; floor.is_shadow_catcher = True
    def area(name, loc, size, watts, col=(1, 1, 1)):
        L = bpy.data.lights.new(name, 'AREA'); L.size = size; L.energy = watts; L.color = col; o = add(bpy.data.objects.new(name, L)); o.location = loc
        o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
    area('Top', (0, 0, 7), 8, 330); area('Left', (-7, -3, 3), 5, 260); area('Right', (7, 2, 2.5), 5, 110); area('Back', (0, 8, 3), 5, 130)
    cam = bpy.data.cameras.new('cam'); cam.lens = 52; co = add(bpy.data.objects.new('cam', cam)); sc.camera = co
    views = {'front34': (-5.4, -7.6, 2.3), 'side': (11.5, 0, 1.0), 'rear34': (5.6, 7.6, 2.5), 'front': (0, -11, 1.1), 'rear': (0, 11, 1.2), 'top': (0, 0, 13)}
    LENS = {'front34': 64, 'side': 74, 'rear34': 64, 'front': 125, 'rear': 118, 'top': 84}
    only = [a for a in sys.argv if a in views]
    for name, loc in views.items():
        if only and name not in only: continue
        co.location = loc; cam.lens = LENS[name]; co.rotation_euler = (0, 0, math.pi / 2) if name == 'top' else (Vector((0, 0, 0.5)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(HERE, f'check-{name}{TAG}.png'); bpy.ops.render.render(write_still=True)
