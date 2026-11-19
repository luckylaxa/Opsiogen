"""The cursor-and-dock concept (Lucky, 19 Nov): the main character itself is the mouse pointer, scaled down, with its
home (the dock) where it lands after the intro, at the lower right. Picks up where the intro ends: the character sits
in its dock; the visitor moves the mouse and it shrinks and flies to the pointer; filled ripples over a link; a click
on empty hero space turns its eye to it, sprays light and the hero's colours change (the real hero:pulse, as the big
character does today); it stays the pointer down the page ("View" over work); hovering the dock brings it home at
full size while a small dot points; moving away sends it back to the pointer.
Usage: [PARTS=n] python3 dock_timeline.py BG_DIR OUT_DIR [fps] [only: times in s]"""
import json, math, sys, os
BG, OUT = sys.argv[1], sys.argv[2]; FPS = int(sys.argv[3]) if len(sys.argv) > 3 else 60
ONLY = [float(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 and sys.argv[4] else None
bg = json.load(open(os.path.join(BG, 'dock-bg.json')))
bx, by, bw, _ = bg['box']; lx, ly, lw, lh = bg['link']; kx, ky, kw, kh = bg['card']
CX, CY = bx + bw / 2, by + bw / 2; PPU = (bw / 2) / (6.75 * math.tan(math.radians(10)))
BIG, SMALL = PPU * 1.0, PPU * 0.28                  # the character's radius at home and as the pointer (px)
D = 10.5
clamp = lambda v, a=0.0, b=1.0: max(a, min(b, v))
def ease(q): q = clamp(q); return q * q * (3 - 2 * q)
def io(q): q = clamp(q); return 0.5 - 0.5 * math.cos(math.pi * q)
def out(q): q = clamp(q); return 1 - (1 - q) ** 3
def seg(t, a, b): return clamp((t - a) / (b - a))
def lerp(a, b, k): return [x + (y - x) * k for x, y in zip(a, b)]
BTN, CLICK, DOCK = (lx + lw / 2, ly + lh / 2), tuple(bg['click']), (CX, CY)
CARD = (kx + kw * 0.45, ky + kh * 0.42)
# the visitor's pointer, in screen pixels
PATH = [(0.0, (380, 760)), (0.7, (620, 430)), (1.45, (620, 430)), (2.15, BTN), (2.2, BTN), (2.85, CLICK), (5.85, CLICK),
        (6.55, CARD), (6.6, CARD), (7.35, (DOCK[0] - 14, DOCK[1] + 6)), (8.3, (DOCK[0] - 14, DOCK[1] + 6)), (8.7, (DOCK[0] + 40, DOCK[1] - 50)),
        (9.15, (DOCK[0] + 40, DOCK[1] - 50)), (9.85, (900, 450)), (D, (900, 450))]
def pointer(t):
    for (t0, a), (t1, b) in zip(PATH, PATH[1:]):
        if t <= t1: return lerp(a, b, io(seg(t, t0, t1)))
    return list(PATH[-1][1])
def arc(a, b, k, lift):                            # a hop from a to b, through a point lifted above the middle
    mid = [(a[0] + b[0]) / 2, min(a[1], b[1]) - lift]
    return [(1 - k) ** 2 * a[i] + 2 * (1 - k) * k * mid[i] + k * k * b[i] for i in range(2)]
LEAVE, HOME, BACK = (0.75, 1.45), (7.65, 8.25), (9.4, 9.95)
def follow(t):                                     # the pointer character: a step behind the pointer
    return pointer(max(0.0, t - 0.07))
def state(t):
    ov = {'t': t}
    # where the character is, how big, and how it turns
    if t < LEAVE[0]:
        c, r = list(DOCK), BIG
    elif t < LEAVE[1]:
        k = io(seg(t, *LEAVE)); c = arc(DOCK, follow(t), k, 160); r = BIG + (SMALL - BIG) * out(k)
    elif t < HOME[0]:
        c, r = follow(t), SMALL
    elif t < BACK[0]:
        k = io(seg(t, *HOME)); c = arc(follow(t), DOCK, k, 90) if t < HOME[1] else list(DOCK); r = SMALL + (BIG - SMALL) * out(k)
    else:
        k = io(seg(t, *BACK)); c = arc(DOCK, follow(t), k, 110); r = BIG + (SMALL - BIG) * out(k)
    # it looks where things are: at the pointer from home, the way it moves as the pointer
    p = pointer(t); mv = [p[0] - pointer(t - 0.05)[0], p[1] - pointer(t - 0.05)[1]]
    if r > SMALL * 1.5: lk = [clamp((p[0] - c[0]) / 300, -1, 1), clamp((p[1] - c[1]) / 300, -1, 1)]
    else: lk = [clamp(mv[0] / 25, -1, 1), clamp(mv[1] / 25, -1, 1)]
    yaw = pitch = 0.0
    for a, b in (LEAVE, HOME, BACK):              # one turn on each flight
        if a <= t < b: yaw = -2 * math.pi * io(seg(t, a, b))
    press = io(seg(t, 2.9, 3.05)) * (1 - io(seg(t, 3.5, 3.85)))   # the click: its eye turns down to the spot
    pitch += 1.1 * press
    roll = math.radians(4) * math.sin(t * 2 * math.pi * 0.6) * (1 if r < SMALL * 1.5 else 0.4)
    hover = 0.05 * r * math.sin(t * 2 * math.pi * 0.7)
    m = {'show': True, 'solo': True, 'pos': [(c[0] - CX) / PPU, -(c[1] + hover - CY) / PPU, 0.0], 'scale': r / PPU,
         'yaw': yaw, 'pitch': pitch, 'roll': roll, 'face': 1.0, 'look': lk, 'blink': seg(t, 0.42, 0.82) if 0.42 <= t <= 0.82 else 0}
    st = {'site': {'cx': CX, 'cy': CY, 'ppu': PPU}, 'hideMain': True, 'mini': m, 'door': 0, 'bay': 0, 'beam': 0, 'mainPool': 0, 'miniPool': 0}
    # the backdrop: the first screen, the real colour change after the click, the scroll, the work
    if t < 3.05: ov['bg'] = 'hero-a.png'
    elif t < 4.6: ov['bg'] = f"pulse-{min(bg['pulseFrames'] - 1, int((t - 3.05) * bg['fps'])):03d}.png"
    elif t < 5.85: ov['bg'] = f"scroll-{min(bg['scrollFrames'] - 1, int((t - 4.6) * bg['fps'])):03d}.png"
    else: ov['bg'] = 'scrolled.png'
    ov['dockPad'] = clamp((t - 4.75) / 0.4) if t >= 4.6 else 0     # once the hero's own pool scrolls away, the dock shows its own
    ov['dockLit'] = ease(seg(t, 7.35, 7.65)) * (1 - ease(seg(t, 9.4, 9.7)))
    ov['arrow'] = p if t < LEAVE[1] else None; ov['arrowFade'] = 1 - seg(t, 1.3, 1.45)
    ov['dot'] = p if HOME[0] <= t < BACK[1] - 0.05 else None
    ov['char'] = c; ov['r'] = r
    over_btn = abs(p[0] - BTN[0]) < lw / 2 and abs(p[1] - BTN[1]) < lh / 2 and 1.9 <= t < 2.25
    over_card = 6.3 <= t < 6.75
    if over_btn or over_card: ov['ripple'] = {'c': c, 't0': 1.95 if over_btn else 6.35}
    if over_card: ov['view'] = {'c': c, 'k': ease(seg(t, 6.3, 6.45)) * (1 - ease(seg(t, 6.6, 6.75)))}
    if 3.05 <= t <= 3.9: ov['spray'] = {'c': [CLICK[0], CLICK[1] + 4], 'k': seg(t, 3.05, 3.9)}
    return st, ov
times = ONLY if ONLY is not None else [i / FPS for i in range(int(D * FPS) + 1)]
frames, overlays = [], []
for i, t in enumerate(times):
    st, ov = state(t); name = f'f{i:04d}.png'; frames.append({'name': name, 'state': st}); overlays.append({'name': name, **ov})
os.makedirs(OUT, exist_ok=True)
json.dump({'w': 1440, 'h': 900, 'frames': frames}, open(os.path.join(OUT, 'job.json'), 'w'))
for part in range(PARTS := int(os.environ.get('PARTS', '1'))):
    json.dump({'w': 1440, 'h': 900, 'frames': frames[part::PARTS]}, open(os.path.join(OUT, f'job-{part}.json'), 'w'))
json.dump({'fps': FPS, 'overlays': overlays, 'bg': BG}, open(os.path.join(OUT, 'overlay.json'), 'w'))
print(len(frames), 'frames')
