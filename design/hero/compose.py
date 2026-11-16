"""Place our real work on the blank screens and poster frames of the hero concept stills."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
P = '../../public/'
def coeffs(src, dst):
    A = []; B = []
    for (x, y), (u, v) in zip(src, dst):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float))
def cover(im, ratio):
    w, h = im.size
    if w / h > ratio: nw = int(h * ratio); x = (w - nw) // 2; return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio); y = (h - nh) // 2; return im.crop((0, y, w, y + nh))
def flow(name, inset=(0.06, 0.04)):
    im = Image.open(P + name).convert('RGB'); w, h = im.size
    return im.crop((int(w * inset[0]), int(h * inset[1]), int(w * (1 - inset[0])), int(h * (1 - inset[1]))))
def place(base, art, quad, mode='screen', thr=225, grow=2, ref=None, exclude=(), soft=None):
    """quad: TL, TR, BR, BL. screen = shows where the photo is white; paper = takes the paper's shading."""
    W, H = base.size; ss = 3
    qw = (np.hypot(quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]) + np.hypot(quad[2][0] - quad[3][0], quad[2][1] - quad[3][1])) / 2
    qh = (np.hypot(quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]) + np.hypot(quad[2][0] - quad[1][0], quad[2][1] - quad[1][1])) / 2
    art = cover(art, qw / qh); aw, ah = art.size
    q = [(x * ss, y * ss) for x, y in quad]
    w = art.transform((W * ss, H * ss), Image.PERSPECTIVE, coeffs(q, [(0, 0), (aw, 0), (aw, ah), (0, ah)]), Image.BICUBIC).resize((W, H), Image.LANCZOS)
    c = np.mean(np.array(quad, float), axis=0)
    gq = [tuple(c + (np.array(p, float) - c) * (1 + grow / np.linalg.norm(np.array(p, float) - c))) for p in quad]
    pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).polygon(gq, fill=255); pm = np.array(pm) > 0
    for poly in exclude:  # something in front of this surface
        ex = Image.new('L', (W, H), 0); ImageDraw.Draw(ex).polygon(poly, fill=255); pm &= ~(np.array(ex) > 0)
    b = np.array(base).astype(float)
    if mode == 'screen':
        m = pm & (np.array(ref if ref is not None else base).astype(float).min(axis=2) > thr)  # white in the untouched photo
        al = np.array(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))).astype(float)[..., None] / 255
        if soft:  # glass in front of the screen: the design shows through it, tinted
            mn = np.array(ref if ref is not None else base).astype(float).min(axis=2)
            al = (np.clip((mn - soft[0]) / (soft[1] - soft[0]), 0, 1) * pm)[..., None]
        out = b * (1 - al) + np.array(w).astype(float) * 0.96 * al
    else:
        lum = b.mean(axis=2); ref = np.percentile(lum[pm], 85)
        shade = np.clip(lum / ref, 0.55, 1.06)
        shade = np.array(Image.fromarray((shade * 200).astype('uint8')).filter(ImageFilter.GaussianBlur(3))).astype(float)[..., None] / 200
        al = np.array(Image.fromarray((pm * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))).astype(float)[..., None] / 255
        tint = b[pm].mean(axis=0) / b[pm].mean()  # the warm light on the paper
        out = b * (1 - al) + np.array(w).astype(float) * shade * (0.55 + 0.45 * tint) * al
    return Image.fromarray(np.clip(out, 0, 255).astype('uint8'))
def rect(x0, y0, x1, y1): return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

# 03 screen wall: three client websites, and one on the laptop
im = Image.open('concept-03-screen-wall.png').convert('RGB')
im = place(im, flow('work/cabot-solutions/cabot-solutions-flow.jpg'), rect(226, 196, 436, 319))
im = place(im, flow('work/bigtapp/bigtapp-flow.jpg'), rect(454, 196, 689, 319))
im = place(im, flow('work/carlton-noble/carlton-noble-flow.jpg'), rect(706, 196, 912, 319))
im = place(im, flow('work/engel-volkers/engel-volkers-flow.jpg'), rect(548, 385, 632, 437))
im = place(im, Image.open(P + 'work/carlton-noble/carlton-noble-flow-phone.jpg').convert('RGB').crop((300, 0, 780, 1080)), rect(664, 405, 686, 443))
im.save('work-03-screen-wall.jpg', quality=92)

# 04 products and automation: two client dashboards
im = Image.open('concept-04-automation.png').convert('RGB')
src = im.copy(); mon = [(661, 323), (894, 320), (894, 401), (661, 384)]
im = place(im, flow('work/sifio-health/sifio-health-flow.jpg'), [(392, 155), (787, 173), (787, 346), (392, 352)], ref=src, exclude=[[(655, 318), (900, 315), (900, 410), (655, 392)]])
care = flow('work/care-connect/care-connect-flow.jpg'); cw, ch = care.size
im = place(im, care.crop((int(cw * 0.16), int(ch * 0.16), cw, int(ch * 0.47))), mon, ref=src)
im.save('work-04-products.jpg', quality=92)

# 05 making room: four client print pieces
im = Image.open('concept-05-making.png').convert('RGB')
cb = Image.open(P + 'work/cabot-solutions/cabotbrand-3.jpg').convert('RGB')
arts = [cb.crop((40, 250, 780, 1350)), Image.open(P + 'work/sandlogic/sandlogic-2.jpg').convert('RGB').crop((560, 416, 1040, 1184)),
        Image.open(P + 'work/norsecom/norsecom-6.jpg').convert('RGB').crop((773, 304, 1216, 1173)), cb.crop((820, 250, 1560, 1350))]
quads = [[(294, 156), (437, 160), (437, 360), (294, 361)], [(460, 163), (593, 166), (593, 358), (460, 359)],
         [(613, 167), (740, 171), (740, 356), (613, 357)], [(760, 173), (876, 176), (876, 355), (760, 356)]]
for a, q in zip(arts, quads): im = place(im, a, q, mode='paper', grow=0)
im.save('work-05-making.jpg', quality=92)

# 06 film corner: the monitor shows one of our app films
im = Image.open('concept-06-film.png').convert('RGB')
g = Image.open(P + 'work/oh-my-glam/oh-my-glam-flow.jpg').convert('RGB')
im = place(im, g.crop((0, 0, 1050, 1000)), [(581, 312), (667, 312), (667, 370), (581, 375)])
im = place(im, g.crop((1110, 70, 1490, 930)), rect(707, 337, 724, 365))
im.save('work-06-film.jpg', quality=92)

# ---- AI lab rooms (second round) ----
# 03 build lab: a client website on the wall display (the glass panels in front stay in front)
im = Image.open('lab-03-build.png').convert('RGB')
im = place(im, flow('work/bigtapp/bigtapp-flow.jpg'), [(463, 195), (941, 159), (942, 417), (463, 412)], thr=235, soft=(150, 245))
im.save('labwork-03-build.jpg', quality=92)

# 04 automation lab: a client dashboard where the light lines end
im = Image.open('lab-04-automation.png').convert('RGB')
im = place(im, flow('work/care-connect/care-connect-flow.jpg'), [(724, 120), (963, 171), (963, 316), (724, 315)], thr=235)
im.save('labwork-04-automation.jpg', quality=92)

# 05 brand lab: three client posters (the colour swatches in front of the first stay in front)
im = Image.open('lab-05-brand.png').convert('RGB')
swatches = [[(593, 293), (625, 293), (625, 332), (593, 332)], [(631, 287), (662, 287), (662, 332), (631, 332)], [(665, 280), (696, 280), (696, 332), (665, 332)]]
for a, q, ex in zip([arts[0], arts[1], arts[2]], [rect(617, 162, 709, 300), rect(728, 162, 821, 300), rect(840, 162, 933, 300)], [swatches, (), ()]):
    im = place(im, a, q, mode='paper', grow=0, exclude=ex)
im.save('labwork-05-brand.jpg', quality=92)

# 06 AI film lab: our app film on the desk monitor, three client pieces on the upright screens
im = Image.open('lab-06-film.png').convert('RGB'); src = im.copy()
im = place(im, g.crop((0, 0, 1050, 1000)), rect(603, 378, 685, 426), thr=200, ref=src)
ph = [g.crop((1110, 70, 1490, 930)), Image.open(P + 'work/carlton-noble/carlton-noble-flow-phone.jpg').convert('RGB').crop((300, 0, 780, 1080)),
      Image.open(P + 'work/bigtapp/bigtapp-flow-phone.jpg').convert('RGB').crop((300, 0, 780, 1080))]
for a, (x, y, w, h) in zip(ph, [(860, 394, 13, 28), (894, 394, 13, 28), (930, 394, 14, 29)]):
    im = place(im, a, rect(x, y, x + w, y + h), thr=200, ref=src)
im.save('labwork-06-film.jpg', quality=92)
