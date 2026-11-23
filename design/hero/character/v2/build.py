"""Opsiogen character, version 2: the same glossy white body, with a friendly face instead of the camera lens.
A black visor with cyan eyes and smile, headphone ears with spectrum rings, an orbit ring like the logo's O,
a top light, and floating cartoon hands (light comes from a fingertip).
Run with Blender's Python (free, no account):  pip install bpy pillow fonttools brotli
   python build.py views emotions mouse hero    (renders go to ./out), then  python sheet.py
Concept for approval (23 Nov); the site still uses version 1 (../model/build.py)."""
import bpy, bmesh, math, sys, os
from mathutils import Vector, Euler
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ARGS = sys.argv[1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.context.collection

# ---- brand spectrum (the logo and the site's --gradient-brand)
SPEC = ['#d8fa01', '#01f14c', '#00ecfd', '#01a5e2', '#9b1cf0', '#ff2a1a', '#fe9102', '#feb702']
def hexrgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
def spectrum(t):
    n = len(SPEC); x = (t % 1.0) * n; i = int(x); f = x - i; f = f * f * (3 - 2 * f)
    a, b = hexrgb(SPEC[i % n]), hexrgb(SPEC[(i + 1) % n]); return tuple(a[k] + (b[k] - a[k]) * f for k in range(3))
def lin(c): return tuple(v ** 2.2 for v in c)
CYAN = (0, 236, 253)

def material(name, base=(1, 1, 1), rough=0.5, coat=0.0, emit=None, strength=1.0, vcol=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.04
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    if vcol:
        a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Color'
        nt.links.new(a.outputs['Color'], b.inputs['Base Color']); nt.links.new(a.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = strength
    return m

def mesh_object(name, verts, faces, mat, colors=None, uvs=None, smooth=True):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if colors:
        ca = me.color_attributes.new('Color', 'FLOAT_COLOR', 'POINT')
        for i, c in enumerate(colors): ca.data[i].color = (*c, 1)
        me.color_attributes.active_color = ca
    if uvs:
        uv = me.uv_layers.new(name='UVMap')
        for loop in me.loops: uv.data[loop.index].uv = uvs[loop.vertex_index]
    for p in me.polygons: p.use_smooth = smooth
    ob = bpy.data.objects.new(name, me); col.objects.link(ob); me.materials.append(mat)
    if not uvs:
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    return ob

def lathe(name, profile, mat, axis=(0, 0, 1), n=96):
    """Turn a profile of (distance from the axis, distance along it) round the axis."""
    axis = Vector(axis).normalized(); u = axis.orthogonal().normalized(); v = axis.cross(u); verts, faces = [], []
    for r, h in profile:
        for k in range(n): t = 2 * math.pi * k / n; verts.append(tuple(axis * h + r * (math.cos(t) * u + math.sin(t) * v)))
    for i in range(len(profile) - 1):
        for k in range(n): a, b = i * n + k, i * n + (k + 1) % n; faces.append((a, b, b + n, a + n))
    return mesh_object(name, verts, faces, mat)

def torus(name, R, w, t, mat, axis=(0, 0, 1), n=256, m=16, colors=None, twist=0.0):
    """A ring round the axis: R its radius, w and t the half width and half thickness of its section."""
    axis = Vector(axis).normalized(); u = axis.orthogonal().normalized(); v = axis.cross(u); verts, faces, cols = [], [], []
    for i in range(n):
        a = 2 * math.pi * i / n; out = math.cos(a) * u + math.sin(a) * v; tw = twist * a
        for j in range(m):
            b = 2 * math.pi * j / m; x, y = w * math.cos(b), t * math.sin(b)
            x, y = x * math.cos(tw) - y * math.sin(tw), x * math.sin(tw) + y * math.cos(tw)
            verts.append(tuple(out * (R + x) + axis * y))
            if colors: cols.append(lin(colors(i / n)))
    for i in range(n):
        for j in range(m): a, b = i * m + j, i * m + (j + 1) % m; faces.append((a, b, ((i + 1) % n) * m + (j + 1) % m, ((i + 1) % n) * m + j))
    return mesh_object(name, verts, faces, mat, colors=cols or None)

# ---- materials
M_body = material('body', (0.95, 0.955, 0.97), rough=0.16, coat=1.0)
M_visor = material('visor', (0.004, 0.005, 0.008), rough=0.35, coat=0.75)
M_ring = material('ring', rough=0.18, coat=1.0, vcol=True, strength=0.9)
M_ear = material('earRing', rough=0.3, vcol=True, strength=2.6)
M_bulb = material('bulb', (0.1, 0.8, 1.0), rough=0.2, emit=(0.0, 0.75, 1.0), strength=1.3)
M_glow = material('trail', rough=0.5, vcol=True, strength=6)
M_halo = material('halo', rough=1.0, vcol=True, strength=2.2); M_halo.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.16
M_tipHalo = material('tipHalo', (1, 1, 1), emit=(0.6, 0.95, 1.0), strength=3); M_tipHalo.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.22
M_tip = material('tip', (1, 1, 1), emit=(0.8, 0.98, 1.0), strength=18)

# ---- the face, drawn as light on the visor (the web page will draw the same shapes live)
W, H, SS = 1200, 800, 2                                          # the visor is 1.5 times wider than tall; drawn at twice the size, then reduced
def face_image(kind):
    im = Image.new('L', (W * SS, H * SS), 0); d = ImageDraw.Draw(im)
    def P(x, y): return (x * SS, y * SS)
    def pill(cx, cy, w, h): d.rounded_rectangle((*P(cx - w / 2, cy - h / 2), *P(cx + w / 2, cy + h / 2)), radius=w / 2 * SS, fill=255)
    def dot(cx, cy, r): d.ellipse((*P(cx - r, cy - r), *P(cx + r, cy + r)), fill=255)
    def arc(cx, cy, rx, ry, a0, a1, w):                          # a stroke along an ellipse, with round ends
        pts = [(cx + rx * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 60 for i in range(61)]]
        d.line([P(*p) for p in pts], fill=255, width=round(w * SS), joint='curve')
        for p in (pts[0], pts[-1]): dot(*p, w / 2)
    def ring(cx, cy, r, w): d.ellipse((*P(cx - r, cy - r), *P(cx + r, cy + r)), outline=255, width=round(w * SS))
    def star(cx, cy, r):                                         # a four-point sparkle
        pts = []
        for k in range(8):
            a = math.pi / 4 * k - math.pi / 2; rr = r if k % 2 == 0 else r * 0.3; pts.append(P(cx + rr * math.cos(a), cy + rr * math.sin(a)))
        d.polygon(pts, fill=255)
    L, R, EY = 600 - 215, 600 + 215, 320
    if kind == 'neutral':
        pill(L, EY, 112, 200); pill(R, EY, 112, 200); arc(600, 500, 150, 92, 25, 155, 32)
    elif kind == 'happy':
        arc(L, EY + 34, 68, 62, 200, 340, 38); arc(R, EY + 34, 68, 62, 200, 340, 38)
        d.chord((*P(600 - 140, 400), *P(600 + 140, 600)), 0, 180, fill=255)
    elif kind == 'wink':
        pill(L, EY, 112, 200); arc(R, EY + 34, 68, 62, 200, 340, 38); arc(612, 500, 150, 92, 18, 150, 32); star(R + 100, EY - 110, 34)
    elif kind in ('lookL', 'lookR'):
        dx = -46 if kind == 'lookL' else 46; pill(L + dx, EY - 8, 112, 200); pill(R + dx, EY - 8, 112, 200); arc(600 + dx * 0.6, 500, 150, 92, 25, 155, 32)
    elif kind == 'surprised':
        dot(L, EY, 70); dot(R, EY, 70); ring(600, 560, 44, 22)
    elif kind == 'thinking':
        pill(L + 34, EY - 22, 92, 150); pill(R + 34, EY - 22, 92, 122); d.line((*P(600, 540), *P(706, 524)), fill=255, width=26 * SS); dot(600, 540, 13); dot(706, 524, 13)
        for k in range(3): dot(855 + k * 52, 150 - k * 30, 11 + k * 3)
    elif kind == 'idea':
        star(L, EY, 96); star(R, EY, 96); d.chord((*P(600 - 120, 420), *P(600 + 120, 600)), 0, 180, fill=255)
    elif kind == 'cool':                                         # shades, and a smile to one side
        for cx in (L, R):
            d.rounded_rectangle((*P(cx - 118, EY - 52), *P(cx + 118, EY + 62)), radius=46 * SS, fill=255)
            d.rectangle((*P(cx - 118, EY - 52), *P(cx + 118, EY - 6)), fill=255)
            d.line((*P(cx - 64, EY + 46), *P(cx + 4, EY - 30)), fill=0, width=14 * SS)
        d.rectangle((*P(L + 110, EY - 52), *P(R - 110, EY - 28)), fill=255)
        arc(640, 470, 100, 60, 20, 120, 24)
    im = im.resize((W, H), Image.LANCZOS)
    core = im.filter(ImageFilter.MinFilter(7)); glow = im.filter(ImageFilter.GaussianBlur(16)).point(lambda v: min(255, int(v * 1.25)))
    rgb = [Image.merge('RGB', [m.point(lambda v, k=k: int(v * k / 255)) for k in col_]) for m, col_ in ((glow, CYAN), (im, CYAN), (core, (150, 120, 60)))]
    out = ImageChops.add(ImageChops.add(rgb[0], rgb[1]), rgb[2])
    path = os.path.join(OUT, 'face-' + kind + '.png'); out.save(path); return path

face_tex = M_visor.node_tree.nodes.new('ShaderNodeTexImage')
M_visor.node_tree.links.new(face_tex.outputs['Color'], M_visor.node_tree.nodes['Principled BSDF'].inputs['Emission Color'])
M_visor.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 3.2
def set_face(kind):
    face_tex.image = bpy.data.images.load(face_image(kind), check_existing=True)
    idea = kind == 'idea'
    M_bulb.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = (1.0, 0.6, 0.05, 1) if idea else (0.0, 0.75, 1.0, 1)
    M_bulb.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.4 if idea else 1.3
    M_bulb.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (1.0, 0.8, 0.2, 1) if idea else (0.1, 0.8, 1.0, 1)
    bulb_light.data.color = (1.0, 0.7, 0.25) if idea else (0.5, 0.9, 1.0); bulb_light.data.energy = 14 if idea else 3

# ---- the body: the same glossy white ball
bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=1.0); body = bpy.context.object; body.name = 'Body'; body.data.materials.append(M_body)
for p in body.data.polygons: p.use_smooth = True

# ---- the visor: a rounded rectangle as seen from the front, laid on the ball and standing just proud of it
VA, VB, VZ, VN = 0.70, 0.467, 0.05, 4.2
def boundary(th):
    c, s = math.cos(th), math.sin(th); return VA * math.copysign(abs(c) ** (2 / VN), c), VB * math.copysign(abs(s) ** (2 / VN), s)
def on_ball(x, z, r): return (x, -math.sqrt(max(r * r - x * x - z * z, 1e-6)), z)
rings = [(k / 28, 1.016) for k in range(1, 29)] + [(1.006, 1.012), (1.011, 1.004), (1.014, 0.99)]   # out to the edge, then a soft rounded edge down into the ball
M_ = 160; verts, faces, uvs = [on_ball(0, VZ, 1.016)], [], [(0.5, 0.5)]
for f, r in rings:
    for j in range(M_):
        bx, bz = boundary(2 * math.pi * j / M_); x, z = f * bx, VZ + f * bz
        verts.append(on_ball(x, z, r)); uvs.append((0.5 + x / (2 * VA), 0.5 + (z - VZ) / (2 * VB)))
for j in range(M_): faces.append((0, 1 + j, 1 + (j + 1) % M_))
for i in range(len(rings) - 1):
    for j in range(M_): a, b = 1 + i * M_ + j, 1 + i * M_ + (j + 1) % M_; faces.append((a, a + M_, b + M_, b))
visor = mesh_object('Visor', verts, faces, M_visor, uvs=uvs)

# ---- the ears: headphone cups, each with a spectrum ring light
for side in (1, -1):
    ax = (side, 0, 0.0)
    lathe('Ear' + ('L' if side > 0 else 'R'), [(0.345, 0.86), (0.345, 1.0), (0.338, 1.032), (0.318, 1.054), (0.28, 1.064), (0.12, 1.07), (0.0, 1.071)], M_body, axis=ax)
    torus('EarRing' + ('L' if side > 0 else 'R'), 0.225, 0.026, 0.012, M_ear, axis=ax, n=128, m=10, colors=lambda t, s=side: spectrum(t * 1.0 + (0.3 if s > 0 else 0.8)))
    for ob in (bpy.data.objects['Ear' + ('L' if side > 0 else 'R')], bpy.data.objects['EarRing' + ('L' if side > 0 else 'R')]):
        if ob.name.startswith('EarRing'): ob.location = (side * 1.068, 0, 0)

# ---- the top light: a short stem with a glowing bulb, leaning back a little
lean = Euler((math.radians(-14), 0, 0))
top = [lathe('TopBase', [(0.12, 0.96), (0.12, 1.01), (0.105, 1.03), (0.06, 1.04), (0.0, 1.042)], M_body), lathe('TopStem', [(0.028, 1.03), (0.028, 1.15), (0.0, 1.15)], M_body)]
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.105, location=(0, 0, 1.24)); bulb = bpy.context.object; bulb.name = 'TopBulb'; bulb.data.materials.append(M_bulb)
for p in bulb.data.polygons: p.use_smooth = True
bulb_light = bpy.data.objects.new('BulbLight', bpy.data.lights.new('BulbLight', 'POINT')); col.objects.link(bulb_light); bulb_light.location = (0, 0, 1.24); bulb_light.data.shadow_soft_size = 0.08
for ob in top + [bulb, bulb_light]:
    ob.location = lean.to_matrix() @ Vector(ob.location); ob.rotation_euler = lean

# ---- the orbit ring: the logo's O, round the body
orbit = torus('Orbit', 1.34, 0.058, 0.022, M_ring, n=320, m=18, colors=lambda t: spectrum(t), twist=0.5)
orbit.rotation_euler = (math.radians(25), math.radians(-8), 0)

# ---- hands: soft cartoon gloves, floating (no arms). Made from metaballs, then turned into meshes.
def hand(name, pose, side):
    """Palm at the origin, fingers along +Z, palm facing -Y (the front). side +1 is the character's left hand."""
    mb = bpy.data.metaballs.new(name); mb.resolution = 0.0065; mb.render_resolution = 0.0065; mb.threshold = 0.6
    ob = bpy.data.objects.new(name, mb); col.objects.link(ob)
    def el(kind, co, r, d=None, half=0.0, stiff=2.0, sx=1, sy=1, sz=1):
        e = mb.elements.new(); e.type = kind; e.co = co; e.radius = r; e.stiffness = stiff
        if kind == 'CAPSULE': e.size_x = half; e.rotation = Vector((1, 0, 0)).rotation_difference(Vector(d).normalized())
        if kind == 'ELLIPSOID': e.size_x, e.size_y, e.size_z = sx, sy, sz
        return e
    el('ELLIPSOID', (0, 0, 0), 0.16, sx=0.95, sy=0.55, sz=0.85)
    th = -side                                                   # the thumb is on the side toward the body's middle
    fingers = [(-0.062, 0.0), (0.0, 0.0), (0.062, 0.0)]          # three fingers and a thumb, cartoon style
    for k, (ox, _) in enumerate(fingers):
        spread = math.radians((k - 1) * 9)
        dirv = Vector((math.sin(spread), 0, math.cos(spread)))
        if pose == 'point' and k != 1:                           # the other fingers curl in toward the palm
            el('CAPSULE', (ox, -0.03, 0.085), 0.055, d=(0, -1, 0.35), half=0.02)
        elif pose == 'relaxed':
            base = Vector((ox, 0, 0.09)); a = base + dirv * 0.06; b = a + Vector((dirv.x, -0.55, 0.8)).normalized() * 0.06
            el('CAPSULE', tuple((base + a) / 2), 0.05, d=a - base, half=0.035); el('CAPSULE', tuple((a + b) / 2), 0.048, d=b - a, half=0.03)
        else:
            L = 0.135 if k == 1 else 0.115
            if pose == 'point': L = 0.205
            base = Vector((ox, 0, 0.09)); tip = base + dirv * L
            el('CAPSULE', tuple((base + tip) / 2), 0.052, d=tip - base, half=L / 2)
    tb = Vector((th * 0.085, -0.01, -0.01)); tt = tb + Vector((th * 0.75, -0.25, 0.6)).normalized() * (0.07 if pose == 'point' else 0.095)
    el('CAPSULE', tuple((tb + tt) / 2), 0.05, d=tt - tb, half=(tt - tb).length / 2)
    dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.data.objects.remove(ob); bpy.data.metaballs.remove(mb)
    hob = bpy.data.objects.new(name + 'Mesh', me); col.objects.link(hob); me.materials.append(M_body)
    for p in me.polygons: p.use_smooth = True
    return hob

root = bpy.data.objects.new('Character', None); col.objects.link(root)

def place(ob, loc, rot, s=1.45):
    ob.location = loc; ob.rotation_euler = Euler(tuple(math.radians(a) for a in rot)); ob.scale = (s, s, s); ob.parent = root

for ob in list(col.objects):
    if ob is not root and ob.parent is None and ob.type in ('MESH', 'LIGHT'): ob.parent = root

def fingertip(hob):                                               # the point of the index finger, in world space
    mw = hob.matrix_world; tip = max(hob.data.vertices, key=lambda v: v.co.z); return mw @ tip.co

def trail(points, radius_fn, name='Trail', mat=None):
    """A light stroke through the points, in the brand spectrum, thin at both ends."""
    from mathutils import geometry
    n = 8; verts, faces, cols = [], [], []; m = len(points)
    for i, p in enumerate(points):
        t = (points[min(i + 1, m - 1)] - points[max(i - 1, 0)]).normalized(); s = t.orthogonal().normalized(); u = t.cross(s); r = radius_fn(i / (m - 1))
        for k in range(n): a = 2 * math.pi * k / n; verts.append(tuple(p + r * (math.cos(a) * s + math.sin(a) * u))); cols.append(lin(spectrum(0.25 + 0.75 * i / (m - 1))))
    for i in range(m - 1):
        for k in range(n): a, b = i * n + k, i * n + (k + 1) % n; faces.append((a, b, b + n, a + n))
    return mesh_object(name, verts, faces, mat or M_glow, colors=cols)

# ---- studio and renders
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = True
sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'; sc.cycles.max_bounces = 6
cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); col.objects.link(cam); sc.camera = cam
cam.data.type = 'ORTHO'
def aim(scale, elev=7, target=(0, 0, 0)):
    cam.data.ortho_scale = scale; e = math.radians(elev); tgt = Vector(target)
    cam.location = tgt + Vector((0, -8 * math.cos(e), 8 * math.sin(e))); cam.rotation_euler = (math.pi / 2 - e, 0, 0)
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; nt = w.node_tree
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange'); ramp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], mr.inputs['Value']); mr.inputs['From Min'].default_value = -1; nt.links.new(mr.outputs['Result'], ramp.inputs['Fac'])
ramp.color_ramp.elements[0].color = (0.30, 0.32, 0.38, 1); ramp.color_ramp.elements[1].color = (0.95, 0.96, 1.0, 1)
nt.links.new(ramp.outputs['Color'], nt.nodes['Background'].inputs['Color']); nt.nodes['Background'].inputs['Strength'].default_value = 0.55
def light(name, loc, size, energy, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, 'AREA'); l.size = size; l.energy = energy; l.color = color; o = bpy.data.objects.new(name, l); col.objects.link(o)
    o.location = loc; o.rotation_euler = Vector(loc).to_track_quat('Z', 'Y').to_euler()
light('Key', (-3.5, -4.5, 4.5), 4, 260); light('Fill', (4.5, -3.5, 1), 4, 70); light('Rim', (2, 4, 3), 3, 120)
light('Blue', (-2, -1.5, -3.5), 2.5, 70, (0.3, 0.5, 1)); light('Pink', (2, -1.5, -3.5), 2.5, 70, (1, 0.35, 0.75))

def render(path, res, samples):
    sc.render.resolution_x = sc.render.resolution_y = res; sc.cycles.samples = samples; sc.render.filepath = path; bpy.ops.render.render(write_still=True); print('rendered', path)

# Hands for the turnaround: relaxed, low at the sides, a little in front
hl = hand('HandL', 'relaxed', 1); hr = hand('HandR', 'relaxed', -1)
place(hl, (1.2, -0.42, -0.6), (8, 18, 12), 1.7); place(hr, (-1.2, -0.42, -0.6), (8, -18, -12), 1.7)

if 'test' in ARGS:
    set_face('neutral'); aim(3.4)
    for name, deg in [('front', 0), ('tq', 35)]:
        root.rotation_euler = (0, 0, math.radians(deg)); render(os.path.join(OUT, 'test-' + name + '.png'), 420, 16)
if 'views' in ARGS:
    set_face('neutral'); aim(3.6)
    for name, deg in [('front', 0), ('threequarter', 35), ('side', 90), ('back', 180)]:
        root.rotation_euler = (0, 0, math.radians(deg)); render(os.path.join(OUT, 'view-' + name + '.png'), 560, 48)
if 'emotions' in ARGS:
    aim(2.75, elev=4, target=(0, 0, 0.12)); root.rotation_euler = (0, 0, math.radians(16)); hl.hide_render = hr.hide_render = True
    for kind in ['happy', 'thinking', 'idea', 'cool', 'wink', 'surprised']:
        set_face(kind); render(os.path.join(OUT, 'emotion-' + kind + '.png'), 400, 40)
if 'mouse' in ARGS:                                             # how it follows the pointer: it turns and looks; on hover it smiles and bounces
    aim(3.4, elev=7)
    root.rotation_euler = (0, 0, math.radians(-30)); set_face('lookL'); render(os.path.join(OUT, 'mouse-look.png'), 480, 40)
    root.rotation_euler = (0, 0, 0); root.scale = (1.04, 1.04, 0.93); set_face('happy'); render(os.path.join(OUT, 'mouse-hover.png'), 480, 40); root.scale = (1, 1, 1)
if 'hero' in ARGS:
    bpy.data.objects.remove(hl); bpy.data.objects.remove(hr)
    hw = hand('HandWave', 'open', 1); hp = hand('HandPoint', 'point', -1)
    place(hw, (1.22, -0.36, 0.22), (10, 24, -8)); place(hp, (-1.16, -0.66, -0.34), (78, -48, -42))
    root.rotation_euler = (0, 0, math.radians(-24)); set_face('happy'); bpy.context.view_layer.update()
    tip = fingertip(hp)
    C = tip + Vector((-0.3, -0.22, 0.3)); v0 = tip - C; r0 = math.hypot(v0.x, v0.z); a0 = math.atan2(v0.z, v0.x); pts = []
    for i in range(140):                                         # a light stroke that leaves the fingertip and curls into a swirl
        t = i / 139; a = a0 - t * 2 * math.pi * 1.2; r = r0 * (1 - 0.72 * t ** 0.9)
        pts.append(C + Vector((r * math.cos(a), v0.y * (1 - t) - 0.05 * t, r * math.sin(a))))
    trail(pts, lambda t: 0.004 + 0.013 * math.sin(math.pi * min(1, 0.08 + t)) ** 0.6)
    trail(pts, lambda t: 0.012 + 0.04 * math.sin(math.pi * min(1, 0.08 + t)) ** 0.6, 'TrailHalo', M_halo)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.038, location=tip); bpy.context.object.data.materials.append(M_tip)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.095, location=tip); bpy.context.object.data.materials.append(M_tipHalo)
    tl = bpy.data.objects.new('TipLight', bpy.data.lights.new('TipLight', 'POINT')); col.objects.link(tl); tl.location = tip; tl.data.energy = 8; tl.data.color = (0.6, 0.95, 1.0); tl.data.shadow_soft_size = 0.05
    aim(4.3, elev=8, target=(-0.5, 0, 0.14)); render(os.path.join(OUT, 'hero.png'), 960, 96)
