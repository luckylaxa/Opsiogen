"""BigTapp's exhibition stand (26 Nov 2026, the owner: "Replace this brand with Bigtapp and update in website and
showreel"). The two Vantara stand photos (with and without the team member) get BigTapp's own logo on the hanging
sign, the back wall, the counter, the roll-up and the polo, and BigTapp lines from its case study on the wall
("Enterprise AI that acts.") and the roll-up ("Data. AI. Action."). Only the branding changes: the old letters are
painted out with the surface they sit on (a smooth fit of the colour around them), the new ones are drawn sharp and
then softened a touch to match the photo, and the sign's logo follows the sign's angle.
Usage: python3 design/tiles/py/booth_bigtapp.py
Writes design/tiles/out/figma-print/ai/bigtapp-booth.png and bigtapp-booth-model.png (1280 x 720)."""
import os, subprocess
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../..'))
AI = os.path.join(ROOT, 'design/tiles/out/figma-print/ai')
LOGO_SVG = os.path.join(ROOT, 'public/logos/bigtapp.svg')
INTER = '/usr/share/fonts/opentype/inter/Inter-{}.otf'
SS = 4  # supersampling for everything drawn

# ---------- BigTapp's logo, from its own SVG ----------
def logo_parts():
    """The stacked logo (bars above the name), and its two parts, as alpha masks at a large size."""
    png = os.path.join(AI, '_bigtapp-logo.png')
    subprocess.run(['node', os.path.join(HERE, 'svg2png.cjs'), LOGO_SVG, png, '2400'], check=True)
    a = np.asarray(Image.open(png).convert('RGBA'))[..., 3]
    os.remove(png)
    rows = np.where(a.max(1) > 0)[0]
    a = a[rows.min():rows.max() + 1]
    filled = a.max(1) > 0
    # the widest band of empty rows splits the bars from the name
    gaps, y = [], 0
    while y < len(filled):
        if not filled[y]:
            y0 = y
            while y < len(filled) and not filled[y]: y += 1
            gaps.append((y - y0, y0, y))
        y += 1
    _, g0, g1 = max(gaps)
    def trim(m):
        cols = np.where(m.max(0) > 0)[0]; rws = np.where(m.max(1) > 0)[0]
        return m[rws.min():rws.max() + 1, cols.min():cols.max() + 1]
    return {'stacked': trim(a), 'mark': trim(a[:g0]), 'word': trim(a[g1:])}

LOGO = logo_parts()

def logo(kind, height, colour, opacity=1.0):
    """RGBA logo of the given height (in final pixels x SS), in one colour."""
    m = LOGO[kind]
    h = int(round(height * SS)); w = int(round(m.shape[1] * h / m.shape[0]))
    mm = Image.fromarray(m).resize((w, h), Image.LANCZOS)
    out = Image.new('RGBA', (w, h), tuple(colour) + (0,))
    out.putalpha(mm.point(lambda v: int(v * opacity)))
    return out

# ---------- painting old letters out ----------
def fit_fill(img, box, hole, keep, seed=1):
    """Fills `hole` inside `box` from the `keep` pixels right around it (a local average that follows the panel's own
    light fall-off: the nearest ring of surface wins), plus the panel's fine grain, so no outline of the old letters
    is left."""
    x0, y0, x1, y1 = box
    H = hole[y0:y1, x0:x1]; K = (keep[y0:y1, x0:x1] & ~H).astype(np.float32)
    patch = img[y0:y1, x0:x1].astype(np.float32)
    fill = np.zeros_like(patch); done = np.zeros(H.shape, bool)
    for s in (3, 6, 12, 24, 48, 96):
        w = cv2.GaussianBlur(K, (0, 0), s)
        est = cv2.GaussianBlur(patch * K[..., None], (0, 0), s) / np.maximum(w, 1e-6)[..., None]
        ok = ((w > 0.25) | (s == 96)) & ~done
        fill[ok] = est[ok]; done |= ok
    smooth = cv2.GaussianBlur(patch, (0, 0), 2)
    grain = np.clip(np.std((patch - smooth)[K > 0], 0), 0, 3.0)
    rng = np.random.default_rng(seed)
    patch[H] = fill[H] + rng.normal(0, 1, (H.sum(), 3)) * grain
    img[y0:y1, x0:x1] = np.clip(patch, 0, 255)
    return img

def box_mask(shape, box):
    m = np.zeros(shape[:2], bool); x0, y0, x1, y1 = box; m[y0:y1, x0:x1] = True; return m

def poly_mask(shape, pts, inset=0):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts)).astype(np.int32)], 1)
    if inset: m = cv2.erode(m, np.ones((2 * inset + 1, 2 * inset + 1), np.uint8))
    return m.astype(bool)

def grow(m, r):
    return cv2.dilate(m.astype(np.uint8), np.ones((2 * r + 1, 2 * r + 1), np.uint8)).astype(bool)

# ---------- drawing new things in ----------
def place(base, layer, x, y, soften=0.4):
    """Composites an RGBA layer drawn at SS x size, top left at (x, y) in final pixels."""
    w, h = layer.size
    small = layer.resize((max(1, round(w / SS)), max(1, round(h / SS))), Image.LANCZOS)
    if soften: small = small.filter(ImageFilter.GaussianBlur(soften))
    base.alpha_composite(small, (int(round(x)), int(round(y))))

def warp_onto(base, flat, quad, soften=0.45):
    """Maps a flat RGBA panel (drawn at SS x) onto a quad in the photo (TL, TR, BR, BL), for panels seen at an angle."""
    W, H = flat.size
    q = np.array(quad, np.float32) * SS
    x0, y0 = np.floor(q.min(0)).astype(int) - 2 * SS; x1, y1 = np.ceil(q.max(0)).astype(int) + 2 * SS
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [W, 0], [W, H], [0, H]]), (q - [x0, y0]).astype(np.float32))
    arr = np.asarray(flat).astype(np.float32)
    pre = arr.copy(); pre[..., :3] *= arr[..., 3:4] / 255  # premultiplied, so edges stay clean
    out = cv2.warpPerspective(pre, M, (x1 - x0, y1 - y0), flags=cv2.INTER_CUBIC, borderValue=(0, 0, 0, 0))
    a = np.clip(out[..., 3:4], 0, 255)
    rgb = np.where(a > 0, out[..., :3] * 255 / np.maximum(a, 1e-3), 0)
    layer = Image.fromarray(np.clip(np.concatenate([rgb, a], 2), 0, 255).astype(np.uint8), 'RGBA')
    small = layer.resize(((x1 - x0) // SS, (y1 - y0) // SS), Image.LANCZOS)
    if soften: small = small.filter(ImageFilter.GaussianBlur(soften))
    base.alpha_composite(small, (x0 // SS, y0 // SS))

def text_layer(lines, size, weight, colour, pitch):
    """Left-aligned lines; returns the layer and the offset from its top left to the first baseline (final px)."""
    f = ImageFont.truetype(INTER.format(weight), int(round(size * SS)))
    asc, desc = f.getmetrics()
    w = max(int(f.getlength(t)) for t in lines) + 8 * SS
    h = int(asc + desc + pitch * SS * (len(lines) - 1)) + 8 * SS
    im = Image.new('RGBA', (w, h), tuple(colour) + (0,)); d = ImageDraw.Draw(im)
    for i, t in enumerate(lines):
        d.text((4 * SS, 4 * SS + asc + i * pitch * SS), t, font=f, fill=tuple(colour) + (255,), anchor='ls')
    return im, (4, 4 + asc / SS)

# ---------- the stand ----------
SIGN = [(377, 55.7), (866, 10.5), (866, 97.8), (377, 133.6)]       # the hanging sign's front face
COUNTER = [(468, 489), (839, 491), (839, 662), (468, 646)]          # the counter's front face
WHITE_SIGN, WHITE_WALL, INK = (244, 243, 250), (242, 242, 244), (13, 12, 18)
BLUE = (52, 118, 236)

def rebrand(src, out, polo=False):
    img = np.asarray(Image.open(src).convert('RGB')).astype(float)
    i8 = img.astype(int); R, G, B = i8[..., 0], i8[..., 1], i8[..., 2]
    mn, br = i8.min(2), i8.mean(2)
    S = img.shape
    # 1. paint the old letters out
    face = poly_mask(S, SIGN, inset=3)
    hole = grow(face & box_mask(S, (455, 40, 780, 105)) & (mn > 55), 2) & face
    fit_fill(img, (440, 8, 800, 135), hole, face & (B > 140))
    cface = poly_mask(S, COUNTER, inset=3)
    hole = grow(cface & box_mask(S, (540, 545, 748, 590)) & (mn > 60), 2) & cface
    fit_fill(img, (520, 530, 770, 605), hole, cface & (B > 150))
    # the wall: only inside the old lines' own boxes (the team member stands just below them)
    text = box_mask(S, (652, 209, 750, 233)) | box_mask(S, (659, 233, 1020, 274)) | box_mask(S, (659, 274, 872, 311))
    local = cv2.medianBlur(np.clip(br, 0, 255).astype(np.uint8), 31).astype(int)   # the wall's own light, glow included
    core = text & ((B - R > 25) | (br - local > 14))
    halo = grow(core, 4) & (local - br > 3)          # the dark rim the photo's sharpening left round each letter
    hole = grow(core | halo, 2) & grow(text, 3)
    keep = box_mask(S, (630, 196, 1050, 318)) & ~grow(hole, 2)
    if polo: keep &= ~box_mask(S, (885, 270, 1035, 330))
    fit_fill(img, (630, 196, 1050, 318), hole, keep)
    banner = box_mask(S, (114, 282, 243, 442))
    core = banner & ((B - R > 22) | (br < 205))
    halo = grow(core, 4) & (np.abs(br - local) > 3)   # sharpening rims, lighter or darker than the banner
    hole = grow(core | (halo & banner), 2) & banner
    fit_fill(img, (110, 278, 247, 446), hole, banner & (br > 205))
    sq = box_mask(S, (126, 456, 235, 559)) & (B - R > 80)
    hole = grow(box_mask(S, (128, 458, 233, 557)) & (mn > 90), 2) & box_mask(S, (126, 456, 235, 559))
    fit_fill(img, (124, 454, 237, 561), hole, sq)
    if polo:  # the little chest logo: a tiny patch of knit, filled from around it
        m = (box_mask(S, (949, 374, 977, 388)) & (br > 75)).astype(np.uint8) * 255
        img = cv2.inpaint(np.clip(img, 0, 255).astype(np.uint8), cv2.dilate(m, np.ones((3, 3), np.uint8)), 3, cv2.INPAINT_TELEA).astype(float)
    base = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    # 2. BigTapp in its place
    fw, fh = 489 * SS, 84 * SS                                   # the sign face, flat
    flat = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    lg = logo('stacked', 84 * 0.64, WHITE_SIGN)
    flat.alpha_composite(lg, ((fw - lg.width) // 2, (fh - lg.height) // 2))
    warp_onto(base, flat, SIGN)
    fw, fh = 371 * SS, 165 * SS                                  # the counter face, flat
    flat = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    lg = logo('stacked', 74, WHITE_SIGN)
    flat.alpha_composite(lg, ((fw - lg.width) // 2 - 6 * SS, (fh - lg.height) // 2 + 2 * SS))
    warp_onto(base, flat, COUNTER)
    lg = logo('stacked', 36, WHITE_WALL)                         # the wall: logo top left, as on BigTapp's site
    place(base, lg, 665, 196)
    tl, (ox, oy) = text_layer(['Enterprise AI', 'that acts.'], 35.5, 'Medium', WHITE_WALL, 35)
    place(base, tl, 665 - ox, 266 - oy)
    lg = logo('word', 15, BLUE)                                  # the roll-up
    place(base, lg, 125, 289)
    tl, (ox, oy) = text_layer(['Data.', 'AI.', 'Action.'], 24.2, 'SemiBold', INK, 27.7)
    place(base, tl, 125 - ox, 347 - oy, soften=0.35)
    lg = logo('mark', 50, (250, 250, 253))
    place(base, lg, 180 - lg.width / SS / 2, 507 - lg.height / SS / 2, soften=0.35)
    if polo:
        lg = logo('stacked', 12.5, (226, 228, 236), opacity=0.92)
        place(base, lg, 962 - lg.width / SS / 2, 375, soften=0.55)
    base.convert('RGB').save(out)
    print('wrote', out)

if __name__ == '__main__':
    rebrand(os.path.join(AI, 'vantara-booth.png'), os.path.join(AI, 'bigtapp-booth.png'))
    rebrand(os.path.join(AI, 'vantara-booth-model.png'), os.path.join(AI, 'bigtapp-booth-model.png'), polo=True)
