"""Builds our own electric car in Blender: one smooth pearl body, a dark glass canopy, wheels ringed with light and a thin blade of light
across the nose and tail, in the colours of our character's line. Run with --render for studio views; set CUT=1 for cut-outs on a clear background.
Coordinates: metres; the nose points along -Y, Z is up, the ground is z = 0."""
import bpy, bmesh, math, os, sys
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
PAINT = tuple(float(v) for v in os.environ.get('PAINT', '0.84,0.85,0.90').split(',')); TAG = os.environ.get('TAG', ''); CUT = os.environ.get('CUT') == '1'
CYAN, BLUE, VIOLET, PINK, ORANGE = (0.10, 0.80, 1.0), (0.16, 0.36, 1.0), (0.50, 0.22, 1.0), (1.0, 0.16, 0.50), (1.0, 0.40, 0.12)

def material(name, col, rough=0.3, metal=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.03
    return m
def neon(name, axis, lo, hi, stops, strength):                      # light whose colour runs along one direction of the part it is on
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0, 0, 0, 1)
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Object'], sep.inputs[0]); nt.links.new(sep.outputs[axis], mr.inputs[0]); mr.inputs[1].default_value = lo; mr.inputs[2].default_value = hi
    nt.links.new(mr.outputs[0], ramp.inputs[0]); els = ramp.color_ramp.elements
    while len(els) < len(stops): els.new(0.5)
    for e, (p, c) in zip(els, stops): e.position = p; e.color = (*c, 1)
    nt.links.new(ramp.outputs[0], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = strength
    return m
M_paint = material('paint', PAINT, rough=0.22, metal=0.1, coat=1.0)
M_glass = material('glass', (0.022, 0.01, 0.05), rough=0.03, coat=1.0)
M_black = material('black', (0.016, 0.016, 0.02), rough=0.4)
M_tyre = material('tyre', (0.012, 0.012, 0.014), rough=0.8)
M_disc = material('disc', (0.006, 0.006, 0.01), rough=0.35)
M_seam = material('seam', (0.30, 0.31, 0.36), rough=0.5)
M_blade = neon('blade', 0, -0.85, 0.85, [(0.0, CYAN), (0.3, BLUE), (0.55, VIOLET), (0.8, PINK), (1.0, ORANGE)], 4.2)
M_ring = neon('ring', 0, -0.36, 0.36, [(0.0, PINK), (0.5, VIOLET), (1.0, CYAN)], 4.2)        # pink at the foot of the wheel, cyan at the top
M_under = neon('under', 1, -1.9, 1.9, [(0.0, BLUE), (0.5, VIOLET), (1.0, PINK)], 7.0)
MATS = [M_paint, M_glass, M_black]

# Slices across the car, nose to tail: (y, sweep, [(x, z) x 9]) from the centre of the roof, round the side, to the centre of the floor.
# Points: 0 roof centre, 1 upper glass, 2 foot of the glass, 3 fender crest, 4 side, 5 lower side, 6 sill, 7 underside, 8 floor centre.
ST = [
 (-2.27, 0.00, [(0, .37), (.12, .37), (.24, .365), (.33, .35), (.37, .31), (.37, .26), (.33, .21), (.20, .195), (0, .195)]),      # tip of the nose
 (-2.18, 0.28, [(0, .41), (.30, .41), (.55, .43), (.74, .43), (.82, .35), (.82, .24), (.76, .15), (.50, .12), (0, .12)]),      # nose
 (-1.93, 0.08, [(0, .47), (.36, .48), (.62, .62), (.90, .68), (1.0, .46), (1.0, .28), (.94, .14), (.60, .11), (0, .11)]),
 (-1.40, 0.00, [(0, .55), (.36, .57), (.64, .89), (.93, .94), (1.04, .66), (1.04, .34), (.96, .14), (.60, .11), (0, .11)]),      # front wheels, under two tall fenders
 (-0.80, 0.00, [(0, .67), (.52, .67), (.80, .76), (.97, .735), (1.0, .56), (.98, .30), (.94, .14), (.60, .11), (0, .11)]),       # where the glass begins
 ( 0.00, 0.00, [(0, 1.12), (.52, 1.06), (.86, .79), (.98, .71), (.98, .52), (.96, .28), (.94, .14), (.60, .11), (0, .11)]),      # top of the roof
 ( 0.75, 0.00, [(0, 1.09), (.50, 1.03), (.87, .83), (1.0, .75), (.97, .54), (.95, .30), (.95, .14), (.60, .11), (0, .11)]),
 ( 1.35, 0.00, [(0, .96), (.44, .92), (.83, .92), (1.02, .91), (1.06, .66), (1.06, .36), (.98, .15), (.60, .12), (0, .12)]),     # rear wheels
 ( 1.92, 0.00, [(0, .79), (.34, .775), (.70, .77), (.92, .73), (.97, .57), (.95, .39), (.88, .22), (.55, .18), (0, .18)]),
 ( 2.20, 0.18, [(0, .63), (.26, .62), (.52, .61), (.70, .58), (.74, .49), (.73, .39), (.66, .29), (.40, .255), (0, .255)]),     # tail
 ( 2.31, 0.00, [(0, .51), (.10, .51), (.20, .505), (.28, .49), (.30, .46), (.30, .43), (.27, .40), (.16, .39), (0, .39)]),      # tip of the tail
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
def strip_mat(s, i):
    if i <= 1 and 4 <= s <= 7: return 1                 # one glass canopy over the cabin, running back toward the tail
    if i >= 6 and 2 <= s <= 7: return 2                 # the underside is black between the nose and the tail
    return 0
for s in range(len(ST) - 1):
    for i in range(NP - 1):
        m = strip_mat(s, i)
        face([V[(s, i, 1)], V[(s + 1, i, 1)], V[(s + 1, i + 1, 1)], V[(s, i + 1, 1)]], m)
        face([V[(s, i, -1)], V[(s + 1, i, -1)], V[(s + 1, i + 1, -1)], V[(s, i + 1, -1)]], m, flip=True)
for s, flip in ((0, True), (len(ST) - 1, False)):
    ring = [V[(s, i, 1)] for i in range(NP)] + [V[(s, i, -1)] for i in range(NP - 2, 0, -1)]
    f = bm.faces.new(ring[::-1] if flip else ring); f.material_index = 0
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
cr = bm.edges.layers.float.new('crease_edge'); bm.edges.ensure_lookup_table()
def crease(a, b, w):
    e = bm.edges.get((a, b))
    if e: e[cr] = max(e[cr], w)
for s in range(len(ST) - 1):                            # only the sill and the edge of the glass are kept crisp; everything else flows
    for side in (1, -1):
        crease(V[(s, 6, side)], V[(s + 1, 6, side)], 0.7); crease(V[(s, 7, side)], V[(s + 1, 7, side)], 0.5)
        if 4 <= s <= 7: crease(V[(s, 2, side)], V[(s + 1, 2, side)], 0.55)
for s in (4, 8):
    for side in (1, -1):
        for i in range(2): crease(V[(s, i, side)], V[(s, i + 1, side)], 0.5)
me = bpy.data.meshes.new('Body'); bm.to_mesh(me); bm.free()
for m in MATS: me.materials.append(m)
body = bpy.data.objects.new('Body', me); bpy.context.scene.collection.objects.link(body)
bpy.context.view_layer.objects.active = body
sub = body.modifiers.new('smooth', 'SUBSURF'); sub.levels = 4; sub.render_levels = 4; bpy.ops.object.modifier_apply(modifier=sub.name)
for p in body.data.polygons: p.use_smooth = True
body.data.set_sharp_from_angle(angle=math.radians(40))

def add(obj): bpy.context.scene.collection.objects.link(obj); return obj
def activate(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
# a skin a hair outside the body: thin slices of it become the light blades and the door lines
shell = body.copy(); shell.data = body.data.copy(); add(shell); activate(shell)
d = shell.modifiers.new('out', 'DISPLACE'); d.strength = 0.005; d.mid_level = 0.0; bpy.ops.object.modifier_apply(modifier=d.name)
def slice_of_shell(name, centre, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=centre); c = bpy.context.object; c.name = name; c.scale = size; bpy.ops.object.transform_apply(scale=True)
    mod = c.modifiers.new('cut', 'BOOLEAN'); mod.operation = 'INTERSECT'; mod.object = shell; mod.solver = 'EXACT'; bpy.ops.object.modifier_apply(modifier=mod.name)
    c.data.materials.clear(); c.data.materials.append(mat)
    for p in c.data.polygons: p.material_index = 0
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS'); return c
slice_of_shell('BladeFront', (0, -2.1, 0.33), (2.4, 0.56, 0.016), M_blade)
slice_of_shell('BladeRear', (0, 2.12, 0.50), (2.4, 0.50, 0.018), M_blade)
for side in (1, -1):
    slice_of_shell(f'DoorFront{side}', (side * 0.95, -0.62, 0.47), (0.6, 0.006, 0.56), M_seam)
    slice_of_shell(f'DoorRear{side}', (side * 0.95, 0.62, 0.47), (0.6, 0.006, 0.56), M_seam)
    slice_of_shell(f'DoorSill{side}', (side * 0.95, 0.0, 0.215), (0.6, 1.24, 0.006), M_seam)
bpy.data.objects.remove(shell)

def cylinder(name, r, depth, loc, mat, segs=72):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=depth, location=loc, rotation=(0, math.pi / 2, 0)); o = bpy.context.object; o.name = name
    if mat: o.data.materials.append(mat)
    return o
AX = [(-1.40, 0.375), (1.35, 0.395)]                    # axles: (y, wheel radius). Big wheels, as on a show car
for k, (y, r) in enumerate(AX):
    for side in (1, -1):
        c = cylinder(f'ArchCut{k}{side}', r + 0.03, 0.50, (side * 0.985, y, r), M_black, segs=64)
        activate(body); mod = body.modifiers.new('arch', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = c; mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'
        bpy.ops.object.modifier_apply(modifier=mod.name); bpy.data.objects.remove(c)
for k, (y, r) in enumerate(AX):                         # wheels: a dark glossy disc with one ring of light
    for side in (1, -1):
        x = side * 0.875
        cylinder(f'Tyre{k}{side}', r, 0.30, (x, y, r), M_tyre)
        cylinder(f'Disc{k}{side}', r * 0.80, 0.305, (x, y, r), M_disc)
        cylinder(f'Hub{k}{side}', r * 0.16, 0.32, (x, y, r), M_black, segs=32)
        bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.80, minor_radius=0.016, major_segments=96, location=(x + side * 0.152, y, r), rotation=(0, math.pi / 2, 0)); t = bpy.context.object; t.name = f'Ring{k}{side}'; t.data.materials.append(M_ring)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.06)); ug = bpy.context.object; ug.name = 'Underglow'; ug.scale = (1.3, 3.5, 1); bpy.ops.object.transform_apply(scale=True); ug.data.materials.append(M_under); ug.visible_camera = False; ug.visible_glossy = False   # only its glow on the floor is seen

root = bpy.data.objects.new('Car', None); add(root)
for o in list(bpy.context.scene.collection.objects):
    if o is not root and o.parent is None: o.parent = root
if not TAG and not CUT:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'car.blend'))
    bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, 'car.glb'), export_format='GLB', export_yup=True, export_apply=True)

if '--render' in sys.argv:
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900; sc.render.film_transparent = CUT; sc.view_settings.view_transform = 'Standard'
    # a soft dusk studio: lavender on one side, peach on the other. The car and the floor both pick it up
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange'); ramp = nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs[0], mr.inputs[0]); mr.inputs[1].default_value = -1; mr.inputs[2].default_value = 1; nt.links.new(mr.outputs[0], ramp.inputs[0])
    els = ramp.color_ramp.elements; els.new(0.5)
    for e, (p, c) in zip(els, [(0.0, (0.62, 0.52, 0.86)), (0.5, (0.90, 0.62, 0.70)), (1.0, (0.98, 0.78, 0.60))]): e.position = p; e.color = (*c, 1)
    nt.links.new(ramp.outputs[0], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.6
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, 0)); floor = bpy.context.object
    if CUT: floor.is_shadow_catcher = True
    else: floor.data.materials.append(material('floor', (0.80, 0.74, 0.80), rough=0.16, coat=0.6))
    def area(name, loc, size, watts, col=(1, 1, 1)):
        L = bpy.data.lights.new(name, 'AREA'); L.size = size; L.energy = watts; L.color = col; o = add(bpy.data.objects.new(name, L)); o.location = loc
        o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
    area('Top', (0, 0, 6), 7, 170); area('Front', (2, -7, 3), 5, 90); area('Side', (7, 1, 2.5), 5, 70)
    cam = bpy.data.cameras.new('cam'); co = add(bpy.data.objects.new('cam', cam)); sc.camera = co
    views = {'hero': ((4.9, -7.0, 0.95), 62, 0.48), 'front34': ((-5.2, -7.4, 2.0), 62, 0.5), 'side': ((11.5, 0, 0.9), 72, 0.5), 'rear34': ((-5.4, 7.4, 2.1), 62, 0.5),
             'front': ((0, -11, 0.95), 120, 0.5), 'rear': ((0, 11, 1.0), 116, 0.5), 'top': ((0, 0, 13), 82, 0.5)}
    only = [a for a in sys.argv if a in views]
    for name, (loc, lens, look) in views.items():
        if only and name not in only: continue
        co.location = loc; cam.lens = lens; co.rotation_euler = (0, 0, math.pi / 2) if name == 'top' else (Vector((0, 0, look)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(HERE, f"{'cut' if CUT else 'view'}-{name}{TAG}.png"); bpy.ops.render.render(write_still=True)
