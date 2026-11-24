"""Build the model, set the 3/4 hero camera, and report where each hand sits in the picture (in body radii from the body's centre),
how its axes are turned to the camera, and the gaps to the body and the ring (negative = cutting through)."""
import sys, os, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = sys.argv[:1]
G = {'__file__': os.path.join(HERE, 'final.py'), '__name__': 'final'}; exec(open(G['__file__']).read(), G)
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view
sc = bpy.context.scene; cam = G['cam']; M = G['G']
M['turn'](G['HERO_TURN']); G['frame'](); sc.render.resolution_x = sc.render.resolution_y = 1200; bpy.context.view_layer.update()
def px(p): c = world_to_camera_view(sc, cam, Vector(p)); return Vector((c.x * 1200, (1 - c.y) * 1200))
root = bpy.data.objects['Character']; c0 = px(root.matrix_world.translation); R = (px(root.matrix_world @ Vector((0, 0, 1))) - c0).length
view = (cam.matrix_world.to_quaternion() @ Vector((0, 0, -1))).normalized(); right = (cam.matrix_world.to_quaternion() @ Vector((1, 0, 0))).normalized(); up = (cam.matrix_world.to_quaternion() @ Vector((0, 1, 0))).normalized()
print('body centre px', tuple(round(v) for v in c0), 'radius px %.1f' % R)
dg = bpy.context.evaluated_depsgraph_get()
def tree(o):
    e = o.evaluated_get(dg); m = e.to_mesh(); W = o.matrix_world
    t = BVHTree.FromPolygons([W @ v.co for v in m.vertices], [tuple(p.vertices) for p in m.polygons]); e.to_mesh_clear(); return t
def verts(o, step=2):
    e = o.evaluated_get(dg); m = e.to_mesh(); W = o.matrix_world; out = [W @ v.co for i, v in enumerate(m.vertices) if i % step == 0]; e.to_mesh_clear(); return out
bt = tree(bpy.data.objects['Body']); rt = tree(bpy.data.objects['Ring'])
for nm in ('TurnL', 'TurnR'):
    e = bpy.data.objects[nm]; W = e.matrix_world; J = W @ Vector(M['WRIST']); p = px(J)
    print('%s wrist at (%.3f, %.3f) body radii   [reference: near (0.917, -0.603), far (-0.94, -0.524)]' % (nm, (p.x - c0.x) / R, -(p.y - c0.y) / R))
    for lab, o in (('fingers', e), ('cuff', bpy.data.objects[nm + 'CuffFrame'])):
        a = (o.matrix_world.to_quaternion() @ Vector((0, 0, 1))).normalized()
        print('   %-8s toward camera %5.1f deg, in the picture %6.1f deg from the right' % (lab, math.degrees(math.asin(-a.dot(view))), math.degrees(math.atan2(a.dot(up), a.dot(right)))))
    n = -(W.to_quaternion() @ Vector((0, 1, 0))).normalized(); print('   palm faces: toward camera %.2f, up in the picture %.2f, right %.2f' % (-n.dot(view), n.dot(up), n.dot(right)))
    for part in ('Palm', 'Cuff', 'Band', 'CuffLight'):
        o = bpy.data.objects[nm + part]; V = verts(o); gb = min((bt.find_nearest(v)[3] or 9) * (1 if v.length > 1.0 else -1) for v in V); gr = min(rt.find_nearest(v)[3] or 9 for v in V)
        print('   %-10s gap to body %.3f   to ring %.3f' % (part, gb, gr))
