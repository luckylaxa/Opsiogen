"""Build the Opsiogen character as a 3D model in Blender, to the owner's reference renders, and export it as character.glb.
Run with Blender's Python:  python build.py [--render]   (pip install bpy pillow; Blender is free, no account needed).
Sizes are in units of the body's radius. The eye looks along -Y (Blender's front), Z is up, +X is the character's left."""
import bpy, bmesh, math, sys, os
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.context.collection

def material(name, base=(1, 1, 1), rough=0.5, coat=0.0, emit=None, strength=1.0, alpha=1.0, vcol=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.05
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    if alpha < 1: b.inputs['Alpha'].default_value = alpha; m.surface_render_method = 'BLENDED'
    if vcol:                                                   # the colour comes from the mesh, and it glows in that colour
        a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Color'
        nt.links.new(a.outputs['Color'], b.inputs['Base Color']); nt.links.new(a.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = strength
    return m

def mesh_object(name, verts, faces, mat, colors=None, uvs=None):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    if colors:
        ca = me.color_attributes.new('Color', 'FLOAT_COLOR', 'POINT')
        for i, c in enumerate(colors): ca.data[i].color = (*c, 1)
        me.color_attributes.active_color = ca
    if uvs:
        uv = me.uv_layers.new(name='UVMap')
        for loop in me.loops: uv.data[loop.index].uv = uvs[loop.vertex_index]
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); col.objects.link(ob); me.materials.append(mat)
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    return ob

def lathe(name, profile, mat, n=192, uv_radius=None):
    """Turn a profile of (distance from the eye's axis, height along it) round that axis."""
    verts, faces, uvs = [], [], []
    for r, h in profile:
        for k in range(n):
            t = 2 * math.pi * k / n; verts.append((r * math.cos(t), -h, r * math.sin(t)))
            if uv_radius: uvs.append((0.5 + 0.5 * r * math.cos(t) / uv_radius, 0.5 + 0.5 * r * math.sin(t) / uv_radius))
    for i in range(len(profile) - 1):
        for k in range(n): a, b = i * n + k, i * n + (k + 1) % n; faces.append((a, b, b + n, a + n))
    return mesh_object(name, verts, faces, mat, uvs=uvs or None)

def on_body(lon, lat, r=1.0):                                  # lon 0 is the front, 90 the character's left; lat is up
    return Vector((r * math.cos(lat) * math.sin(lon), -r * math.cos(lat) * math.cos(lon), r * math.sin(lat)))

def tube(name, points, radius, mat, n=6):
    verts, faces = [], []; m = len(points)
    for i, p in enumerate(points):
        t = (points[min(i + 1, m - 1)] - points[max(i - 1, 0)]).normalized(); out = p.normalized(); side = t.cross(out).normalized()
        for k in range(n): a = 2 * math.pi * k / n; verts.append(tuple(p + radius * (math.cos(a) * out + math.sin(a) * side)))
    for i in range(m - 1):
        for k in range(n): a, b = i * n + k, i * n + (k + 1) % n; faces.append((a, b, b + n, a + n))
    return mesh_object(name, verts, faces, mat)

# ---- materials (named so the web page can find them)
M_body = material('body', (0.95, 0.955, 0.97), rough=0.15, coat=1.0)
M_base = material('base', (0.84, 0.86, 0.91), rough=0.18, coat=1.0)
M_dark = material('socket', (0.012, 0.015, 0.02), rough=0.3)
M_gasket = material('gasket', (0.02, 0.022, 0.028), rough=0.12, coat=1.0)
M_glass = material('glass', (0.5, 0.72, 0.78), rough=0.0, coat=1.0)                # smoked glass: you see the light inside through it
M_glass.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = 1.0; M_glass.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value = 1.45
M_hud = material('hud', (0, 0, 0), rough=1.0, emit=(0.25, 0.92, 1.0), strength=2.2)
M_strip = material('strip', rough=0.5, vcol=True, strength=1.0)
M_glow = material('stripGlow', rough=1.0, vcol=True, strength=1.6, alpha=0.2)
M_seam = material('seam', (0.7, 0.72, 0.77), rough=0.5)

# ---- the eye's light, drawn once as a picture and carried inside the model file: a lens with rings, ticks and small lights
from PIL import Image, ImageDraw, ImageFilter
S = 1024; c = S / 2
def layer(): im = Image.new('RGB', (S, S), (0, 0, 0)); return im, ImageDraw.Draw(im)
def arc(d, r, w, colr, a0=0, a1=360): d.arc((c - r * c, c - r * c, c + r * c, c + r * c), a0, a1, fill=colr, width=max(1, round(w * c)))
C = (60, 232, 255); lines, d = layer()
arc(d, 0.86, 0.006, (22, 96, 110)); arc(d, 0.70, 0.008, (34, 150, 170))
for k in range(48): arc(d, 0.78, 0.022, (26, 110, 126), k * 7.5, k * 7.5 + 1.2)                  # fine tick marks
for a in (0, 90, 180, 270):
    x, y = math.cos(math.radians(a)), math.sin(math.radians(a)); d.line((c + x * 0.50 * c, c + y * 0.50 * c, c + x * 0.92 * c, c + y * 0.92 * c), fill=(40, 170, 190), width=3)
arc(d, 0.50, 0.016, (44, 190, 212)); arc(d, 0.50, 0.03, (150, 245, 255), 100, 170); arc(d, 0.50, 0.03, (150, 245, 255), 290, 330)
arc(d, 0.34, 0.075, C)                                                                          # the bright ring round the lens
d.ellipse((c + 0.13 * c, c + 0.50 * c, c + 0.21 * c, c + 0.58 * c), fill=(200, 250, 255)); d.ellipse((c - 0.66 * c, c - 0.03 * c, c - 0.61 * c, c + 0.02 * c), fill=C)
glowl = lines.filter(ImageFilter.GaussianBlur(22)).point(lambda v: min(255, int(v * 2.4)))
pool, g = layer(); g.ellipse((c - 0.5 * c, c - 0.5 * c, c + 0.5 * c, c + 0.5 * c), fill=(5, 46, 58)); pool = pool.filter(ImageFilter.GaussianBlur(70))   # teal depth
lens, g = layer(); g.ellipse((c - 0.26 * c, c - 0.26 * c, c + 0.26 * c, c + 0.26 * c), fill=(255, 255, 255)); lens = lens.filter(ImageFilter.GaussianBlur(6)).convert('L')
core, g = layer(); g.ellipse((c - 0.30 * c, c - 0.34 * c, c + 0.10 * c, c + 0.06 * c), fill=(20, 110, 130)); core = core.filter(ImageFilter.GaussianBlur(40))        # a soft glint in the lens
from PIL import ImageChops
hud = ImageChops.add(ImageChops.add(pool, glowl), lines); hud = Image.composite(ImageChops.add(Image.new('RGB', (S, S), (2, 10, 14)), core), hud, lens)
K = 0.74; small = hud.resize((round(S * K), round(S * K)), Image.LANCZOS); hud = Image.new('RGB', (S, S), (1, 4, 6)); hud.paste(small, (round(S * (1 - K) / 2),) * 2)   # the instrument is small in a dark eye, as on the artwork
edge = Image.new('L', (S, S), 0); ImageDraw.Draw(edge).ellipse((S * 0.16, S * 0.16, S * 0.84, S * 0.84), fill=255); hud = Image.composite(hud, Image.new('RGB', (S, S), (1, 4, 6)), edge.filter(ImageFilter.GaussianBlur(30)))
hud.save(os.path.join(HERE, 'hud.png'))
img = bpy.data.images.load(os.path.join(HERE, 'hud.png')); nt = M_hud.node_tree; tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img
nt.links.new(tex.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Emission Color'])

# ---- the body: a sphere, with a hole for the eye and a groove that parts the base panel from it
bpy.ops.mesh.primitive_uv_sphere_add(segments=256, ring_count=128, radius=1.0); body = bpy.context.object; body.name = 'Body'; body.data.materials.append(M_body)
EYE_R = 0.612                                                    # the eye's hole
bpy.ops.mesh.primitive_cylinder_add(vertices=192, radius=EYE_R, depth=1.0, location=(0, -1.1, 0), rotation=(math.pi / 2, 0, 0)); cut_eye = bpy.context.object; cut_eye.data.materials.append(M_dark)

# the groove runs round the lower body on a tilt: low under the eye, high across the back
RHO = math.radians(53); h0 = Vector((math.sin(math.radians(212)), -math.cos(math.radians(212)), 0))
AX = (math.cos(math.radians(21)) * Vector((0, 0, -1)) + math.sin(math.radians(21)) * h0).normalized()
U = (-h0 - AX * (-h0).dot(AX)).normalized(); V = AX.cross(U)     # U points to where the groove is lowest, under the eye
def groove_pt(theta, phi, r): return r * (math.cos(theta) * AX + math.sin(theta) * (math.cos(phi) * U + math.sin(phi) * V))
def half_width(phi): return 0.015 + 0.035 * (0.5 - 0.5 * math.cos(phi)) ** 1.3                  # a thin line at the front, opening into a dark recess toward the back
N = 360; verts, faces = [], []
for i in range(N):
    phi = 2 * math.pi * i / N; hw = half_width(phi)
    for th, r in ((RHO - hw, 0.90), (RHO + hw, 0.90), (RHO + hw, 1.08), (RHO - hw, 1.08)): verts.append(tuple(groove_pt(th, phi, r)))
for i in range(N):
    for k in range(4): a, b = i * 4 + k, i * 4 + (k + 1) % 4; cc, dd = ((i + 1) % N) * 4 + (k + 1) % 4, ((i + 1) % N) * 4 + k; faces.append((a, b, cc, dd))
cut_groove = mesh_object('GrooveCut', verts, faces, M_dark)
for cutter in (cut_eye, cut_groove):
    mod = body.modifiers.new('cut', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = cutter; mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'
    bpy.context.view_layer.objects.active = body; bpy.ops.object.modifier_apply(modifier=mod.name); bpy.data.objects.remove(cutter)
me = body.data; base_slot = len(me.materials); me.materials.append(M_base)
bm = bmesh.new(); bm.from_mesh(me)
for f in bm.faces:
    f.smooth = True
    if f.material_index == 0 and f.calc_center_median().normalized().dot(AX) > math.cos(RHO): f.material_index = base_slot   # the base panel, below the groove
for e in bm.edges:
    if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(30): e.smooth = False                              # crisp edges where it was cut
bm.to_mesh(me); bm.free()

# ---- the eye, turned round its axis: a white rim, a dark gasket, a glass dome, and the light set back inside
h_s = math.sqrt(1 - EYE_R ** 2)
lathe('Rim', [(EYE_R + 0.002, h_s - 0.03), (EYE_R + 0.002, h_s - 0.002), (EYE_R - 0.006, h_s + 0.010), (EYE_R - 0.022, h_s + 0.014), (EYE_R - 0.042, h_s + 0.011), (0.548, h_s + 0.003), (0.536, h_s - 0.004)], M_body)
lathe('Gasket', [(0.536, h_s - 0.004), (0.522, h_s - 0.008), (0.506, h_s - 0.004)], M_gasket)
RG, r_g, h_g = 0.79, 0.506, h_s - 0.004                          # the glass bulges out as far as the body would
lathe('Glass', [(r_g * math.cos(t), h_g + math.sqrt(RG * RG - (r_g * math.cos(t)) ** 2) - math.sqrt(RG * RG - r_g * r_g)) for t in [math.pi / 2 * i / 32 for i in range(33)]], M_glass)
lathe('SocketWall', [(0.506, h_s - 0.004), (0.49, 0.705)], M_dark)
lathe('Hud', [(0.49, 0.705), (0.25, 0.705), (0.0, 0.705)], M_hud, uv_radius=0.49)

# ---- the colour line: lit along the groove, dark across the back
stops = [(0.00, (1.0, 0.5, 0.12)), (0.07, (1.0, 0.28, 0.55)), (0.16, (0.62, 0.3, 1.0)), (0.27, (0.2, 0.5, 1.0)), (0.36, (0.1, 0.8, 1.0)), (0.40, (0.02, 0.03, 0.05)),
         (0.60, (0.02, 0.03, 0.05)), (0.64, (1.0, 0.3, 0.7)), (0.72, (0.62, 0.3, 1.0)), (0.82, (0.2, 0.5, 1.0)), (0.90, (0.1, 0.85, 1.0)), (0.95, (0.62, 0.3, 1.0)), (1.0, (1.0, 0.5, 0.12))]
def line_col(t):
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        if t <= t1: k = (t - t0) / (t1 - t0); k = k * k * (3 - 2 * k); return tuple(c0[j] + (c1[j] - c0[j]) * k for j in range(3))
    return stops[-1][1]
LINE = 0.027                                                     # half the lit line's width: it stays thin all the way
def lit(t): return 1.0 if max(line_col(t)) > 0.1 else 0.0
def ribbon(name, r, grow, mat, fade=False):
    verts, faces, cols = [], [], []
    for i in range(N):
        phi = 2 * math.pi * i / N; t = ((i / N) + 0.04) % 1.0; cl = line_col(t); on = lit(t)
        mid = RHO - half_width(phi) + LINE + 0.002               # it lies along the base panel's edge of the groove
        hw = LINE + grow if on else half_width(phi) * 0.7        # where it is not lit, the dark band fills the groove
        if not on: mid = RHO
        hot = tuple(v + (1 - v) * 0.22 for v in cl) if on and not fade else cl          # a brighter, whiter centre
        if fade: hot = tuple(v * on for v in cl); cl = (0.0, 0.0, 0.0)             # the halo is brightest on the line and fades to nothing at its edges
        cl, hot = (tuple(v ** 2.2 for v in q) for q in (cl, hot))                 # the colours are picked as seen on screen; the file stores them as light
        verts += [tuple(groove_pt(mid - hw, phi, r)), tuple(groove_pt(mid, phi, r + (0.004 if not fade else 0))), tuple(groove_pt(mid + hw, phi, r))]; cols += [cl, hot, cl]
    for i in range(N):
        if not (lit(((i / N) + 0.04) % 1.0) and lit((((i + 1) / N) + 0.04) % 1.0)): continue          # no line across the back: the groove is left open and dark
        for k in range(2): a, b = i * 3 + k, i * 3 + k + 1; cc, dd = ((i + 1) % N) * 3 + k + 1, ((i + 1) % N) * 3 + k; faces.append((a, b, cc, dd))
    return mesh_object(name, verts, faces, mat, colors=cols)
ribbon('Strip', 0.990, 0.0, M_strip)
ribbon('StripGlow', 1.003, 0.06, M_glow, fade=True)              # a soft halo for the web page, which has no light bounce of its own

# ---- fine panel seams
eye = Vector((0, -1, 0))
def above_groove(p): return p.normalized().dot(AX) < math.cos(RHO + 0.03)
def seam(name, pts): pts = [p * 1.0004 for p in pts]; return tube(name, pts, 0.0032, M_seam) if len(pts) > 3 else None
def circle_pts(axis, cosd, keep):
    axis = Vector(axis).normalized(); u = axis.orthogonal().normalized(); v = axis.cross(u); rad = math.sqrt(1 - cosd * cosd)
    pts = [axis * cosd + rad * (math.cos(a) * u + math.sin(a) * v) for a in [2 * math.pi * i / 360 for i in range(361)]]
    runs, run = [], []
    for p in pts:
        if keep(p): run.append(p)
        elif run: runs.append(run); run = []
    if run: runs.append(run)
    return max(runs, key=len) if runs else []
# one seam round the top of the body: it rises over the eye and over the back, and dips at the sides (as on the reference sheet)
def cap_lat(lon): return math.radians(25 + 11 * math.cos(2 * lon) + 11.5 * math.cos(lon))   # as on the sheet: over the top of the eye, down to the sides, a gentle arc across the back
seam('SeamCap', [on_body(l, cap_lat(l)) for l in [2 * math.pi * i / 360 for i in range(361)]])
# and a short one under the eye, from its rim down to the colour line
seam('SeamChin', [p for p in [on_body(0.0, math.radians(a)) for a in range(-40, -80, -1)] if above_groove(p)])

# one parent, so the whole character turns together
root = bpy.data.objects.new('Character', None); col.objects.link(root)
for ob in list(col.objects):
    if ob is not root: ob.parent = root
bpy.ops.export_scene.gltf(filepath=os.path.join(HERE, 'character.glb'), export_format='GLB', export_apply=True, export_vertex_color='ACTIVE', export_all_vertex_colors=True, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'character.blend'))
print('exported', os.path.getsize(os.path.join(HERE, 'character.glb')) // 1024, 'KB')

if '--render' in sys.argv:                                     # stills from Blender's own renderer, in a soft white studio, to check against the reference
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 96; sc.cycles.use_denoising = True
    sc.render.resolution_x = sc.render.resolution_y = 640; sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); col.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.5; cam.location = (0, -6, 0); cam.rotation_euler = (math.pi / 2, 0, 0)
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.8, 0.83, 0.92, 1); bg.inputs['Strength'].default_value = 0.5
    def light(name, loc, size, energy, color=(1, 1, 1)):
        l = bpy.data.lights.new(name, 'AREA'); l.size = size; l.energy = energy; l.color = color; o = bpy.data.objects.new(name, l); col.objects.link(o)
        o.location = loc; o.rotation_euler = Vector(loc).to_track_quat('Z', 'Y').to_euler()
    light('Key', (-3, -4, 4), 5, 190); light('Fill', (4, -3, 1), 4, 50); light('Blue', (-1.5, -1, -3), 2, 60, (0.3, 0.5, 1)); light('Pink', (1.5, -1, -3), 2, 60, (1, 0.35, 0.75))
    for name, deg in [('front', 0), ('threequarter', 42), ('back', 180)]:
        root.rotation_euler = (0, 0, math.radians(deg)); sc.render.filepath = os.path.join(HERE, 'check-' + name + '.png'); bpy.ops.render.render(write_still=True)
