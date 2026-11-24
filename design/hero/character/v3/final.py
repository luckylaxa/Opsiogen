"""Final renders of the version 3 character: proper materials, studio lighting, a real soft shadow, on white.
Builds the model with build.py (no shots), then swaps in final materials and a perspective camera.
Run with Blender's Python:  python final.py hero views   (renders go to ./out; preview for a quick look), then  python final_strip.py
Hands:  python final.py hand farhand poses anim   (close-ups, the six poses, and the frames of a short clip of the near hand moving from pose to pose).
The floor shadow is lightened when the layers are combined (comp.py, shadow=0.42)."""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = sys.argv[1:]; sys.argv = sys.argv[:1]
G = {'__file__': os.path.join(HERE, 'build.py' if os.path.exists(os.path.join(HERE, 'build.py')) else 'build3.py'), '__name__': 'model'}
exec(open(G['__file__']).read(), G)
import bpy, json, numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
from PIL import Image
sys.path.insert(0, HERE); from comp import composite
HERO_TURN = -28                                                  # the reference's 3/4 view is turned about this far
HERO_ELEV = float(os.environ.get('ELEV', 4))                     # and seen from only a little above
OUT = G['OUT']; root = G['root']; sc = bpy.context.scene; cam = G['cam']

# ---------------------------------------------------------------- materials
def bsdf(name): return bpy.data.materials[name].node_tree.nodes['Principled BSDF']
def setp(name, **kw):
    b = bsdf(name)
    for k, v in kw.items(): b.inputs[k.replace('_', ' ')].default_value = v
setp('body', Base_Color=(0.85, 0.85, 0.92, 1), Roughness=0.2, Coat_Weight=1.0, Coat_Roughness=0.012)
setp('glove', Base_Color=(0.9, 0.9, 0.97, 1), Roughness=0.5, Coat_Weight=0.0, Specular_IOR_Level=float(os.environ.get('GLOVESPEC', 0.25)), Coat_Roughness=0.18, Sheen_Weight=float(os.environ.get('GLOVESHEEN', 0.2)), Sheen_Roughness=0.45, Subsurface_Weight=0.08, Subsurface_Scale=0.02)
def glove_shade():
    """The gloves are shaded as on the reference: near white where they face the light (from above and a little toward us), a soft lilac and then mauve where they turn
    away from it, a grey lavender shade on a part that lies behind another, and a fine line right in each fold."""
    nt = bpy.data.materials['glove'].node_tree; b = nt.nodes['Principled BSDF']; N = nt.nodes.new; L = nt.links.new
    def ramp(src, a, c, hi=1.0):
        m = N('ShaderNodeMapRange'); m.inputs['From Min'].default_value = a; m.inputs['From Max'].default_value = c; m.inputs['To Min'].default_value = 0.0; m.inputs['To Max'].default_value = hi; L(src, m.inputs['Value']); return m.outputs['Result']
    def top(p, q): m = N('ShaderNodeMath'); m.operation = 'MAXIMUM'; L(p, m.inputs[0]); L(q, m.inputs[1]); return m.outputs[0]
    def blend(base, col, fac):
        m = N('ShaderNodeMix'); m.data_type = 'RGBA'; m.inputs['B'].default_value = col; L(fac, m.inputs['Factor'])
        if isinstance(base, tuple): m.inputs['A'].default_value = base
        else: L(base, m.inputs['A'])
        return m.outputs['Result']
    geo = N('ShaderNodeNewGeometry'); dot = N('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'; L(geo.outputs['Normal'], dot.inputs[0]); _gl = [float(v) for v in os.environ.get('GLOVELIGHT', '0.05,-0.35,0.93').split(',')]; at = N('ShaderNodeAttribute'); at.attribute_type = 'OBJECT'; at.attribute_name = 'lx'   # each hand is shaded from its own wrist's side: the far hand is the near one's mirror
    mx = N('ShaderNodeMath'); mx.operation = 'MULTIPLY'; mx.inputs[1].default_value = _gl[0]; L(at.outputs['Fac'], mx.inputs[0]); cb = N('ShaderNodeCombineXYZ'); cb.inputs['Y'].default_value = _gl[1]; cb.inputs['Z'].default_value = _gl[2]; L(mx.outputs[0], cb.inputs['X'])
    nm_ = N('ShaderNodeVectorMath'); nm_.operation = 'NORMALIZE'; L(cb.outputs[0], nm_.inputs[0]); L(nm_.outputs['Vector'], dot.inputs[1])
    side = ramp(dot.outputs['Value'], float(os.environ.get('GLOVESIDE', 0.9)), -0.2, float(os.environ.get('GLOVEDOWN', 0.95)))                    # turned away from the light
    ao = N('ShaderNodeAmbientOcclusion'); ao.inputs['Distance'].default_value = float(os.environ.get('GLOVEAO', 0.045)); ao.samples = 12; ao.only_local = True
    tuck = ramp(ao.outputs['AO'], float(os.environ.get('GLOVEAO0', 0.88)), 0.4, float(os.environ.get('GLOVETUCK', 1.0)))
    sx = N('ShaderNodeSeparateXYZ'); L(geo.outputs['Normal'], sx.inputs[0]); up_ = N('ShaderNodeMapRange'); up_.inputs['From Min'].default_value = 0.2; up_.inputs['From Max'].default_value = 0.75; up_.inputs['To Min'].default_value = 1.0; up_.inputs['To Max'].default_value = float(os.environ.get('GLOVETOP', 0.15)); L(sx.outputs['Z'], up_.inputs['Value'])
    tm = N('ShaderNodeMath'); tm.operation = 'MULTIPLY'; L(tuck, tm.inputs[0]); L(up_.outputs['Result'], tm.inputs[1]); tuck = tm.outputs[0]   # the top of a part that lies in front stays bright: the shade is on the part behind it                          # tucked behind another part
    line = ramp(geo.outputs['Pointiness'], 0.455, 0.43, float(os.environ.get('CREASE', 0.0)))                  # right in a fold
    lw = N('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.22; edge = ramp(lw.outputs['Facing'], 0.7, 1.0, 0.12)   # a faint edge, so white stays readable on white
    col = blend((0.915, 0.93, 0.995, 1), (0.74, 0.70, 0.93, 1), top(side, edge)); col = blend(col, (0.56, 0.40, 0.56, 1), ramp(dot.outputs['Value'], -0.05, -0.55, 0.9)); col = blend(col, (0.44, 0.41, 0.55, 1), tuck); col = blend(col, (0.3, 0.26, 0.5, 1), line); L(col, b.inputs['Base Color'])   # the shade under a part that lies in front is a soft grey lavender; only the line right in a fold is deeper
    nz = N('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 900.0; nz.inputs['Detail'].default_value = 2.0; bp = N('ShaderNodeBump'); bp.inputs['Strength'].default_value = float(os.environ.get('GRAIN', 0.015)); bp.inputs['Distance'].default_value = 0.001
    L(nz.outputs['Fac'], bp.inputs['Height']); L(bp.outputs['Normal'], b.inputs['Normal'])                     # a fine grain, like soft leather   # lilac as it turns away, mauve underneath, deeper where tucked
glove_shade()
setp('visor', Base_Color=(0.003, 0.003, 0.005, 1), Roughness=0.05, Coat_Weight=1.0, Coat_Roughness=0.0)
setp('earBlack', Base_Color=(0.004, 0.004, 0.008, 1), Roughness=0.07, Coat_Weight=1.0, Coat_Roughness=0.0)
setp('cuffBand', Base_Color=(0.0, 0.004, 0.01, 1), Roughness=0.5, Coat_Weight=0.0, Specular_IOR_Level=0.12, Emission_Color=(0.0, 0.3, 0.55, 1), Emission_Strength=0.05)   # the wrist ball: deep black, as on the reference

def neon(name, strength, white=0.12):
    """A light tube: deep colour at its edges, a brighter, whiter core where it faces the camera, glossy on top."""
    m = bpy.data.materials[name]; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    vc = next(n for n in nt.nodes if n.bl_idname == 'ShaderNodeVertexColor')
    lw = nt.nodes.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0; nt.links.new(lw.outputs['Facing'], inv.inputs[1])
    pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 4.0; nt.links.new(inv.outputs[0], pw.inputs[0])
    wh = nt.nodes.new('ShaderNodeMath'); wh.operation = 'MULTIPLY'; wh.inputs[1].default_value = white; nt.links.new(pw.outputs[0], wh.inputs[0])
    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['B'].default_value = (1, 1, 1, 1)
    nt.links.new(wh.outputs[0], mx.inputs['Factor']); nt.links.new(vc.outputs['Color'], mx.inputs['A']); nt.links.new(mx.outputs['Result'], b.inputs['Emission Color'])
    st = nt.nodes.new('ShaderNodeMapRange'); st.inputs['To Min'].default_value = strength * 0.6; st.inputs['To Max'].default_value = strength * 1.5
    nt.links.new(inv.outputs[0], st.inputs['Value']); nt.links.new(st.outputs['Result'], b.inputs['Emission Strength'])
    b.inputs['Roughness'].default_value = 0.1; b.inputs['Coat Weight'].default_value = 1.0; b.inputs['Coat Roughness'].default_value = 0.0
bpy.data.materials['visor'].node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.6
neon('lowSeam', 2.8, white=0.05)                                             # the line in the cut glows brightly, as on the first website character
_g = bpy.data.materials['lowSeamGlow']; _gt = _g.node_tree; _vc = next(n for n in _gt.nodes if n.bl_idname == 'ShaderNodeVertexColor')      # the halo only adds light: it never darkens or covers the body under it
_em = _gt.nodes.new('ShaderNodeEmission'); _em.inputs['Strength'].default_value = 0.75; _gt.links.new(_vc.outputs['Color'], _em.inputs['Color'])
_tr = _gt.nodes.new('ShaderNodeBsdfTransparent'); _ad = _gt.nodes.new('ShaderNodeAddShader'); _gt.links.new(_tr.outputs[0], _ad.inputs[0]); _gt.links.new(_em.outputs[0], _ad.inputs[1])
_gt.links.new(_ad.outputs[0], next(n for n in _gt.nodes if n.bl_idname == 'ShaderNodeOutputMaterial').inputs['Surface'])
bpy.data.objects['LowSeamGlow'].visible_shadow = False
setp('headStripe', Roughness=0.3, Coat_Weight=0.25, Coat_Roughness=0.05, Emission_Strength=2.5)   # an even band of light, hard-edged
for nm in ('rim',): setp(nm, Roughness=0.16, Coat_Weight=1.0, Coat_Roughness=0.01)
neon('earRing', 1.7, white=0.0)
rb = bsdf('ring'); rb.inputs['Emission Strength'].default_value = 0.85
_nt = bpy.data.materials['ring'].node_tree; _lp = _nt.nodes.new('ShaderNodeLightPath'); _ma = _nt.nodes.new('ShaderNodeMath'); _ma.operation = 'MULTIPLY_ADD'
_ma.inputs[1].default_value = 2.2; _ma.inputs[2].default_value = 1.1; _nt.links.new(_lp.outputs['Is Diffuse Ray'], _ma.inputs[0]); _nt.links.new(_ma.outputs[0], rb.inputs['Emission Strength'])   # the ring looks the same, but throws more of its colour onto the body, as on the reference
rb.inputs['Emission Strength'].default_value = 0.85; rb.inputs['Roughness'].default_value = 0.1; rb.inputs['Coat Weight'].default_value = 1.0; rb.inputs['Coat Roughness'].default_value = 0.0
next(n for n in bpy.data.materials['ring'].node_tree.nodes if n.bl_idname == 'ShaderNodeMix').inputs['B'].default_value = (1, 1, 1, 1)   # the logo ring: glossy, deep colour, not a light tube

for nm in ('LowSeam', 'LowSeamGlow', 'HeadStripe'): bpy.data.objects[nm].visible_glossy = False   # no smeary reflections of the lights on the body or visor
for o in bpy.data.objects:                                       # the gloves are not mirrored in the visor (no white smudge on the glass)
    if o.name.startswith(('Turn', 'Think', 'Idea', 'Cool', 'Wink', 'Surp', 'Hero')): o.visible_glossy = False
setp('cuffLight', Emission_Strength=3.6)
# ---------------------------------------------------------------- a floor that only catches the shadow
FLOOR = -1.14                                                    # close under the body, as on the reference
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, FLOOR)); catcher = bpy.context.object; catcher.name = 'ShadowCatcher'; catcher.is_shadow_catcher = True
catcher.visible_diffuse = catcher.visible_glossy = catcher.visible_transmission = False      # it adds no light of its own to the character
# only the top light reaches the floor, so there is one soft shadow under the character; the others light the character alone
chars = bpy.data.collections.new('CharacterOnly'); sc.collection.children.link(chars)
for o in bpy.data.objects:
    if o.type == 'MESH' and o is not catcher: chars.objects.link(o)
for l in G['LIGHTS']:
    if l.name == 'Top': l.data.size = 5.0; l.data.energy = 220; l.location = (0, -0.6, 6.5); l.rotation_euler = (0, 0, 0); l.visible_glossy = False
    elif l.name == 'Front':                                      # lights the floor too, without a shadow, so the one shadow stays soft
        for attr in ('use_shadow',):
            if hasattr(l.data, attr): setattr(l.data, attr, False)
        if hasattr(l.data, 'cycles') and hasattr(l.data.cycles, 'cast_shadow'): l.data.cycles.cast_shadow = False
    else: l.light_linking.receiver_collection = chars
    if l.name in ('Blue', 'Pink'):                               # up from under the floor line, for the pearly colour on the body
        l.location = (-3.0 if l.name == 'Blue' else 3.0, -2.6, -1.0); l.rotation_euler = Vector(l.location).to_track_quat('Z', 'Y').to_euler(); l.data.energy = 190 if l.name == 'Blue' else 115   # less pink on the face of the ear and the gloves; the ring adds pink where it passes
_hands = {o.name for objs in G['HANDS'].values() for o in objs if o.type == 'MESH'}                       # the gloves stay a cool white: the pink light and the ring's colour do not fall on them
nohands = bpy.data.collections.new('NoHands'); sc.collection.children.link(nohands)
for o in bpy.data.objects:
    if o.type == 'MESH' and o is not catcher and o.name not in _hands: nohands.objects.link(o)
for l in G['LIGHTS']:
    if l.name == 'Pink': l.light_linking.receiver_collection = nohands
bpy.data.objects['Ring'].light_linking.receiver_collection = nohands
hands_only = bpy.data.collections.new('HandsOnly'); sc.collection.children.link(hands_only)              # the gloves have their own lights, as on the reference: lit from above, soft lilac shade underneath, no shadow from the ring
for o in bpy.data.objects:
    if o.type == 'MESH' and o.name in _hands: hands_only.objects.link(o)
rest = bpy.data.collections.new('NoHandsFloor'); sc.collection.children.link(rest); rest.objects.link(catcher)
for o in nohands.objects: rest.objects.link(o)
for l in G['LIGHTS']: l.light_linking.receiver_collection = rest if l.name in ('Top', 'Front') else nohands   # the character's own lights leave the gloves alone
def hand_light(name, loc, size, energy, color=(1, 1, 1), shadow=True):
    d = bpy.data.lights.new(name, 'AREA'); d.size = size; d.energy = energy; d.color = color; d.use_shadow = shadow
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = Vector(loc).to_track_quat('Z', 'Y').to_euler(); o.visible_glossy = False
    o.light_linking.receiver_collection = hands_only; o.light_linking.blocker_collection = hands_only; G['LIGHTS'].append(o); return o
_hl = [float(v) for v in os.environ.get('HANDLIGHT', '720,110,170').split(',')]
gloves_only = bpy.data.collections.new('GlovesOnly'); sc.collection.children.link(gloves_only)             # the white parts of the hands: they take a soft shine from the main hand light; the black wrist ball does not
glove_near = bpy.data.collections.new('GloveNear'); sc.collection.children.link(glove_near); glove_far = bpy.data.collections.new('GloveFar'); sc.collection.children.link(glove_far)
for o in hands_only.objects:
    if o.data.materials and o.data.materials[0].name == 'glove':
        gloves_only.objects.link(o); far_ = o.name.startswith('TurnR'); o['lx'] = -1.0 if far_ else 1.0; (glove_far if far_ else glove_near).objects.link(o)
_k = hand_light('HandKey', (0.3, -4.4, 6.4), 5.0, _hl[0], shadow=False); _k.light_linking.receiver_collection = glove_near; _k.visible_glossy = True; _k.data.color = (0.95, 1.0, 1.0)
_k2 = hand_light('HandKeyFar', (-0.8, -4.4, 6.4), 5.0, _hl[0] * 1.06, shadow=False); _k2.light_linking.receiver_collection = glove_far; _k2.visible_glossy = True; _k2.data.color = (1.0, 0.975, 0.99)   # the far hand has the same light, mirrored; it gets no warm light back from the body, so its own is a touch warm
#   # a touch cool, against the warm light the ring throws back                                                       # from above, the left and a little in front, as on the reference: the tops of the fingers and the palm are bright
hand_light('HandFront', (0.0, -7.0, 1.0), 6.0, _hl[1], shadow=False).light_linking.receiver_collection = gloves_only                                        # a little from the camera's side
hand_light('HandUnder', (0.8, -3.0, -5.0), 6.0, _hl[2], color=(0.8, 0.72, 0.97), shadow=False).light_linking.receiver_collection = gloves_only               # lilac from underneath, for the shade
floor_only = bpy.data.collections.new('FloorOnly'); sc.collection.children.link(floor_only); floor_only.objects.link(catcher)
ff = bpy.data.lights.new('FloorFill', 'AREA'); ff.size = 12; ff.energy = 260; ff.use_shadow = False
if hasattr(ff, 'cycles') and hasattr(ff.cycles, 'cast_shadow'): ff.cycles.cast_shadow = False
ffo = bpy.data.objects.new('FloorFill', ff); sc.collection.objects.link(ffo); ffo.location = (0, 0, 4.5); ffo.light_linking.receiver_collection = floor_only   # lifts the floor, so the shadow is softer

# ---------------------------------------------------------------- camera: a real lens, a little above
cam.data.type = 'PERSP'; cam.data.sensor_width = 36
def frame(dist=10.8, elev=None, target=(0, 0, -0.22), lens=85):
    elev = HERO_ELEV if elev is None else elev
    cam.data.lens = lens; e = math.radians(elev); t = Vector(target)
    cam.location = t + Vector((0, -dist * math.cos(e), dist * math.sin(e))); cam.rotation_euler = (math.pi / 2 - e, 0, 0)
sc.render.filter_size = 1.0; sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 6; sc.render.film_transparent = True; sc.view_settings.exposure = -0.55

def shot(name, res, samples, w=None, floor=True):
    """Render; a quick pass of the lit parts for the glow; glow and floor glow laid over; flattened onto white."""
    sc.render.resolution_x = w or res; sc.render.resolution_y = res
    beauty = os.path.join(OUT, name + '-raw.png'); glow = os.path.join(OUT, name + '-glow.png')
    sc.cycles.samples = samples; sc.cycles.use_denoising = True; sc.render.filepath = beauty; bpy.ops.render.render(write_still=True)
    BG = G['BG']; BG.inputs['Strength'].default_value = 0.0; catcher.hide_render = True
    for o in G['LIGHTS']: o.hide_render = True
    swapped = []
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.data.materials and o.data.materials[0].name in G['DARK_IN_GLOW']: swapped.append((o, o.data.materials[0])); o.data.materials[0] = bpy.data.materials['matte']
    sc.cycles.samples = 16; sc.cycles.use_denoising = False; sc.render.filepath = glow; bpy.ops.render.render(write_still=True)
    for o, m in swapped: o.data.materials[0] = m
    BG.inputs['Strength'].default_value = G['WORLD']; catcher.hide_render = False
    for o in G['LIGHTS']: o.hide_render = False
    c = world_to_camera_view(sc, cam, Vector((0, 0, FLOOR + 0.02))); l = world_to_camera_view(sc, cam, Vector((-0.8, 0, FLOOR + 0.02))); u = world_to_camera_view(sc, cam, Vector((0, -0.25, FLOOR + 0.02)))
    W_ = sc.render.resolution_x; u = world_to_camera_view(sc, cam, Vector((0, -0.8, FLOOR + 0.02)))
    fl = (c.x * W_, (1 - c.y) * res, abs(c.x - l.x) * W_ * 0.92, max(abs(c.y - u.y) * res * 1.15, 5)) if floor else None   # a flat disc of light on the floor, seen from the camera's height
    rgba = os.path.join(OUT, name + '.png'); composite(beauty, glow, rgba, fl, bloom=0.8, shadow=0.3)
    im = Image.open(rgba); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im); bg.convert('RGB').save(os.path.join(OUT, name + '-white.jpg'), quality=93)
    print('rendered', name)

G['set_face']('happy'); G['show_hands'](['TurnR', 'TurnL'])
if 'preview' in SHOTS:
    G['turn'](HERO_TURN); frame(); shot('final-preview', 480, 48)
if 'top' in SHOTS:                                               # a close look at the top of the head, at full size
    G['turn'](HERO_TURN); frame(target=(0.19, 0, 0.65), lens=175); shot('final-top', 600, 160, w=1400, floor=False)
if 'face' in SHOTS:                                              # the face, close
    G['turn'](HERO_TURN); bpy.context.view_layer.update(); fc = root.matrix_world @ Vector((0, -1.0, 0.1))
    frame(target=tuple(fc), lens=250); shot('final-face', 560, 128, w=1080, floor=False)
if 'ear' in SHOTS:                                               # the near ear, close
    G['turn'](HERO_TURN); bpy.context.view_layer.update(); ec = root.matrix_world @ (G['on_sphere'](G['EAR_LON'], G['EAR_LAT']) * 1.0)
    frame(target=tuple(ec), lens=400); shot('final-ear', 900, 128, w=900, floor=False)
if 'hands' in SHOTS:                                             # both hands, close
    G['turn'](HERO_TURN); frame(target=(0.0, 0, -0.52), lens=96); shot('final-hands', 700, 90, w=1800, floor=False)
if 'hero' in SHOTS:
    G['turn'](HERO_TURN); frame(); shot('final-hero', 1200, 110)
if 'views' in SHOTS:
    frame(dist=11.5, elev=6, target=(0, 0, -0.22))
    for nm, deg in (('final-front', 0), ('final-tq', -32), ('final-side', -78), ('final-back', 180)): G['turn'](deg); shot(nm, 900, 96)   # the reference's side view is turned a little toward the front
def hand_shot(name, palm, res, samples, off=(0.056, 0, 0.0486), lens=620):   # one hand alone, close, framed like the clear reference picture of it
    G['turn'](HERO_TURN); bpy.context.view_layer.update(); e = bpy.data.objects[palm].parent; hp = e.matrix_world.translation
    frame(target=tuple(hp + Vector(off)), lens=lens); shot(name, res, samples, w=int(res * 1457 / 1079), floor=False)
    J = e.matrix_world @ Vector(G['WRIST']); up = cam.matrix_world.to_quaternion() @ Vector((0, 1, 0)); W_, H_ = sc.render.resolution_x, sc.render.resolution_y   # where the wrist is and how big the cuff's ring is, to lay it over the reference
    c = world_to_camera_view(sc, cam, J); c2 = world_to_camera_view(sc, cam, J + up * 0.122 * e.matrix_world.to_scale().x)
    json.dump({'J': [c.x * W_, (1 - c.y) * H_], 'a': abs(c2.y - c.y) * H_}, open(os.path.join(OUT, name + '.json'), 'w'))
if 'hand' in SHOTS: hand_shot('final-hand', 'TurnLPalm', 1079, 80)
if 'handlo' in SHOTS: hand_shot('lo-hand', 'TurnLPalm', 430, 20)
if 'handmid' in SHOTS: hand_shot('mid-hand', 'TurnLPalm', 760, 40)
if 'farhand' in SHOTS: hand_shot('final-farhand', 'TurnRPalm', 1079, 80, off=(-0.056, 0, 0.0486))
if 'farhandlo' in SHOTS: hand_shot('lo-farhand', 'TurnRPalm', 430, 20, off=(-0.056, 0, 0.0486))
POSE_NAMES = ('open', 'wave', 'point', 'thumbsup', 'hold', 'fist')
if 'poses' in SHOTS:                                             # the near hand in each of its poses: the same glove, only its joints are turned
    rig, th = G['RIGS']['TurnL']
    for nm in POSE_NAMES: G['pose_glove'](rig, th, G['HAND_POSES'][nm]); hand_shot('pose-' + nm, 'TurnLPalm', 620, 36)
    G['pose_glove'](rig, th, G['HAND_POSES'][G['POSES']['open']['jointed']])
if 'anim' in SHOTS:                                              # a short clip of the near hand moving from pose to pose, to show the fingers bend at their joints
    rig, th = G['RIGS']['TurnL']; os.makedirs(os.path.join(OUT, 'anim'), exist_ok=True); fr = 1; HOLD, MOVE = 5, 9
    for nm in ('open', 'wave', 'open', 'point', 'thumbsup', 'hold', 'fist', 'open'):
        G['pose_glove'](rig, th, G['HAND_POSES'][nm], frame=fr); G['pose_glove'](rig, th, G['HAND_POSES'][nm], frame=fr + HOLD); fr += HOLD + MOVE
    for k in range(1, fr - MOVE + 1): sc.frame_set(k); hand_shot('anim/%04d' % k, 'TurnLPalm', 400, 16)
    sc.frame_set(1)
def region(name, res, samples):                                  # the near ear with the head above it and the ring below, framed like the reference crop
    G['turn'](HERO_TURN); frame(); bpy.context.view_layer.update(); sc.render.resolution_x = sc.render.resolution_y = res
    cup = bpy.data.objects['EarCupL']; M = cup.matrix_world; P = [world_to_camera_view(sc, cam, M @ v.co) for v in cup.data.vertices]
    x0, x1, y0, y1 = min(p.x for p in P), max(p.x for p in P), min(p.y for p in P), max(p.y for p in P); w, h = x1 - x0, y1 - y0
    sc.render.use_border = True; sc.render.use_crop_to_border = True
    sc.render.border_min_x, sc.render.border_max_x, sc.render.border_min_y, sc.render.border_max_y = x0 - 0.2 * w, x1 + 0.094 * w, y0 - 0.524 * h, y1 + 0.6 * h
    shot(name, res, samples, floor=False)
    sc.render.use_border = False; sc.render.use_crop_to_border = False
if 'region' in SHOTS: region('final-region', 3000, 96)
if 'regionlo' in SHOTS: region('lo-region', 1800, 24)
if 'viewslo' in SHOTS:                                           # quick four views, to compare proportions with the reference sheet
    frame(dist=11.5, elev=6, target=(0, 0, -0.22))
    for nm, deg in (('lo-front', 0), ('lo-tq', -32), ('lo-side', -78), ('lo-back', 180)): G['turn'](deg); shot(nm, 600, 40)   # the reference's side view is turned a little toward the front
for _t in [s for s in SHOTS if s.startswith('turn')]:            # quick 3/4 tests at a given turn, e.g. turn30
    G['turn'](-float(_t[4:])); frame(); shot('lo-' + _t, 600, 32)
for _t in [s for s in SHOTS if s.startswith('elev')]:            # quick 3/4 tests at a given camera height, e.g. elev3
    G['turn'](HERO_TURN); frame(elev=float(_t[4:])); shot('lo-' + _t, 600, 32)
if 'bottom' in SHOTS:                                            # the bottom of the body from the four angles of the first website character's views
    for nm, deg in (('bot-front', 0), ('bot-left', 45), ('bot-backleft', -115), ('bot-back', 180)):
        G['turn'](deg); frame(target=(0, 0, -0.66), lens=135); shot(nm, 460, 40, w=1000)
if 'blend' in SHOTS:                                             # the model as a Blender file, with its materials, lights and camera, to open in Blender
    G['turn'](HERO_TURN); frame(); bpy.ops.file.pack_all(); bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'character-v3.blend'), compress=True); print('saved blend')
