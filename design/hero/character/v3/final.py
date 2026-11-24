"""Final renders of the version 3 character: proper materials, studio lighting, a real soft shadow, on white.
Builds the model with build.py (no shots), then swaps in final materials and a perspective camera.
Run with Blender's Python:  python final.py hero views   (renders go to ./out; preview for a quick look), then  python final_strip.py
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
OUT = G['OUT']; root = G['root']; sc = bpy.context.scene; cam = G['cam']

# ---------------------------------------------------------------- materials
def bsdf(name): return bpy.data.materials[name].node_tree.nodes['Principled BSDF']
def setp(name, **kw):
    b = bsdf(name)
    for k, v in kw.items(): b.inputs[k.replace('_', ' ')].default_value = v
setp('body', Base_Color=(0.85, 0.85, 0.92, 1), Roughness=0.2, Coat_Weight=1.0, Coat_Roughness=0.012)
setp('glove', Base_Color=(0.88, 0.88, 0.91, 1), Roughness=0.48, Coat_Weight=0.2, Coat_Roughness=0.18, Sheen_Weight=0.3, Sheen_Roughness=0.45, Subsurface_Weight=0.08, Subsurface_Scale=0.02)
setp('visor', Base_Color=(0.003, 0.003, 0.005, 1), Roughness=0.05, Coat_Weight=1.0, Coat_Roughness=0.0)
setp('earBlack', Base_Color=(0.004, 0.004, 0.008, 1), Roughness=0.07, Coat_Weight=1.0, Coat_Roughness=0.0)
setp('cuffBand', Base_Color=(0.02, 0.021, 0.026, 1), Roughness=0.28, Coat_Weight=0.9, Coat_Roughness=0.04)

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
neon('lowSeam', 2.6)
setp('headStripe', Roughness=0.3, Coat_Weight=0.25, Coat_Roughness=0.05, Emission_Strength=1.9)   # an even band of light, hard-edged
for nm in ('rim',): setp(nm, Roughness=0.16, Coat_Weight=1.0, Coat_Roughness=0.01)
neon('earRing', 1.7, white=0.0)
rb = bsdf('ring'); rb.inputs['Emission Strength'].default_value = 0.85; rb.inputs['Roughness'].default_value = 0.1; rb.inputs['Coat Weight'].default_value = 1.0; rb.inputs['Coat Roughness'].default_value = 0.0
next(n for n in bpy.data.materials['ring'].node_tree.nodes if n.bl_idname == 'ShaderNodeMix').inputs['B'].default_value = (1, 1, 1, 1)   # the logo ring: glossy, deep colour, not a light tube

for nm in ('LowSeam', 'HeadStripe'): bpy.data.objects[nm].visible_glossy = False   # no smeary reflections of the lights on the body or visor
for o in bpy.data.objects:                                       # the gloves are not mirrored in the visor (no white smudge on the glass)
    if o.name.startswith(('Turn', 'Think', 'Idea', 'Cool', 'Wink', 'Surp', 'Hero')): o.visible_glossy = False
setp('cuffLight', Emission_Strength=5.5)
# ---------------------------------------------------------------- a floor that only catches the shadow
FLOOR = -1.3
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
        l.location = (-3.0 if l.name == 'Blue' else 3.0, -2.6, -1.0); l.rotation_euler = Vector(l.location).to_track_quat('Z', 'Y').to_euler(); l.data.energy = 190
floor_only = bpy.data.collections.new('FloorOnly'); sc.collection.children.link(floor_only); floor_only.objects.link(catcher)
ff = bpy.data.lights.new('FloorFill', 'AREA'); ff.size = 12; ff.energy = 260; ff.use_shadow = False
if hasattr(ff, 'cycles') and hasattr(ff.cycles, 'cast_shadow'): ff.cycles.cast_shadow = False
ffo = bpy.data.objects.new('FloorFill', ff); sc.collection.objects.link(ffo); ffo.location = (0, 0, 4.5); ffo.light_linking.receiver_collection = floor_only   # lifts the floor, so the shadow is softer

# ---------------------------------------------------------------- camera: a real lens, a little above
cam.data.type = 'PERSP'; cam.data.sensor_width = 36
def frame(dist=10.8, elev=8, target=(0, 0, -0.22), lens=85):
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
    fl = (c.x * res, (1 - c.y) * res, abs(c.x - l.x) * res, max(abs(c.y - u.y) * res, 6)) if floor else None
    rgba = os.path.join(OUT, name + '.png'); composite(beauty, glow, rgba, fl, bloom=0.8, shadow=0.42)
    im = Image.open(rgba); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im); bg.convert('RGB').save(os.path.join(OUT, name + '-white.jpg'), quality=93)
    print('rendered', name)

G['set_face']('happy'); G['show_hands'](['TurnR', 'TurnL'])
if 'preview' in SHOTS:
    G['turn'](-22); frame(); shot('final-preview', 480, 48)
if 'top' in SHOTS:                                               # a close look at the top of the head, at full size
    G['turn'](-22); frame(target=(0.19, 0, 0.65), lens=175); shot('final-top', 600, 160, w=1400, floor=False)
if 'face' in SHOTS:                                              # the face, close
    G['turn'](-22); bpy.context.view_layer.update(); fc = root.matrix_world @ Vector((0, -1.0, 0.1))
    frame(target=tuple(fc), lens=250); shot('final-face', 560, 128, w=1080, floor=False)
if 'ear' in SHOTS:                                               # the near ear, close
    G['turn'](-22); bpy.context.view_layer.update(); ec = root.matrix_world @ (G['on_sphere'](G['EAR_LON'], G['EAR_LAT']) * 1.0)
    frame(target=tuple(ec), lens=400); shot('final-ear', 900, 128, w=900, floor=False)
if 'hands' in SHOTS:                                             # both hands, close
    G['turn'](-22); frame(target=(0.0, 0, -0.52), lens=96); shot('final-hands', 700, 90, w=1800, floor=False)
if 'hero' in SHOTS:
    G['turn'](-22); frame(); shot('final-hero', 1200, 110)
if 'views' in SHOTS:
    frame(dist=11.5, elev=6, target=(0, 0, -0.22))
    for nm, deg in (('final-front', 0), ('final-tq', -32), ('final-side', -90), ('final-back', 180)): G['turn'](deg); shot(nm, 900, 96)
if 'hand' in SHOTS:                                              # the near hand alone, close, like the reference crop
    G['turn'](-22); bpy.context.view_layer.update(); hp = bpy.data.objects['TurnLPalm'].matrix_world.translation
    frame(target=tuple(hp + Vector((-0.06, 0, -0.02))), lens=330); shot('final-hand', 620, 64, w=820, floor=False)
