"""Opsiogen character, version 3: built to Lucky's reference sheet (23 Nov 2026).
A glossy white ball; a big domed black visor in a white bezel, with the face drawn as cyan light; a rainbow stripe
over the head from ear to ear; headphone ears with a black centre and a blue-purple light ring; a rainbow ring close
round the body; a glowing seam low on the front; cartoon gloves with black cuffs and cyan rings.
Run with Blender's Python (free, no account):  pip install bpy pillow numpy fonttools brotli
   python build.py all    (renders go to ./out; or test, hands, views, emotions, hero), then  python sheet.py
Replaces the version 2 concept (../v2). The site still uses version 1 (../model/build.py) until this is approved.
Units: the body's radius. Front is -Y, up is +Z, the character's left is +X."""
import bpy, bmesh, math, sys, os
import numpy as np
from mathutils import Vector, Matrix, Quaternion, Euler
from bpy_extras.object_utils import world_to_camera_view
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
ARGS = sys.argv[1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.context.collection

# ---------------------------------------------------------------- colour
SPEC = ['#d8fa01', '#01f14c', '#00ecfd', '#01a5e2', '#9b1cf0', '#ff2a1a', '#fe9102', '#feb702']   # the brand spectrum
def hexrgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
def spectrum(t):
    n = len(SPEC); x = (t % 1.0) * n; i = int(x); f = x - i; f = f * f * (3 - 2 * f)
    a, b = hexrgb(SPEC[i % n]), hexrgb(SPEC[(i + 1) % n]); return tuple(a[k] + (b[k] - a[k]) * f for k in range(3))
def lin(c): return tuple(max(0.0, v) ** 2.2 for v in c)
def mix(a, b, t): return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))
def ramp(stops, t):
    t = min(max(t, 0.0), 1.0)
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        if t <= t1: k = (t - t0) / max(t1 - t0, 1e-9); k = k * k * (3 - 2 * k); return mix(c0, c1, k)
    return stops[-1][1]
HEAD = [(0.0, hexrgb('#ffd400')), (0.22, hexrgb('#ffc000')), (0.32, hexrgb('#ff7a00')), (0.42, hexrgb('#ff1e10')), (0.53, hexrgb('#ff10a0')), (0.64, hexrgb('#a010f0')), (0.76, hexrgb('#6a24ff')), (1.0, hexrgb('#5034ff'))]   # yellow, orange, red, magenta, purple, violet
EAR = [(0.0, hexrgb('#2f6bff')), (0.5, hexrgb('#19c8ff')), (1.0, hexrgb('#2f6bff'))]
EARIN = [(0.0, hexrgb('#ff1fd0')), (0.5, hexrgb('#8a2cff')), (1.0, hexrgb('#ff1fd0'))]
SEAM = [(0.0, hexrgb('#2a7bff')), (0.5, hexrgb('#8a2cff')), (1.0, hexrgb('#ff4fd8'))]

# ---------------------------------------------------------------- materials
def material(name, base=(1, 1, 1), rough=0.5, coat=0.0, emit=None, strength=1.0, vcol=False, spec=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*base, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat; b.inputs['Coat Roughness'].default_value = 0.03
    if spec is not None: b.inputs['Specular IOR Level'].default_value = spec
    if emit: b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    if vcol:
        a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Color'
        dim = nt.nodes.new('ShaderNodeMix'); dim.data_type = 'RGBA'; dim.blend_type = 'MULTIPLY'; dim.inputs['Factor'].default_value = 1.0
        dim.inputs['B'].default_value = (0.3, 0.3, 0.3, 1)                 # a darker surface under the light, so the colours stay deep
        nt.links.new(a.outputs['Color'], dim.inputs['A']); nt.links.new(dim.outputs['Result'], b.inputs['Base Color'])
        nt.links.new(a.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = strength
    return m
M_body = material('body', (0.88, 0.88, 0.92), rough=0.14, coat=1.0)
M_glove = material('glove', (0.86, 0.86, 0.9), rough=0.38, coat=0.3)
M_visor = material('visor', (0.004, 0.004, 0.007), rough=0.1, coat=1.0)
M_black = material('earBlack', (0.006, 0.006, 0.012), rough=0.12, coat=1.0)
M_band = material('cuffBand', (0.03, 0.032, 0.04), rough=0.28, coat=0.6)
M_ring = material('ring', rough=0.25, coat=0.25, vcol=True, strength=1.15)
M_head = material('headStripe', rough=0.3, vcol=True, strength=1.3)
M_seam = material('lowSeam', rough=0.3, vcol=True, strength=2.4)
M_earRing = material('earRing', rough=0.3, vcol=True, strength=2.3)
M_cyan = material('cuffLight', (0.2, 0.9, 1.0), rough=0.3, emit=(0.05, 0.8, 1.0), strength=3.0)
M_stroke = material('stroke', rough=0.5, vcol=True, strength=1.25)
M_pen = material('pen', (0.93, 0.93, 0.955), rough=0.2, coat=0.8)
M_penDark = material('penDark', (0.02, 0.02, 0.025), rough=0.25, coat=0.6)
M_nib = material('nib', (1, 0.6, 0.9), emit=(1.0, 0.45, 0.9), strength=4)
M_matte = material('matte', (0, 0, 0), rough=1.0, spec=0.0)
DARK_IN_GLOW = {'body', 'glove', 'earBlack', 'cuffBand', 'pen', 'penDark'}

# ---------------------------------------------------------------- mesh helpers
def mesh_object(name, verts, faces, mat, colors=None, uvs=None, smooth=True, merge=True, parent=None):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in verts], [], faces); me.update()
    if colors:
        ca = me.color_attributes.new('Color', 'FLOAT_COLOR', 'POINT')
        for i, c in enumerate(colors): ca.data[i].color = (*c, 1)
        me.color_attributes.active_color = ca
    if uvs:
        uv = me.uv_layers.new(name='UVMap')
        for loop in me.loops: uv.data[loop.index].uv = uvs[loop.vertex_index]
    ob = bpy.data.objects.new(name, me); col.objects.link(ob); me.materials.append(mat)
    if merge and not uvs:
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = smooth
    if parent: ob.parent = parent
    return ob

def basis(axis):
    a = Vector(axis).normalized(); u = (Vector((0, 0, 1)) if abs(a.z) < 0.9 else Vector((1, 0, 0))).cross(a).normalized(); return a, u, a.cross(u)

def lathe(name, profile, mat, axis=(0, 0, 1), n=96, parent=None):
    """Turn a profile of (distance from the axis, distance along it) round the axis."""
    a, u, v = basis(axis); verts, faces = [], []
    for r, h in profile:
        for k in range(n): t = 2 * math.pi * k / n; verts.append(a * h + r * (math.cos(t) * u + math.sin(t) * v))
    for i in range(len(profile) - 1):
        for k in range(n): p, q = i * n + k, i * n + (k + 1) % n; faces.append((p, q, q + n, p + n))
    return mesh_object(name, verts, faces, mat, parent=parent)

def torus(name, R, r, mat, axis=(0, 0, 1), center=(0, 0, 0), n=256, m=20, color=None, parent=None, u0=None):
    """A ring of radius R round the axis; r the radius of its tube. color(t along, b round the tube) -> rgb."""
    a, u, v = basis(axis)
    if u0 is not None: u = Vector(u0).normalized(); v = a.cross(u)
    c0 = Vector(center); verts, faces, cols = [], [], []
    for i in range(n):
        t = 2 * math.pi * i / n; out = math.cos(t) * u + math.sin(t) * v
        for j in range(m):
            b = 2 * math.pi * j / m; verts.append(c0 + out * (R + r * math.cos(b)) + a * (r * math.sin(b)))
            if color: cols.append(lin(color(i / n, b)))
    for i in range(n):
        for j in range(m): p = i * m + j; q = i * m + (j + 1) % m; faces.append((p, q, ((i + 1) % n) * m + (j + 1) % m, ((i + 1) % n) * m + j))
    return mesh_object(name, verts, faces, mat, colors=cols or None, parent=parent)

def tube(name, pts, radius, mat, n=16, color=None, caps=True, parent=None):
    """A tube through the points; radius(t) and color(t) along it (t from 0 to 1); round caps at both ends."""
    pts = [Vector(p) for p in pts]; m = len(pts); rad = radius if callable(radius) else (lambda t, r=radius: r)
    tans = [(pts[min(i + 1, m - 1)] - pts[max(i - 1, 0)]).normalized() for i in range(m)]
    nrm = tans[0].orthogonal().normalized(); frames = []
    for i in range(m):                                           # parallel transport, so the tube does not twist
        if i: nrm = (nrm - tans[i] * nrm.dot(tans[i])).normalized()
        frames.append((nrm.copy(), tans[i].cross(nrm).normalized()))
    rings = [(pts[i], tans[i], frames[i], rad(i / (m - 1)), i / (m - 1)) for i in range(m)]
    if caps:
        r0, r1 = rings[0][3], rings[-1][3]
        start = [(pts[0] - tans[0] * r0 * math.sin(a), tans[0], frames[0], r0 * math.cos(a), 0.0) for a in [math.pi / 2 * k / 6 for k in range(6, 0, -1)]]
        end = [(pts[-1] + tans[-1] * r1 * math.sin(a), tans[-1], frames[-1], r1 * math.cos(a), 1.0) for a in [math.pi / 2 * k / 6 for k in range(1, 7)]]
        rings = start + rings + end
    verts, faces, cols = [], [], []
    for p, t, (nn, bb), r, tt in rings:
        for k in range(n):
            a = 2 * math.pi * k / n; verts.append(p + r * (math.cos(a) * nn + math.sin(a) * bb))
            if color: cols.append(lin(color(tt)))
    for i in range(len(rings) - 1):
        for k in range(n): p, q = i * n + k, i * n + (k + 1) % n; faces.append((p, q, q + n, p + n))
    return mesh_object(name, verts, faces, mat, colors=cols or None, parent=parent)

def superellipsoid(name, a, b, c, e1, e2, mat, nu=56, nv=36, center=(0, 0, 0), parent=None, taper=0.0):
    def C(w, m): return math.copysign(abs(math.cos(w)) ** m, math.cos(w))
    def S(w, m): return math.copysign(abs(math.sin(w)) ** m, math.sin(w))
    c0 = Vector(center); verts, faces = [], []
    for i in range(1, nv):
        v = -math.pi / 2 + math.pi * i / nv
        for j in range(nu): u = -math.pi + 2 * math.pi * j / nu; z_ = c * S(v, e1); verts.append(c0 + Vector((a * (1 + taper * z_ / c) * C(v, e1) * C(u, e2), b * C(v, e1) * S(u, e2), z_)))
    bot = len(verts); verts.append(c0 + Vector((0, 0, -c))); top = len(verts); verts.append(c0 + Vector((0, 0, c)))
    for i in range(nv - 2):
        for j in range(nu): p = i * nu + j; q = i * nu + (j + 1) % nu; faces.append((p, q, q + nu, p + nu))
    for j in range(nu): faces.append((bot, (j + 1) % nu, j)); faces.append((top, (nv - 2) * nu + j, (nv - 2) * nu + (j + 1) % nu))
    return mesh_object(name, verts, faces, mat, parent=parent)

def on_sphere(lon, lat, r=1.0):                                 # lon 0 is the front, +90 the character's left
    lon, lat = math.radians(lon), math.radians(lat)
    return Vector((r * math.cos(lat) * math.sin(lon), -r * math.cos(lat) * math.cos(lon), r * math.sin(lat)))

root = bpy.data.objects.new('Character', None); col.objects.link(root)

# ---------------------------------------------------------------- body
bpy.ops.mesh.primitive_uv_sphere_add(segments=192, ring_count=96, radius=1.0); body = bpy.context.object; body.name = 'Body'
body.data.materials.append(M_body); body.parent = root
for p in body.data.polygons: p.use_smooth = True

# ---------------------------------------------------------------- visor: a rounded shape as seen from the front, domed, in a white bezel
VA, VB, VZ, VN, BULGE = 0.8, 0.46, 0.1, 2.25, 0.035
def bnd(th):
    c, s = math.cos(th), math.sin(th); return VA * math.copysign(abs(c) ** (2 / VN), c), VB * math.copysign(abs(s) ** (2 / VN), s)
def proj(x, z, r=1.0): return Vector((x, -math.sqrt(max(r * r - x * x - z * z, 1e-6)), z))
MS, KS = 220, 34
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
visor = mesh_object('Visor', verts, faces, M_visor, uvs=uvs, parent=root)

M_rim = material('rim', (0.5, 0.46, 0.72), rough=0.18, coat=1.0)
def bezel_sweep(name, prof, mat, MB=240):
    verts, faces = [], []; C0 = proj(0, VZ)
    for j in range(MB):
        th = 2 * math.pi * j / MB; bx, bz = bnd(th); B = proj(bx, VZ + bz)
        b1, b2 = bnd(th + 0.002), bnd(th - 0.002); T = (proj(b1[0], VZ + b1[1]) - proj(b2[0], VZ + b2[1])).normalized(); N = B.normalized()
        O = T.cross(N).normalized()
        if O.dot(B - C0) < 0: O = -O
        for d, h in prof: verts.append(B + O * d + N * h)
    L = len(prof)
    for j in range(MB):
        for i in range(L - 1): p = j * L + i; q = ((j + 1) % MB) * L + i; faces.append((p, q, q + 1, p + 1))
    return mesh_object(name, verts, faces, mat, parent=root)
bezel_sweep('BezelWall', [(-0.016, -0.03), (-0.0145, 0.004)], M_rim)
bezel_sweep('BezelChamfer', [(-0.0145, 0.004), (0.016, 0.02)], M_rim)   # a thin lavender band round the glass
bezel_sweep('Bezel', [(0.016, 0.02), (0.0172, 0.0222), (0.0195, 0.0232), (0.034, 0.021), (0.05, 0.012), (0.062, 0.003), (0.066, -0.03)], M_body)   # a narrow white lip, a crisp edge against the band

# ---------------------------------------------------------------- ears: a raised plate, a cup, a black centre and a light ring
EAR_LON, EAR_LAT = 78, 8                                         # out at the sides, as on the reference's front view: from the front the lens is seen nearly edge-on
if os.environ.get('EAR'): EAR_LON, EAR_LAT = [float(v) for v in os.environ['EAR'].split(',')]
EAR_S = float(os.environ.get('EARSIZE', 0.86))                      # the ear's size against the head, as measured on the reference's 3/4 view
STRIPE_LON = 71                                                  # the top seam comes down to the housing's front-top edge
EARBAND = [(0.0, hexrgb('#16c8ff')), (0.22, hexrgb('#1f6bff')), (0.45, hexrgb('#2a3cff')), (0.66, hexrgb('#7a2cff')), (0.84, hexrgb('#d81fe6')), (1.0, hexrgb('#ff1fc8'))]
M_earWhite = material('earWhite', (1, 1, 1), rough=0.3, emit=(1, 1, 1), strength=5.0)
M_earLine = material('earLine', (0.4, 0.42, 0.5), rough=0.45); DARK_IN_GLOW.add('earLine')
M_earDome = material('earDome', (0.01, 0.012, 0.03), rough=0.04, coat=1.0, vcol=True, strength=1.6)
def ear_dome(name, ax, R, h0, bulge, NA=200, K=32):
    """The glossy lens: dark in the middle, taking the band's colour over its outer third."""
    a, u, v = basis(ax); C0 = (0.004, 0.005, 0.02); verts, faces, cols = [a * (h0 + bulge)], [], [lin(C0)]
    HL = Vector((0, -0.75, 1.0)); HL = (HL - a * HL.dot(a)).normalized()   # up and toward the front, in the lens's plane
    m = max(abs((math.cos(2 * math.pi * i / NA) * u + math.sin(2 * math.pi * i / NA) * v).z) for i in range(NA)) or 1.0
    for k in range(1, K + 1):
        f = k / K; rr = R * f; hh = h0 + bulge * (1 - f * f)
        for i in range(NA):
            t = 2 * math.pi * i / NA; d = math.cos(t) * u + math.sin(t) * v; rim = ramp(EARBAND, 0.3 + 0.7 * (0.5 - 0.5 * d.z / m))   # deeper: blue at the top, magenta at the bottom
            hl = (d - HL).length                                 # the soft highlight at the lens's top front
            w = min(1.0, max(0.0, (f - 0.3) / 0.7)) ** 1.3 * (0.75 + 0.25 * max(0.0, d.dot(HL)))
            c = mix(C0, rim, w); ang = math.acos(max(-1.0, min(1.0, d.dot(HL))))
            g = 0.62 * math.exp(-((f - 0.64) / 0.2) ** 2 - (ang / 0.85) ** 2)        # a broad, soft sheen inside the upper front of the lens, like a softbox reflection
            verts.append(a * hh + d * rr); cols.append(lin(mix(c, (0.56, 0.62, 0.8), g)))
    for i in range(NA): faces.append((0, 1 + i, 1 + (i + 1) % NA))
    for k in range(K - 1):
        for i in range(NA): p_ = 1 + k * NA + i; q_ = 1 + k * NA + (i + 1) % NA; faces.append((p_, p_ + NA, q_ + NA, q_))
    return mesh_object(name, verts, faces, M_earDome, colors=cols)
def ear_band(name, ax, r0, r1, h, bump=0.012, NA=200, K=10):
    """One rounded band of light, a neon tube laid in the channel: cyan at the top, blue, violet, magenta at the bottom."""
    a, u, v = basis(ax); verts, faces, cols = [], [], []
    m = max(abs((math.cos(2 * math.pi * i / NA) * u + math.sin(2 * math.pi * i / NA) * v).z) for i in range(NA)) or 1.0
    for i in range(NA):
        t = 2 * math.pi * i / NA; d = math.cos(t) * u + math.sin(t) * v; c = ramp(EARBAND, 0.5 - 0.5 * d.z / m)
        for k in range(K):
            q = k / (K - 1); rr = r0 + (r1 - r0) * q; verts.append(a * (h + bump * math.sin(math.pi * q)) + d * rr); cols.append(lin(c))
    for i in range(NA):
        for k in range(K - 1): p_ = i * K + k; q_ = ((i + 1) % NA) * K + k; faces.append((p_, p_ + 1, q_ + 1, q_))
    return mesh_object(name, verts, faces, M_earRing, colors=cols, merge=False)
for s in (1, -1):
    ax = on_sphere(s * EAR_LON, EAR_LAT); nm = 'L' if s > 0 else 'R'
    def es(prof): return [(r * EAR_S, h if h <= 0.99 else 0.99 + (h - 0.99) * EAR_S) for r, h in prof]      # the whole ear, scaled to the reference's size
    lathe('EarCup' + nm, es([(0.41, 0.86), (0.41, 0.99), (0.4085, 1.0), (0.404, 1.008), (0.397, 1.012), (0.385, 1.0155), (0.365, 1.0185), (0.345, 1.021), (0.32, 1.0222), (0.299, 1.0228), (0.289, 1.023), (0.285, 1.0205)]), M_body, axis=ax, n=200)   # the white housing: a short drum standing off the head, a crisp edge, a nearly flat face round a big opening
    lathe('EarGroove' + nm, es([(0.286, 1.0205), (0.284, 1.0075), (0.2245, 1.0075), (0.2226, 1.0155)]), M_black, axis=ax, n=200)   # the channel: a thin dark edge round the light
    ear_band('EarBand' + nm, ax, 0.2323 * EAR_S, 0.2797 * EAR_S, 0.99 + 0.0195 * EAR_S, bump=0.0125 * EAR_S)                         # the neon band
    torus('EarWhite' + nm, 0.2194 * EAR_S, 0.004, M_earWhite, axis=ax, center=ax * (0.99 + 0.0285 * EAR_S), n=200, m=10)          # a thin white-hot line on its inner edge
    ear_dome('EarCentre' + nm, ax, 0.2167 * EAR_S, 0.99 + 0.0255 * EAR_S, 0.04 * EAR_S)                                            # the glossy lens
    torus('EarLine' + nm, 0.413 * EAR_S, 0.0035, M_earLine, axis=ax, center=ax * math.sqrt(1 - (0.413 * EAR_S) ** 2), n=200, m=8)   # a soft grey line where the housing meets the head
    for o in ('EarCup', 'EarGroove', 'EarBand', 'EarWhite', 'EarCentre', 'EarLine'): bpy.data.objects[o + nm].parent = root

# ---------------------------------------------------------------- the rainbow stripe over the head, ear to ear, and the glowing seam low on the front
E1 = on_sphere(STRIPE_LON, EAR_LAT); TOP = on_sphere(0, 58)
n_ = Vector((1, 0, 0)).cross(TOP - Vector((0, E1.y, E1.z))).normalized(); d_ = n_.dot(E1); C_ = n_ * d_; rr_ = math.sqrt(1 - d_ * d_); up_ = n_.cross(Vector((1, 0, 0))).normalized()
if up_.z < 0: up_ = -up_
EAR_AX = on_sphere(EAR_LON, EAR_LAT); EAR_ANG = math.asin(0.41 * EAR_S) + math.radians(1.2)
def _circ(a): return C_ + rr_ * (math.cos(a) * Vector((1, 0, 0)) + math.sin(a) * up_)
A_EAR = next(math.radians(k / 10) for k in range(900, 0, -1) if _circ(math.radians(k / 10)).normalized().angle(EAR_AX) <= EAR_ANG)   # where the seam meets the housing
A_GLOW = A_EAR + math.radians(10)                                                                  # the light fades out a little above it
# the bottom piece, as on the current website character: a groove that parts the base panel, lit along its front with the gradient line
M_base = material('base', (0.76, 0.79, 0.9), rough=0.16, coat=1.0); M_dark = material('socket', (0.012, 0.015, 0.02), rough=0.3); DARK_IN_GLOW |= {'base', 'socket'}
# --- the bottom cut is the first website character's own, number for number (design/hero/character/model/build.py): do not retune it ---
RHO = math.radians(53); h0 = Vector((math.sin(math.radians(212)), -math.cos(math.radians(212)), 0))
AX = (math.cos(math.radians(21)) * Vector((0, 0, -1)) + math.sin(math.radians(21)) * h0).normalized()
U = (-h0 - AX * (-h0).dot(AX)).normalized(); V = AX.cross(U)
def groove_pt(theta, phi, r): return r * (math.cos(theta) * AX + math.sin(theta) * (math.cos(phi) * U + math.sin(phi) * V))
def half_width(phi): return 0.015 + 0.035 * (0.5 - 0.5 * math.cos(phi)) ** 1.3   # a thin line at the front, opening into a dark recess toward the back
NG = 360; verts, faces = [], []
for i in range(NG):
    phi = 2 * math.pi * i / NG; hw = half_width(phi)
    for th, r in ((RHO - hw, 0.90), (RHO + hw, 0.90), (RHO + hw, 1.08), (RHO - hw, 1.08)): verts.append(tuple(groove_pt(th, phi, r)))
for i in range(NG):
    for k in range(4): a, b = i * 4 + k, i * 4 + (k + 1) % 4; cc, dd = ((i + 1) % NG) * 4 + (k + 1) % 4, ((i + 1) % NG) * 4 + k; faces.append((a, b, cc, dd))
cutter = mesh_object('GrooveCut', verts, faces, M_dark)
mod = body.modifiers.new('cut', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = cutter; mod.solver = 'EXACT'; mod.material_mode = 'TRANSFER'
bpy.context.view_layer.objects.active = body; bpy.ops.object.modifier_apply(modifier=mod.name); bpy.data.objects.remove(cutter)
# the cut that the top light sits in: a thin slot all round where the shell meets the face piece, and the shell behind it
# stands a little proud, so there is a clear step edge with the light under it (fitted panels, as on the reference)
SLOT = 0.008   # where the shell's edge sits; no slot is cut, so no dark line
s_top = 1 if n_.z > d_ else -1
A_ = n_ * s_top; h_e = s_top * d_ + SLOT; RS = 1.005; th_e = math.acos(h_e / RS); rho_e = RS * math.sin(th_e)
# the shell behind the cut, with a tiny rounded bevel on its edge so the edge catches a thin, sharp highlight, then a straight wall
RB = 0.0028; thc = th_e - RB / RS; Rc = RS - RB
def er_(th): return Vector((math.sin(th), math.cos(th)))
def et_(th): return Vector((math.cos(th), -math.sin(th)))
TAPER = math.radians(24)                                          # the raised shell is only a band along the top light: it eases back down to the body, so the body and its bottom cut show everywhere else
def shell_r(th): k = min(1.0, max(0.0, (thc - th) / TAPER)); return 1.0 - 0.0006 * k + (RS - 1.0 + 0.0006 * k) * (1 - k * k * (3 - 2 * k))
prof = [(shell_r(thc - TAPER * (1 - k / 48)) * math.sin(thc - TAPER * (1 - k / 48)), shell_r(thc - TAPER * (1 - k / 48)) * math.cos(thc - TAPER * (1 - k / 48))) for k in range(49)]
for k in range(1, 9):
    ph = math.pi / 2 * k / 8; q = er_(thc) * Rc + RB * (math.cos(ph) * er_(thc) + math.sin(ph) * et_(thc)); prof.append((q.x, q.y))
qe = Vector(prof[-1]); prof.append(tuple(qe * (0.985 / qe.length)))
lathe('TopShell', prof[:-1], M_body, axis=A_, n=360); bpy.data.objects['TopShell'].parent = root   # white surface and bevel only
lathe('TopShellWall', [prof[-2], prof[-1]], M_body, axis=A_, n=360); bpy.data.objects['TopShellWall'].parent = root   # the shell's edge, white
for _nm in ('TopShell', 'TopShellWall'):                          # and only over the top, from ear to ear: below the ears there is no shell
    _me = bpy.data.objects[_nm].data; _bm = bmesh.new(); _bm.from_mesh(_me)
    def _arc(p): return math.atan2(p.dot(up_), p.dot(Vector((1, 0, 0))))
    _gone = [f for f in _bm.faces if not (A_EAR - 0.2 <= _arc(f.calc_center_median()) <= math.pi - A_EAR + 0.2)]
    bmesh.ops.delete(_bm, geom=_gone, context='FACES'); _bm.to_mesh(_me); _bm.free()
# the top light: a flat band of light with hard edges, from the foot of the shell's edge down onto the face piece; its ends come to points
def head_band(NA=300, K=7, W0=0.064):
    verts, faces, cols = [], [], []; a0, a1 = math.radians(186) - A_GLOW, A_GLOW
    for i in range(NA + 1):
        t = i / NA; a = a0 + (a1 - a0) * t; dirv = math.cos(a) * Vector((1, 0, 0)) + math.sin(a) * up_; W = W0 * math.sin(math.pi * t) ** 1.15; fade = min(1.0, t / 0.14, (1 - t) / 0.14) ** 1.5   # long pointed ends that fade into the seam
        for k in range(K):
            u = s_top * SLOT - s_top * W * k / (K - 1)
            q = n_ * (d_ + u) + dirv * math.sqrt(max(1 - (d_ + u) ** 2, 0.0)); verts.append(q * 1.0018); cols.append(lin(tuple(v * fade for v in ramp(HEAD, t))))
    for i in range(NA):
        for k in range(K - 1): p_ = i * K + k; faces.append((p_, p_ + 1, p_ + K + 1, p_ + K))
    return mesh_object('HeadStripe', verts, faces, M_head, colors=cols, merge=False, parent=root)
head_band()
def shell_edge_pt(a, lift=1.0025):
    dirv = math.cos(a) * Vector((1, 0, 0)) + math.sin(a) * up_; u = s_top * SLOT
    return (n_ * (d_ + u) + dirv * math.sqrt(max(1 - (d_ + u) ** 2, 0.0))) * lift
for a_s, a_e in ((A_GLOW + math.radians(3), A_EAR), (math.radians(186) - A_GLOW - math.radians(3), math.pi - A_EAR)):   # both sides
    pts = [shell_edge_pt(a_s + (a_e - a_s) * k / 40) for k in range(41)]
    tube('TopSeam%d' % (a_s > 1.6), pts, 0.0032, M_earLine, n=10, parent=root)                 # a fine, soft grey seam from the end of the light down to the housing
me_ = body.data; base_slot = len(me_.materials); me_.materials.append(M_base); bm = bmesh.new(); bm.from_mesh(me_)
for f in bm.faces:
    f.smooth = True
    if f.material_index == 0 and f.calc_center_median().normalized().dot(AX) > math.cos(RHO): f.material_index = base_slot
for e_ in bm.edges:
    if len(e_.link_faces) == 2 and e_.calc_face_angle(0) > math.radians(30): e_.smooth = False
bm.to_mesh(me_); bm.free()
# the colours as on the first website character's views: red at the lowest point, then magenta, purple, blue and cyan up each side to the dark recess across the back; orange just left of the lowest point
stops = [(0.00, (1.0, 0.34, 0.12)), (0.04, (1.0, 0.2, 0.22)), (0.10, (1.0, 0.24, 0.72)), (0.18, (0.62, 0.3, 1.0)), (0.27, (0.2, 0.5, 1.0)), (0.36, (0.1, 0.8, 1.0)), (0.40, (0.02, 0.03, 0.05)),
         (0.60, (0.02, 0.03, 0.05)), (0.64, (0.1, 0.85, 1.0)), (0.72, (0.2, 0.5, 1.0)), (0.80, (0.62, 0.3, 1.0)), (0.87, (1.0, 0.24, 0.72)), (0.93, (1.0, 0.22, 0.2)), (0.975, (1.0, 0.5, 0.12)), (1.0, (1.0, 0.34, 0.12))]
LINE = 0.027; PHASE = 0.04                                       # half the lit line's width, and where the colours start: both as on the first website character
def lit(t): return max(ramp(stops, t)) > 0.1
def ribbon(name, r, grow, mat, fade=False):
    verts, faces, cols = [], [], []
    for i in range(NG):
        phi = 2 * math.pi * i / NG; t = ((i / NG) + PHASE) % 1.0; cl = ramp(stops, t); on = 1.0 if lit(t) else 0.0
        mid = RHO - half_width(phi) + LINE + 0.002                   # along the base panel's edge of the groove
        hw = LINE + grow if on else half_width(phi) * 0.7            # where it is not lit, the dark band fills the groove
        if not on: mid = RHO
        hot = tuple(v + (1 - v) * 0.22 for v in cl) if on and not fade else cl      # a brighter, whiter centre
        if fade: k_ = min(1.0, max(0.0, (max(cl) - 0.1) / 0.5)); hot = tuple(v * k_ for v in cl); cl = (0.0, 0.0, 0.0)   # the halo is brightest on the line, fades to nothing at its edges and dies away where the line goes dark
        verts += [groove_pt(mid - hw, phi, r), groove_pt(mid, phi, r + (0.004 if not fade else 0)), groove_pt(mid + hw, phi, r)]; cols += [lin(cl), lin(hot), lin(cl)]
    for i in range(NG):
        if not (lit(((i / NG) + PHASE) % 1.0) and lit((((i + 1) / NG) + PHASE) % 1.0)): continue      # no line across the back: the groove is left open and dark
        for k in range(2): a = i * 3 + k; faces.append((a, a + 1, ((i + 1) % NG) * 3 + k + 1, ((i + 1) % NG) * 3 + k))
    return mesh_object(name, verts, faces, mat, colors=cols, merge=False, parent=root)
ribbon('LowSeam', 0.990, 0.0, M_seam)
M_seamGlow = material('lowSeamGlow', rough=1.0, vcol=True, strength=1.6); M_seamGlow.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.2
ribbon('LowSeamGlow', 1.003, 0.06, M_seamGlow, fade=True)
def above_groove(p): return p.normalized().dot(AX) < math.cos(RHO + 0.03)
tube('SeamChin', [on_sphere(0, a) * 1.0004 for a in range(-27, -86, -1) if above_groove(on_sphere(0, a))], 0.0032, M_earLine, n=10, parent=root)   # a fine seam from under the visor down to the line

# ---------------------------------------------------------------- the ring: close round the body, tilted, banded like a rainbow
RING_R, RING_r, RING_Z, RING_ROT = 1.19, 0.07, -0.27, (math.radians(11), math.radians(-6), 0)   # under the visor at the front, across the foot of the near ear and up behind it, and clear of the bottom cut on the far side
if os.environ.get('RING'):                                       # for trying settings: RING=rho,z,pitch,roll
    _r = [float(v) for v in os.environ['RING'].split(',')]; RING_R, RING_Z, RING_ROT = _r[0], _r[1], (math.radians(_r[2]), math.radians(_r[3]), 0)
LOGO = [(0.0, hexrgb('#ffb000')), (0.1, hexrgb('#b4f000')), (0.2, hexrgb('#19e05a')), (0.32, hexrgb('#00d8ff')), (0.45, hexrgb('#2a5bff')), (0.58, hexrgb('#9b1cf0')), (0.7, hexrgb('#ff2fd0')), (0.82, hexrgb('#ff3a2a')), (0.92, hexrgb('#ff8a00')), (1.0, hexrgb('#ffb000'))]
def logo_ring(name, R, w, h, mat, n=420, m=28, twist=1.0):
    """The ring as the logo's O: a flat glossy band that twists as it goes round, in the logo's deep colours with dark turns."""
    verts, faces, cols = [], [], []; up = Vector((0, 0, 1))
    for i in range(n):
        t = i / n; a = 2 * math.pi * t; out = Vector((math.cos(a), math.sin(a), 0)); tw = twist * a
        for j in range(m):
            b = 2 * math.pi * j / m; x, y = w * math.cos(b), h * math.sin(b)
            x, y = x * math.cos(tw) - y * math.sin(tw), x * math.sin(tw) + y * math.cos(tw)
            verts.append(out * (R + x) + up * y)
            ph = ((a + math.pi) % (2 * math.pi)) - math.pi; c = ramp(LOGO, min(1.0, max(0.0, 1.0 - abs(ph) / math.pi + 0.02 * math.sin(b))));   # mirrored like the reference: yellow on the left side, the same order over the front and the back hl = math.exp(-((((b - 1.1 + math.pi) % (2 * math.pi)) - math.pi) / 0.2) ** 2) * 0.85; c = mix(c, (1, 1, 1), hl)   # a glossy white line along the tube
            shade = 1.0
            cols.append(lin(tuple(v * shade for v in c)))
    for i in range(n):
        for j in range(m): p_ = i * m + j; q_ = i * m + (j + 1) % m; faces.append((p_, q_, ((i + 1) % n) * m + (j + 1) % m, ((i + 1) % n) * m + j))
    return mesh_object(name, verts, faces, mat, colors=cols, parent=root)
ring = logo_ring('Ring', RING_R, 0.07, 0.07, M_ring, twist=0.0)   # a round glossy tube in a bright rainbow, as on the reference
ring.location = (0, 0, RING_Z); ring.rotation_euler = RING_ROT
def ring_point(a_deg):
    a = math.radians(a_deg); m = Matrix.Translation((0, 0, RING_Z)) @ Euler(RING_ROT).to_matrix().to_4x4()
    return m @ Vector((RING_R * math.cos(a), RING_R * math.sin(a), 0))

# ---------------------------------------------------------------- hands: cartoon gloves, built in their own frame (palm at the origin,
# fingers along +Z, palm facing -Y); th = +1 puts the thumb on +X (the character's right hand), -1 on -X (its left hand)
POSES = {
    'open':     dict(f=[(14, 20, 12), (16, 22, 14), (22, 28, 16)], spread=1.3, thumb=((0.85, -0.25, 0.45), (8, 12))),
    'present':  dict(f=[(2, 5, 4), (5, 9, 6), (40, 55, 40)], spread=1.2, thumb=((0.85, -0.1, 0.52), (8, 12))),   # the reference hand: thumb up, two fingers out, the last one curled
    'palm':     dict(f=[(3, 5, 3)] * 3, spread=1.4, thumb=((0.75, -0.35, 0.55), (0, 6))),
    'point':    dict(f=[(0, 0, 0), (90, 105, 75), (90, 105, 75)], spread=0.4, thumb=((0.3, -0.9, 0.4), (30, 34))),
    'thumbsup': dict(f=[(92, 105, 78)] * 3, spread=0.2, thumb=((1.0, -0.2, 0.35), (0, 0))),
    'gun':      dict(f=[(0, 3, 2), (90, 105, 75), (90, 105, 75)], spread=0.3, thumb=((1.0, -0.2, 0.45), (0, 0))),
    'chin':     dict(f=[(22, 20, 10), (86, 100, 72), (88, 102, 74)], spread=0.4, thumb=((0.7, -0.6, 0.45), (8, 8))),
    'pen':      dict(f=[(64, 80, 54), (70, 84, 58), (74, 88, 60)], spread=0.2, thumb=((0.4, -0.85, 0.5), (22, 24))),
}
FING = [(0.092, 0.071, (0.064, 0.05, 0.038), 14), (-0.018, 0.073, (0.064, 0.05, 0.038), 0), (-0.112, 0.067, (0.05, 0.04, 0.032), -14)]   # three fat, rounded fingers and a thumb, as on the reference
HANDS = {}
def frame_from(F, N):
    Z = Vector(F).normalized(); Nn = Vector(N); Y = -(Nn - Z * Nn.dot(Z)).normalized(); X = Y.cross(Z)
    return Matrix((X, Y, Z)).transposed()

def finger_path(base, d0, axis, lengths, curls, steps=10):
    pts = [base.copy()]; p = base.copy(); d = d0.copy()
    for L, c in zip(lengths, curls):
        q = Quaternion(axis, math.radians(c) / 3)
        for k in range(steps):
            if k < 3: d = q @ d                                  # the joint bends over a short, round stretch
            p = p + d * (L / steps); pts.append(p.copy())
    return pts

def hand(name, pose, th, pos, F, N, scale=1.0, Fc=None):
    P = POSES[pose]; e = bpy.data.objects.new(name, None); col.objects.link(e); e.parent = root
    R = frame_from(F, N); e.matrix_basis = Matrix.Translation(pos) @ R.to_4x4() @ Matrix.Scale(scale, 4)
    cf = e                                                       # the cuff can point its own way: the wrist bends
    if Fc is not None:
        cf = bpy.data.objects.new(name + 'CuffFrame', None); col.objects.link(cf); cf.parent = e
        dz = (R.transposed() @ Vector(Fc)).normalized(); q = Vector((0, 0, 1)).rotation_difference(dz)
        cf.matrix_basis = Matrix.Translation((0, 0, -0.03)) @ q.to_matrix().to_4x4() @ Matrix.Translation((0, 0, 0.03))
    parts = [superellipsoid(name + 'Palm', 0.145, 0.11, 0.142, 1.0, 1.0, M_glove, parent=e)]   # a soft, puffy palm, as wide at the wrist as the cuff
    for k, (x, r, lens, spr) in enumerate(FING):
        sp = math.radians(spr * P['spread'] * (1 if th > 0 else -1)); d0 = Vector((math.sin(sp), 0, math.cos(sp)))
        axis = d0.cross(Vector((0, -1, 0))).normalized(); base = Vector((th * x, -0.006, 0.105))
        parts.append(tube(name + 'F%d' % k, finger_path(base, d0, axis, lens, P['f'][min(k, len(P['f']) - 1)]), lambda t, r=r: r * (1 - 0.08 * t), M_glove, n=18, parent=e))
    (tx, ty, tz), tc = P['thumb']; d0 = Vector((th * tx, ty, tz)).normalized(); base = Vector((th * 0.108, -0.015, 0.02))
    axis = d0.cross(Vector((-th * 0.35, -1, 0.1))).normalized()
    parts.append(tube(name + 'Thumb', finger_path(base, d0, axis, (0.082, 0.062), tc), lambda t: 0.074 * (1 - 0.05 * t), M_glove, n=18, parent=e))   # a big, fat thumb
    parts.append(lathe(name + 'Wrist', [(0.0, -0.02), (0.114, -0.02), (0.114, -0.088), (0.112, -0.092)], M_glove, parent=cf, n=64))   # straight, full width: no neck
    parts.append(lathe(name + 'Band', [(0.112, -0.088), (0.1, -0.094), (0.098, -0.112), (0.1, -0.13), (0.114, -0.136)], M_band, parent=cf, n=64))   # the black band: a dark gap, the same width outside
    parts.append(torus(name + 'CuffLight', 0.1155, 0.0065, M_cyan, center=(0, 0, -0.134), n=72, m=10, parent=cf))   # a thin cyan ring on the cuff's edge
    parts.append(torus(name + 'CuffLight2', 0.111, 0.003, M_cyan, center=(0, 0, -0.09), n=72, m=8, parent=cf))   # and a finer one on the glove's edge
    parts.append(lathe(name + 'Cuff', [(0.0, -0.137), (0.112, -0.137), (0.126, -0.141), (0.134, -0.153), (0.134, -0.212), (0.129, -0.234), (0.115, -0.248), (0.085, -0.255), (0.0, -0.256)], M_glove, parent=cf, n=64))   # a longer white cuff: more white
    HANDS[name] = [e] + parts
    return e

def show_hands(names):
    for k, objs in HANDS.items():
        for o in objs: o.hide_render = k not in names

def side_hand(name, s, cuff=(1.0, -0.45, -0.64), pose='present', F=None, N=None, scale=1.17, Fc=None):   # a little smaller, as on the reference sheet
    """A hand at the character's side (s = -1 its right, +1 its left), given by where its cuff ends."""
    F = Vector(F or (s * 0.92, -0.22, 0.3)).normalized(); N = N or ((0.15, -0.72, 0.68) if s > 0 else (0.42, -0.65, 0.64))   # palm up and tilted to the viewer, fingers out to the side
    return hand(name, pose, -s, Vector((s * cuff[0], cuff[1], cuff[2])) + Vector(Fc or F).normalized() * 0.253 * scale, F, N, scale, Fc)

side_hand('TurnR', -1, cuff=tuple(float(v) for v in os.environ.get('FARCUFF', '0.98,-0.8,-0.36').split(','))); side_hand('TurnL', 1, F=(0.897, 0.456, -0.06), N=(0.467, -0.806, 0.36), Fc=(1.0, 0.045, 0.06))   # palm to us, the cuff coming a little toward us   # the near hand lies out flat to the side, palm up to us

# ---------------------------------------------------------------- the face, drawn as light on the visor (the web page draws the same shapes live)
TW = 1400; TH = round(TW * VB / VA); PX = TW / (2 * VA)
def face_image(kind, blush=False):
    SS = 2; im = Image.new('L', (TW * SS, TH * SS), 0); d = ImageDraw.Draw(im)
    def P(x, z): return ((TW / 2 + x * PX) * SS, (TH / 2 - (z - VZ) * PX) * SS)
    def disc(x, z, r, fill=255): (a, b), (c, e) = P(x - r, z + r), P(x + r, z - r); d.ellipse((a, b, c, e), fill=fill)
    def arc(x, z, rx, rz, a0, a1, w, fill=255, taper=0.0):       # a stroke along an ellipse (angles from +x, counter-clockwise), round ends;
        outer, inner, ends = [], [], []                           # taper thins it toward both ends, for a crescent
        for i in range(121):
            u = i / 120; a = math.radians(a0 + (a1 - a0) * u); px, pz = x + rx * math.cos(a), z + rz * math.sin(a)
            nx, nz = rz * math.cos(a), rx * math.sin(a); L = math.hypot(nx, nz); nx, nz = nx / L, nz / L
            ww = w * (1 - taper + taper * math.sin(math.pi * u) ** 0.85)
            outer.append(P(px + nx * ww / 2, pz + nz * ww / 2)); inner.append(P(px - nx * ww / 2, pz - nz * ww / 2))
            if i in (0, 120): ends.append((px, pz, ww))
        d.polygon(outer + inner[::-1], fill=fill)
        for ex, ez, ww in ends: disc(ex, ez, ww / 2, fill)
    def smile(x, z, w, h, sag=0.0):                               # a filled smile: the top edge dips a little, the bottom is a round bowl
        top = [P(x + w / 2 * (2 * k / 60 - 1), z - sag * (1 - (2 * k / 60 - 1) ** 2)) for k in range(61)]
        bot = [P(x + w / 2 * math.cos(math.radians(a)), z - h * math.sin(math.radians(a))) for a in range(0, 181, 3)]
        d.polygon(top + bot, fill=255)
    def rrect(x, z, w, h, r, width):
        (a, b), (c, e) = P(x - w / 2, z + h / 2), P(x + w / 2, z - h / 2); d.rounded_rectangle((a, b, c, e), radius=r * PX * SS, outline=255, width=round(width * PX * SS))
    EX, EZ = 0.345, 0.125
    if kind == 'happy':
        for sx in (-1, 1): arc(sx * 0.335, 0.1, 0.138, 0.098, 6, 174, 0.07, taper=0.1)   # wide, round arches, even thickness, fat round ends   # round arcs, even thickness, fat round ends that come well down
        smile(0, 0.047, 0.25, 0.125, sag=0.03)                                                  # just under the eyes' ends
    elif kind == 'thinking':
        disc(-0.29, EZ, 0.075); disc(0.29, EZ, 0.075)
        arc(-0.31, EZ + 0.06, 0.11, 0.06, 70, 130, 0.035); arc(0.29, EZ + 0.08, 0.1, 0.07, 30, 150, 0.035)
        smile(0.09, -0.09, 0.13, 0.07)
    elif kind == 'idea':
        disc(-0.29, EZ + 0.01, 0.082); disc(0.29, EZ + 0.01, 0.082); smile(0, -0.08, 0.17, 0.09)
    elif kind == 'cool':
        for sx in (-1, 1): rrect(sx * 0.255, EZ, 0.36, 0.23, 0.07, 0.03)
        arc(0, EZ + 0.02, 0.09, 0.05, 30, 150, 0.03); arc(-0.47, EZ + 0.07, 0.07, 0.02, 90, 180, 0.026); arc(0.47, EZ + 0.07, 0.07, 0.02, 0, 90, 0.026)
        smile(0, -0.13, 0.19, 0.09)
    elif kind == 'wink':
        disc(-0.29, EZ, 0.08); arc(0.29, EZ - 0.04, 0.11, 0.09, 20, 160, 0.05); arc(0.405, EZ - 0.02, 0.03, 0.04, 200, 270, 0.04)
        smile(0.05, -0.09, 0.16, 0.085)
    elif kind == 'surprised':
        disc(-0.29, EZ + 0.01, 0.088); disc(0.29, EZ + 0.01, 0.088); disc(0, -0.12, 0.045)
    elif kind == 'neutral':
        disc(-0.29, EZ, 0.08); disc(0.29, EZ, 0.08); smile(0, -0.08, 0.15, 0.075)
    if blush:                                                    # dotted cheeks
        for sx in (-1, 1):
            cx, cz = sx * 0.5, -0.07
            for gx in range(-6, 7):
                for gz in range(-4, 5):
                    x, z = cx + gx * 0.015 + (0.0075 if gz % 2 else 0), cz + gz * 0.013
                    if ((x - cx) / 0.085) ** 2 + ((z - cz) / 0.055) ** 2 <= 1: disc(x, z, 0.0042, fill=150)
    im = im.resize((TW, TH), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(7)).point(lambda v: 255 if v > 127 else 0).filter(ImageFilter.GaussianBlur(0.7))   # every corner softly rounded
    core = im.filter(ImageFilter.GaussianBlur(9)).point(lambda v: 255 if v > 200 else int(v * v / 200 / 1.3)).filter(ImageFilter.GaussianBlur(4)); glow = im.filter(ImageFilter.GaussianBlur(13)).point(lambda v: min(255, int(v * 0.95)))   # a soft, wide glow round the face
    CY = (20, 225, 255)
    layers = [Image.merge('RGB', [m.point(lambda v, k=k: int(v * k / 255)) for k in c]) for m, c in ((glow, CY), (im, CY), (core, (150, 30, 0)))]
    out = ImageChops.add(ImageChops.add(layers[0], layers[1]), layers[2])
    path = os.path.join(OUT, 'face-%s%s.png' % (kind, '-blush' if blush else '')); out.save(path); return path

face_tex = M_visor.node_tree.nodes.new('ShaderNodeTexImage')
M_visor.node_tree.links.new(face_tex.outputs['Color'], M_visor.node_tree.nodes['Principled BSDF'].inputs['Emission Color'])
M_visor.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 2.8
def set_face(kind, blush=False): face_tex.image = bpy.data.images.load(face_image(kind, blush), check_existing=True)

# ---------------------------------------------------------------- studio
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = True
sc.render.film_transparent = True; sc.view_settings.view_transform = 'Standard'; sc.cycles.max_bounces = 6
cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); col.objects.link(cam); sc.camera = cam; cam.data.type = 'ORTHO'
def aim(scale, elev=6, target=(0, 0, 0)):
    cam.data.ortho_scale = scale; e = math.radians(elev); tgt = Vector(target)
    cam.location = tgt + Vector((0, -9 * math.cos(e), 9 * math.sin(e))); cam.rotation_euler = (math.pi / 2 - e, 0, 0)
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; nt = w.node_tree
tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ'); mr = nt.nodes.new('ShaderNodeMapRange'); rp = nt.nodes.new('ShaderNodeValToRGB')
nt.links.new(tc.outputs['Generated'], sep.inputs[0]); nt.links.new(sep.outputs['Z'], mr.inputs['Value']); mr.inputs['From Min'].default_value = -1; nt.links.new(mr.outputs['Result'], rp.inputs['Fac'])
rp.color_ramp.elements[0].color = (0.05, 0.05, 0.07, 1); rp.color_ramp.elements[1].color = (0.55, 0.56, 0.62, 1)
nt.links.new(rp.outputs['Color'], nt.nodes['Background'].inputs['Color']); BG = nt.nodes['Background']; WORLD = 0.6; BG.inputs['Strength'].default_value = WORLD
LIGHTS = []
def light(name, loc, size, energy, color=(1, 1, 1), shape='SQUARE', gloss=True):
    l = bpy.data.lights.new(name, 'AREA'); l.size = size; l.energy = energy; l.color = color; l.shape = shape; o = bpy.data.objects.new(name, l); col.objects.link(o); o.visible_glossy = gloss
    o.location = loc; o.rotation_euler = Vector(loc).to_track_quat('Z', 'Y').to_euler(); LIGHTS.append(o)
light('Key', (-3.2, -4.6, 4.2), 3.0, 380, shape='ELLIPSE'); light('Fill', (5, -3.5, 0.5), 5, 150, gloss=False); light('Front', (0, -7, -1), 6, 90, gloss=False); light('Top', (0.5, -1.5, 6), 2.5, 150, gloss=False); light('Rim', (3, 4, 2), 3, 170); light('RimL', (-4, 3, 1), 3, 130)
light('Blue', (-3, -2, -3), 3, 120, (0.35, 0.45, 1), gloss=False); light('Pink', (3, -2, -3), 3, 120, (1, 0.4, 0.85), gloss=False)

def render(name, res, samples, floor=True):
    """A render with the neon glow: a second, quick pass of the lit parts only is blurred and laid over the first."""
    beauty = os.path.join(OUT, name + '-raw.png'); glow = os.path.join(OUT, name + '-glow.png')
    sc.render.resolution_x = sc.render.resolution_y = res; sc.cycles.samples = samples; sc.cycles.use_denoising = True; sc.render.filepath = beauty; bpy.ops.render.render(write_still=True)
    BG.inputs['Strength'].default_value = 0.0
    for o in LIGHTS: o.hide_render = True
    swapped = []
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.data.materials and o.data.materials[0].name in DARK_IN_GLOW:
            swapped.append((o, o.data.materials[0])); o.data.materials[0] = M_matte
    sc.cycles.samples = 12; sc.cycles.use_denoising = False; sc.render.filepath = glow; bpy.ops.render.render(write_still=True)
    BG.inputs['Strength'].default_value = WORLD
    for o in LIGHTS: o.hide_render = False
    for o, m in swapped: o.data.materials[0] = m
    p = world_to_camera_view(sc, cam, root.matrix_world @ Vector((0, 0, -1.13)))
    fl = (p.x * res, (1 - p.y) * res, 0.78 / cam.data.ortho_scale * res, 0.07 / cam.data.ortho_scale * res) if floor else None
    import json; json.dump(fl, open(os.path.join(OUT, name + '-floor.json'), 'w'))
    sys.path.insert(0, HERE); from comp import composite
    composite(beauty, glow, os.path.join(OUT, name + '.png'), fl); print('rendered', name)

# ---------------------------------------------------------------- shots
def turn(deg): root.rotation_euler = (0, 0, math.radians(deg))
if 'test' in ARGS:
    set_face('happy'); show_hands(['TurnR', 'TurnL']); aim(3.3, 6)
    for nm, deg in (('t-front', 0), ('t-tq', -32), ('t-side', -90), ('t-back', 180)): turn(deg); render(nm, 420, 16)
if 'views' in ARGS:
    set_face('happy'); show_hands(['TurnR', 'TurnL']); aim(3.3, 6)
    for nm, deg in (('view-front', 0), ('view-tq', -32), ('view-side', -90), ('view-back', 180)): turn(deg); render(nm, 640, 56)

if 'hands' in ARGS:                                              # every pose on its own, palm to the camera, to check the gloves
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.parent == root: o.hide_render = True
    for i, pose in enumerate(POSES):
        hand('Test' + pose, pose, 1, Vector((-1.5 + i * 0.5, 0, 0)), (0, 0, 1), (0, -1, 0))
    show_hands(['Test' + p for p in POSES]); turn(0); aim(4.0, 0); sc.render.resolution_x = 1400; sc.render.resolution_y = 400
    sc.cycles.samples = 24; sc.render.filepath = os.path.join(OUT, 'hands.png'); bpy.ops.render.render(write_still=True)

# ---------------------------------------------------------------- the pen, the light stroke, and the hands for the hero and the emotions
def pen_hand(name, s, pos, D, N0=(0.2, 1, 0), scale=1.25):
    """A fist round a marker pen that points along D (cap to nib)."""
    th = -s; X = -Vector(D).normalized() * th; N = Vector(N0); N = (N - X * N.dot(X)).normalized(); Y = -N; F = X.cross(Y)
    e = hand(name, 'pen', th, Vector(pos), F, N, scale)
    pen = bpy.data.objects.new(name + 'Pen', None); col.objects.link(pen); pen.parent = e
    pen.matrix_basis = Matrix.Translation((0, -0.072, 0.1)) @ Euler((0, math.radians(90 * th), 0)).to_matrix().to_4x4()
    parts = [lathe(name + 'PenBody', [(0.0, -0.17), (0.04, -0.17), (0.042, -0.15), (0.042, 0.19), (0.0, 0.19)], M_pen, parent=pen, n=48),
             lathe(name + 'PenCap', [(0.0, 0.19), (0.044, 0.19), (0.044, 0.28), (0.036, 0.3), (0.018, 0.308), (0.0, 0.31)], M_penDark, parent=pen, n=48),
             lathe(name + 'PenTip', [(0.0, -0.165), (0.04, -0.165), (0.03, -0.22), (0.014, -0.262), (0.0, -0.27)], M_penDark, parent=pen, n=48),
             torus(name + 'PenRing1', 0.043, 0.006, M_cyan, center=(0, 0, 0.188), n=48, m=8, parent=pen),
             torus(name + 'PenRing2', 0.042, 0.006, M_cyan, center=(0, 0, -0.152), n=48, m=8, parent=pen)]
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.012, location=(0, 0, -0.268)); nib = bpy.context.object; nib.data.materials.append(M_nib); nib.parent = pen
    HANDS[name] += [pen] + parts + [nib]
    return e, pen

def stroke(name, pts, width, view):
    """A flat light stroke facing the camera, banded like a rainbow across its width."""
    pts = [Vector(p) for p in pts]; m = len(pts); verts, faces, cols = [], [], []; K = 9
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, m - 1)] - pts[max(i - 1, 0)]).normalized(); side = t.cross(view).normalized(); w = width(i / (m - 1))
        for k in range(K):
            u = k / (K - 1); verts.append(p + side * (u - 0.5) * w); cols.append(lin(spectrum(0.56 - 0.78 * u + 0.08 * i / m)))
    for i in range(m - 1):
        for k in range(K - 1): a = i * K + k; faces.append((a, a + 1, a + K + 1, a + K))
    return mesh_object(name, verts, faces, M_stroke, colors=cols, merge=False)

def catmull(ctrl, n=200):
    ctrl = [Vector(c) for c in ctrl]; ctrl = [ctrl[0]] + ctrl + [ctrl[-1]]; out = []
    for i in range(1, len(ctrl) - 2):
        p0, p1, p2, p3 = ctrl[i - 1], ctrl[i], ctrl[i + 1], ctrl[i + 2]
        for k in range(n // (len(ctrl) - 3)):
            t = k / (n // (len(ctrl) - 3)); t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(ctrl[-2]); return out

# emotion hands (character space: front is -Y)
hand('ThinkL', 'chin', -1, Vector((0.3, -1.14, -0.42)), (-0.62, -0.12, 0.78), (0.15, 0.95, -0.1), 1.35)
hand('IdeaL', 'point', -1, Vector((1.26, -0.55, 0.3)), (0.1, -0.2, 1), (-0.35, -0.9, 0.1), 1.45)
hand('CoolR', 'thumbsup', 1, Vector((-0.8, -1.06, -0.42)), (0.4, -0.9, 0), (0.9, 0.4, 0), 1.45)
hand('WinkL', 'gun', -1, Vector((0.84, -1.06, -0.4)), (-0.5, -0.8, 0.3), (-0.8, 0.5, 0), 1.45)
hand('SurpR', 'palm', 1, Vector((-0.56, -1.05, -0.32)), (-0.25, -0.1, 1), (0, -1, 0), 1.15)
hand('SurpL', 'palm', -1, Vector((0.56, -1.05, -0.32)), (0.25, -0.1, 1), (0, -1, 0), 1.15)
EMO_HANDS = {'happy': [], 'thinking': ['ThinkL'], 'idea': ['IdeaL'], 'cool': ['CoolR'], 'wink': ['WinkL'], 'surprised': ['SurpR', 'SurpL']}

if 'views' in ARGS or 'all' in ARGS:
    set_face('happy'); show_hands(['TurnR', 'TurnL']); aim(3.4, 6, (0, 0, -0.08))
    for nm, deg in (('view-front', 0), ('view-tq', -32), ('view-side', -90), ('view-back', 180)): turn(deg); render(nm, 640, 56)
if 'emotions' in ARGS or 'all' in ARGS:
    aim(3.15, 6, (0, 0, -0.06)); turn(-8)
    for kind, hs in EMO_HANDS.items():
        set_face(kind); show_hands(hs); render('emotion-' + kind, 560, 48)
if 'hero' in ARGS or 'all' in ARGS:
    ph, pen = pen_hand('HeroPen', -1, (-0.9, -0.86, 0.02), (-0.5, -0.35, -0.8), scale=1.45)
    side_hand('HeroOpen', 1, cuff=(0.86, -0.55, -0.5), F=(0.9, -0.32, 0.3), N=(-0.15, -0.35, 0.92), scale=1.35)
    turn(-14); set_face('happy', blush=True); show_hands(['HeroPen', 'HeroOpen']); bpy.context.view_layer.update()
    nib = pen.matrix_world @ Vector((0, 0, -0.27))
    view = Vector((0, math.cos(math.radians(6)), -math.sin(math.radians(6))))
    ctrl = [nib, nib + Vector((-0.12, -0.05, -0.2)), nib + Vector((-0.22, -0.1, -0.46)), nib + Vector((-0.12, -0.15, -0.68)), nib + Vector((0.15, -0.2, -0.78)), nib + Vector((0.52, -0.24, -0.8)), nib + Vector((0.92, -0.26, -0.74))]
    stroke('Stroke', catmull(ctrl, 240), lambda t: 0.012 + 0.2 * math.sin(math.pi * min(1, t ** 0.75)) ** 0.9, view)
    aim(3.9, 6, (-0.25, 0, -0.2)); render('hero', 1000, 72)
