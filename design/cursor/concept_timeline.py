"""The cursor concept's timeline, in the Home hero at 1440x900 (or `close`: larger, on a plain backdrop): frame states for door-frames.cjs (door3d.js) and the 2D
layer (the visitor's arrow, the link ring, the click ripple) for concept_film.py.
Usage: [PARTS=n] python3 concept_timeline.py BG_JSON|close OUT_DIR [fps] [only: comma-separated times in s, for a quick check]"""
import json, math, sys, os
OUT = sys.argv[2]; FPS = int(sys.argv[3]) if len(sys.argv) > 3 else 60
ONLY = [float(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 and sys.argv[4] else None
CLOSE = sys.argv[1] == 'close'                   # 'close': the same moves, larger, on a plain backdrop (to judge the door)
if CLOSE:
    W, H, CX, CY, PPU = 1280, 720, 900.0, 300.0, 170.0; lx, ly, lw, lh = -999, -999, 1, 1
else:
    bg = json.load(open(sys.argv[1])); bx, by, bw, _ = bg['box']; lx, ly, lw, lh = bg['link']
    W, H = 1440, 900; CX, CY = bx + bw / 2, by + bw / 2; PPU = (bw / 2) / (6.75 * math.tan(math.radians(10)))      # the hero camera's scale
FLOOR = -1.30                                    # where the hero's pool of light lies, in body radii below its middle
MINI = 0.28                                      # the mini's size (about 36 px across on Home: cursor size)
D = 3.75 if CLOSE else 6.3                       # the whole film, seconds
clamp = lambda v, a=0.0, b=1.0: max(a, min(b, v))
def ease(q): q = clamp(q); return q * q * (3 - 2 * q)
def io(q): q = clamp(q); return 0.5 - 0.5 * math.cos(math.pi * q)
def out(q): q = clamp(q); return 1 - (1 - q) ** 3
def seg(t, a, b): return clamp((t - a) / (b - a))
def lerp(a, b, k): return [x + (y - x) * k for x, y in zip(a, b)] if isinstance(a, (list, tuple)) else a + (b - a) * k
def to_world(px, py): return [(px - CX) / PPU, -(py - CY) / PPU, 0.0]
def to_px(w): return [CX + w[0] * PPU, CY - w[1] * PPU]
# the bay's middle, inside the body (the opening's axis), turned with the character (Euler YXZ, as door3d.js)
AX = [-0.18990608, -0.93358043, -0.30391326]
def turn(v, yaw, pitch):
    x, y, z = v; cy, sy, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
    y, z = y * cp - z * sp, y * sp + z * cp          # pitch about X
    x, z = x * cy + z * sy, -x * sy + z * cy         # then yaw about Y
    return [x, y, z]
P_ENTER, P_REST = ((120, 640), (330, 300)) if CLOSE else ((300, 780), (560, 470))   # the visitor's pointer: comes in, then rests
BTN = (lx + lw / 2, ly + lh / 2)                    # "See our work"
OFF = (46 * PPU / 63.51, 40 * PPU / 63.51)          # the mini floats below right of the pointer, like an arrow's tail
def aim_at(mpos, target, turn=math.radians(44)):
    """Yaw and pitch that point the mini's eye at a spot on the screen: mostly sideways (so it is seen side on) and a
    little toward the viewer (so the lens still shows). Returns (yaw, pitch, front vector)."""
    mx, my, mz = mpos; d = 6.75; v = [-mx, -my, d - mz]; vl = math.hypot(*v); v = [c / vl for c in v]
    p = to_px(mpos); dx, dy = target[0] - p[0], target[1] - p[1]; dl = math.hypot(dx, dy) or 1
    s = [dx / dl, -dy / dl, 0.0]
    F = [math.cos(turn) * v[i] + math.sin(turn) * s[i] for i in range(3)]; fl = math.hypot(*F); F = [c / fl for c in F]
    return math.atan2(F[0], F[2]), math.asin(-F[1]), F
def pointer(t):
    if t < 0.7: k = out(t / 0.7); return lerp(P_ENTER, P_REST, k)
    if t < 3.9: return list(P_REST)
    k = io(seg(t, 3.9, 4.5)); return lerp(P_REST, BTN, k)
def trail(t):
    """Where the mini sits relative to the pointer: below right at rest; while the pointer moves it swings round
    behind it (opposite the way it moves), orbiting over the top, so it never crosses the pointer and the light never
    shrinks to nothing. Speed and direction are smoothed over the last 0.12 s."""
    a, b = pointer(max(0, t - 0.12)), pointer(t)
    vx, vy = (b[0] - a[0]) / 0.12, (b[1] - a[1]) / 0.12; sp = math.hypot(vx, vy)
    ol, th0 = math.hypot(*OFF), math.atan2(OFF[1], OFF[0])
    if sp < 1e-3: return list(OFF)
    w = ease(clamp(sp / 450.0)) * 0.9
    dth = (math.atan2(-vy, -vx) - th0 + math.pi) % (2 * math.pi) - math.pi
    if abs(abs(dth) - math.pi) < 0.4: dth = -abs(dth)            # nearly opposite: always round over the top
    th = th0 + w * dth
    return [math.cos(th) * ol, math.sin(th) * ol]
def over_link(t):
    p = pointer(max(0, t - 0.06)); return abs(p[0] - BTN[0]) < lw / 2 and abs(p[1] - BTN[1]) < lh / 2
HOVER = next((3.4 + i / 240 for i in range(int(2.4 * 240)) if over_link(3.4 + i / 240)), None)   # when the mini reaches the link
def state(t):
    # the main character: notices the pointer, turns its eye that way, then opens its underside
    look = io(seg(t, 0.45, 0.85)) - 0.35 * io(seg(t, 2.6, 3.3))
    yaw, pitch = -0.42 * look, -0.10 * look
    blink = seg(t, 0.62, 1.02) if 0.62 <= t <= 1.02 else 0
    door = io(seg(t, 0.95, 1.35)) * (1 - io(seg(t, 2.05, 2.45)))
    bay = door; beam = 0.5 * ease(seg(t, 1.1, 1.35)) * (1 - ease(seg(t, 1.95, 2.25)))
    st = {'site': {'cx': CX, 'cy': CY, 'ppu': PPU}, 'yaw': yaw, 'pitch': pitch, 'blink': blink, 'look': [-0.6 * look, -0.3 * look],
          'door': door, 'bay': bay, 'beam': beam, 'floor': FLOOR, 'mainPool': 0, 'miniPool': 0}
    m = {'show': False}
    inside = turn([a * 0.42 for a in AX], yaw, pitch)                      # in the bay
    land = [inside[0], FLOOR + MINI, 0.15]                                  # on the floor below the opening
    rolled = [land[0] - 0.62, land[1], land[2]]                             # after rolling out toward the page
    rest = to_world(P_REST[0] + OFF[0], P_REST[1] + OFF[1])
    if t >= 1.2:
        m = {'show': True, 'scale': MINI, 'yaw': 0.0, 'pitch': 0.0, 'roll': 0.0, 'blink': 0}
        if t < 1.95:                                                        # lowered in the beam, turning once
            k = io(seg(t, 1.3, 1.95)); m['pos'] = lerp(inside, land, k); m['yaw'] = 2 * math.pi * k
        elif t < 2.25:                                                      # lands: tips and rocks (solid, no squash)
            m['pos'] = land; q = seg(t, 1.95, 2.25); m['roll'] = math.radians(-9) * math.sin(q * math.pi * 2) * (1 - q)
        elif t < 2.65:                                                      # rolls out toward the page
            k = io(seg(t, 2.25, 2.65)); m['pos'] = lerp(land, rolled, k); m['roll'] = (0.62 * k) / MINI   # roll = distance / radius
        elif t < 3.4:                                                       # hops up and flies to the pointer, on an arc
            k = io(seg(t, 2.65, 3.4)); a, b = rolled, rest
            mid = [(a[0] + b[0]) / 2, max(a[1], b[1]) + 1.4, 0.4]
            m['pos'] = [(1 - k) ** 2 * a[i] + 2 * (1 - k) * k * mid[i] + k * k * b[i] for i in range(3)]
            m['roll'] = 0.62 / MINI * (1 - io(seg(t, 2.65, 3.0)))       # stops rolling as it lifts off
            m['yaw'] = -2 * math.pi * k                                     # one turn on the way, ending face on
            m['look'] = [-0.8 * math.sin(math.pi * k), -0.5 * math.sin(math.pi * k)]
        else:                                                               # the guide: floats beside the pointer, lagging a little
            tip = pointer(t); u = t - 3.4
            bob = 3.2 * math.sin(u * 2 * math.pi * 0.75) * PPU / 63.51       # a slow, small float
            nudge = 5 * math.sin(math.pi * seg(t, 4.86, 5.08)) * PPU / 63.51 # on the click it nudges toward the spot
            # it trails the pointer like a comet's tail while the pointer moves, and settles back below right when it stops
            rel = trail(t); pos_px = [tip[0] + rel[0], tip[1] + rel[1] + bob]
            dx, dy = tip[0] - pos_px[0], tip[1] - pos_px[1]; dl = math.hypot(dx, dy) or 1
            pos_px = [pos_px[0] + dx / dl * nudge, pos_px[1] + dy / dl * nudge]
            m['pos'] = to_world(*pos_px)
            yaw, pitch, F = aim_at(m['pos'], tip)
            m['yaw'], m['pitch'], m['face'] = yaw, pitch, 0.0
            m['roll'] = math.radians(6) * math.sin(u * 2 * math.pi * 0.55 + 0.8)   # and a gentle rock
            m['F'] = F
        st['miniPool'] = 0.7 * (1 - ease(seg(t, 2.6, 2.9))) if 1.5 <= t else 0
        if t < 1.5: st['miniPool'] = 0
    if m.get('show') and t >= 1.95:                                         # out of the bay: its own view, so it stays round,
        m['solo'] = True
        if t < 3.4: m['face'] = io(seg(t, 2.3, 2.9))                        # and it turns to face the viewer as it lifts off
        if 3.0 <= t < 3.4:                                                  # then, arriving, it turns its eye to the pointer
            k = io(seg(t, 3.0, 3.4)); yaw, pitch, F = aim_at(m['pos'], pointer(t))
            m['yaw'], m['pitch'], m['face'] = k * yaw + (1 - k) * m.get('yaw', 0), k * pitch, 1 - k
    st['mini'] = m
    # the 2D layer: the visitor's own pointer until the mini takes over, the ring over the link, the click ripple
    ov = {'arrow': pointer(t) if t < 3.4 else None, 'arrowFade': 1 - seg(t, 3.25, 3.4)}
    if m.get('show') and t >= 3.25:
        tip = pointer(t); c = to_px(m['pos']); F = m.get('F') or aim_at(m['pos'], tip)[2]
        r_px = MINI * PPU * 6.75 / (6.75 - m['pos'][2])
        lens = [c[0] + F[0] * r_px * 0.92, c[1] - F[1] * r_px * 0.92]
        flash = 1 + 0.9 * math.sin(math.pi * seg(t, 4.86, 5.2))
        ov['beam'] = {'from': lens, 'to': tip, 'k': out(seg(t, 3.3, 3.48)), 'glow': flash}
        ov['r0'] = 7 * PPU / 63.51                                          # the ripples start at the light's dot
        if HOVER is not None and t >= HOVER and not 4.86 <= t <= 5.9: ov['hover'] = {'c': tip, 't0': HOVER if t < 4.86 else 5.9}
        if 4.9 <= t <= 5.75: ov['spray'] = {'c': list(tip), 'k': seg(t, 4.9, 5.75)}   # the click: colour sprayed from the dot
    return st, ov
times = ONLY if ONLY is not None else [i / FPS for i in range(int(D * FPS) + 1)]
frames, overlays = [], []
for i, t in enumerate(times):
    st, ov = state(t); name = f'f{i:04d}.png'
    frames.append({'name': name, 'state': st}); overlays.append({'name': name, 't': t, **ov})
os.makedirs(OUT, exist_ok=True)
json.dump({'w': W, 'h': H, 'frames': frames}, open(os.path.join(OUT, 'job.json'), 'w'))
for part in range(PARTS := int(os.environ.get('PARTS', '1'))):                  # split for renders run side by side
    json.dump({'w': W, 'h': H, 'frames': frames[part::PARTS]}, open(os.path.join(OUT, f'job-{part}.json'), 'w'))
json.dump({'fps': FPS, 'overlays': overlays, 'center': [CX, CY], 'ppu': PPU}, open(os.path.join(OUT, 'overlay.json'), 'w'))
print(len(frames), 'frames; character at', round(CX), round(CY), 'ppu', round(PPU, 2))
