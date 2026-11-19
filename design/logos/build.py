"""Client logos for the project cards, as one-colour vectors (Lucky, 19 Nov: "collect all high quality logos and
replace the logo files in website with black and white color"). Each logo is lifted from the sharpest copy we have
(our case study designs, the clients' own brand pages, or the logo files on Cabot's site, kept in src/), traced into
smooth curves, and written as public/logos/<slug>.svg, black on transparent. The site shows them in
white through a CSS mask, so one file serves both colours.

How a logo is lifted: the crop's background colour is found, every shape that differs from it becomes "ink" (each
shape measured against its own colour, so a red "&" and white letters both get their edge half-way), and parts that
aren't the logo (taglines, TM, a sign's frame) are cleared. Coloured parts all become one colour; a light shape
inside a coloured one (Care Connect's heart, Afthab's plane) is cut out of it, as in a one-colour print.
Needs: pip install potracer opencv-python numpy
It also writes src/content/client-logos.ts, the site's list of logos with their shapes.
Usage: python3 design/logos/build.py [slug ...]"""
import os, sys, json
import numpy as np, cv2, potrace

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
OUT = os.path.join(ROOT, "public/logos")


def load(path):
    i = cv2.imread(os.path.join(ROOT, path), cv2.IMREAD_UNCHANGED)
    if i.ndim == 2: i = cv2.cvtColor(i, cv2.COLOR_GRAY2BGRA)
    if i.shape[2] == 3: i = np.dstack([i, np.full(i.shape[:2], 255, np.uint8)])
    return i.astype(np.float32)


def border_bg(c):
    c = c[:, :, :3]
    b = np.concatenate([c[:3].reshape(-1, 3), c[-3:].reshape(-1, 3), c[:, :3].reshape(-1, 3), c[:, -3:].reshape(-1, 3)])
    return np.median(b, 0)


def ink_auto(c, bg=None, t=40, seed=None):
    """Every shape that differs from the background, each measured against its own colour."""
    bg = border_bg(c) if bg is None else np.array(bg[::-1], np.float32)        # bg given as RGB
    d = np.linalg.norm(c[:, :, :3] - bg, axis=2)
    core = (d > t).astype(np.uint8)
    n, lab = cv2.connectedComponents(cv2.dilate(core, np.ones((3, 3), np.uint8)))
    a = np.zeros_like(d)
    for k in range(1, n):
        m = lab == k
        hi = d[m & (core > 0)]
        if hi.size == 0: continue
        full = np.percentile(hi, 90)
        a[m] = np.clip(d[m] / full, 0, 1)
    return a


def ink_lum(c, lo, hi):
    """Light letters on a busy background: lightness from lo (none) to hi (full)."""
    L = c[:, :, :3] @ np.array([0.114, 0.587, 0.299], np.float32)
    return np.clip((L - lo) / (hi - lo), 0, 1)


def ink_alpha(c, white=200):
    """A logo file with a transparent background; near-white parts inside it are cut out."""
    a = c[:, :, 3] / 255
    w = np.clip((c[:, :, :3].min(2) - white) / (250 - white), 0, 1)
    return a * (1 - w)


def unmix(c, bg, fg):
    """How far each pixel is from colour bg towards colour fg (both RGB), 0 to 1."""
    bg = np.array(bg[::-1], np.float32); fg = np.array(fg[::-1], np.float32); v = fg - bg
    return np.clip(((c[:, :, :3] - bg) @ v) / (v @ v), 0, 1)


def keep_seeded(a, seed):
    """Only shapes holding at least one pixel of full ink (drops faint background bits that crossed the line)."""
    m = (a > 0.5).astype(np.uint8)
    n, lab = cv2.connectedComponents(m)
    ok = np.zeros(n, bool); ok[np.unique(lab[a >= seed])] = True; ok[0] = False
    return a * ok[lab]


def trace(a, S=1, turd=2, alphamax=1.0, blur=0.0, tol=0.2):
    """Ink (0..1, source pixels) to an SVG path in source pixel units. Most of these sources have hard, pixel-sharp
    edges, which potrace smooths best at their own size (S=1): enlarged first, their pixel steps became ripples.
    The smallest logos are traced at S=2 from a softly enlarged copy, so their curves keep their shape."""
    up = cv2.resize(a, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC) if S > 1 else a
    if blur: up = cv2.GaussianBlur(up, (0, 0), blur * S)
    bm = potrace.Bitmap(up <= 0.5)                       # potracer traces the False pixels
    path = bm.trace(turdsize=int(turd * S * S), alphamax=alphamax, opticurve=True, opttolerance=tol)
    f = lambda p: f"{p.x / S:.2f} {p.y / S:.2f}"
    d = []
    for curve in path:
        d.append("M" + f(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner: d.append("L" + f(seg.c) + "L" + f(seg.end_point))
            else: d.append("C" + f(seg.c1) + " " + f(seg.c2) + " " + f(seg.end_point))
        d.append("Z")
    return "".join(d), path


def bbox(path, S):
    pts = []
    for curve in path:
        pts.append(curve.start_point)
        for seg in curve.segments:
            pts += [seg.c, seg.end_point] if seg.is_corner else [seg.c1, seg.c2, seg.end_point]
    p = np.array([(q.x, q.y) for q in pts]) / S
    return p.min(0), p.max(0)


def write(slug, a, **kw):
    d, path = trace(a, **kw)
    (x0, y0), (x1, y1) = bbox(path, kw.get("S", 1))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {x1 - x0:.2f} {y1 - y0:.2f}">'
           f'<path fill-rule="evenodd" d="{d}"/></svg>\n')
    open(os.path.join(OUT, slug + ".svg"), "w").write(svg)
    return round((x1 - x0) / (y1 - y0), 3), len(svg)


def crop(img, box): x0, y0, x1, y1 = box; return img[y0:y1, x0:x1]


def clear(a, *boxes, at=(0, 0)):
    """Clears boxes given in source pixels (the crop's own origin is `at`)."""
    for x0, y0, x1, y1 in boxes: a[max(y0 - at[1], 0):max(y1 - at[1], 0), max(x0 - at[0], 0):max(x1 - at[0], 0)] = 0
    return a


def drop(a, box=None, smaller=0, at=(0, 0)):
    """Removes whole shapes: those lying inside box (source pixels; a tagline, a TM), or smaller than `smaller` px."""
    n, lab, st, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8))
    keep = np.zeros(n, bool)
    for k in range(1, n):
        x, y, w, h, area = st[k]; x += at[0]; y += at[1]
        inside = box is not None and box[0] <= x and box[1] <= y and x + w <= box[2] and y + h <= box[3]
        keep[k] = not inside and area >= smaller
    near = cv2.dilate(keep[lab].astype(np.uint8), np.ones((3, 3), np.uint8))   # kept shapes keep their soft edge
    return a * near


def rotate(a, deg):
    h, w = a.shape; M = cv2.getRotationMatrix2D((w / 2, h / 2), deg, 1)
    return cv2.warpAffine(a, M, (w, h), flags=cv2.INTER_CUBIC)


# ---- one function per client: returns the ink map (source pixels, 0..1) and trace options ----------------------
def engel_volkers():            # website header: white letters and a red "&" on near-black
    return ink_auto(crop(load("public/work/engel-volkers/ev-1-wide.jpg"), (90, 60, 590, 130))), {}


def sifio_health():             # hero card: cream letters over a photo; only shapes with solid cream in them
    c = crop(load("public/work/sifio-health/sifio-1-wide.jpg"), (175, 140, 385, 210))
    return keep_seeded(ink_lum(c, 196, 238), 0.97), {"blur": 0.5}   # HEALTH beside it is too small to keep


def bigtapp():                  # website header, white on navy: the bars over the name
    return ink_auto(crop(load("public/work/bigtapp/bigtapp-1-wide.jpg"), (85, 35, 265, 155))), {}


def carlton_noble():            # website header, light letters on dark brown
    return ink_auto(crop(load("public/work/carlton-noble/carlton-1-wide.jpg"), (90, 65, 450, 120)), t=30), {}


def care_connect():             # website hero, on blue: app icon (blue square, white heart line) and "CareConnect"
    box = (205, 195, 420, 255); c = crop(load("design/showreel/raw/_src/care.png"), box)
    bg, icon, white = (0x0c, 0x59, 0xac), (0x00, 0x76, 0xdc), (0xf8, 0xfb, 0xfd)
    a = ink_auto(c, bg, t=60)                            # the name ("Care" white, "Connect" light blue)
    ix = 270 - box[0]                                    # the icon is x 224 to 264, the name starts at 275
    # The square, redrawn exactly (an app icon: square with round corners), from where its edges are in the picture.
    sq = cv2.morphologyEx((unmix(c, bg, icon)[:, :ix] > 0.5).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    x, y, w, h = cv2.boundingRect(max(cv2.findContours(sq, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea))
    side = (w + h) / 2; r = side * 0.26; cx, cy = x + w / 2 - 0.5, y + h / 2 - 0.5
    yy, xx = np.mgrid[0:c.shape[0], 0:ix].astype(np.float32)
    qx, qy = np.abs(xx - cx) - (side / 2 - r), np.abs(yy - cy) - (side / 2 - r)
    sdf = np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r
    square = np.clip(0.5 - sdf, 0, 1)
    heart = unmix(c, icon, white)[:, :ix] * (sdf < -1.5)  # the heart line, cut out of the square
    a[:, :ix] = np.clip(square - heart, 0, 1)
    return a, {"S": 2, "blur": 0.35}


def meetingful():               # app header on near-black: the M mark and the name
    return ink_auto(crop(load("design/showreel/raw/_src/mf03.png"), (40, 130, 395, 210)), t=35), {}


def oh_my_glam():               # app cover: white "OMG" over a soft photo (the small "OH MY GLAM!" under it is too
    c = crop(load("public/work/oh-my-glam/omg-0.jpg"), (90, 85, 465, 250))   # small to read on a card, so it goes)
    return keep_seeded(ink_lum(c, 200, 245), 0.97), {"blur": 0.5}


def norsecom():                 # office sign (turned a little): mark and name; the TM and the line below go
    box = (470, 640, 1130, 800); c = crop(load("design/showreel/build/a/nc-02.jpg"), box)
    a = ink_auto(c, t=60)
    a = clear(a, (1104, 640, 1130, 712), (470, 790, 1130, 800), at=box[:2])
    m = (a > 0.5).astype(np.uint8); ys, xs = np.nonzero(m)
    (_, _), (_, _), ang = cv2.minAreaRect(np.column_stack([xs, ys]).astype(np.float32))
    ang = ang - 90 if ang > 45 else ang
    return keep_seeded(rotate(a, ang), 0.95), {"blur": 0.5}


def sandlogic():                # brand guide: the one-colour white version on dark (mark beside the name)
    # The mark's fine dot fields can't be drawn in one colour at card size (they turn into rough patches), so the mark
    # keeps its two crescents and the stroke between them: the hourglass S.
    box = (1340, 765, 1740, 895); c = crop(load("design/showreel/raw/sl/g-logo1.png"), box)
    a = ink_auto(c, t=40); m = 122                       # the mark is the first 122 px, the name after it
    core = cv2.morphologyEx((a[:, :m] > 0.5).astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    a[:, :m] *= cv2.dilate(core, np.ones((3, 3), np.uint8))   # the dots go; the crescents and the stroke stay
    a[:, :m] = drop(a[:, :m], smaller=120)
    return a, {}


def afthab_tours():             # logo file: colour mark (white plane cut out) and the name; the tagline goes
    a = ink_alpha(load("design/case-studies/afthab-tours/src/logo.png"))
    return clear(a, (104, 47, 480, 79)), {}


def cabot_solutions():          # logo file from Cabot's site: blue mark and black name on transparent
    a = load("design/logos/src/cabot.webp")[:, :, 3] / 255
    return a, {}


def rxlive():                   # logo file from Cabot's site, on white: "Rx Live" and the four-part plus
    c = load("design/logos/src/rxlive.jpg")
    a = ink_auto(c, (255, 255, 255), t=40)
    return drop(drop(a, (190, 150, 400, 200)), (380, 45, 415, 78)), {}       # the tagline and the SM


def surgo_health():             # logo file from Cabot's site, on white: the dots, "surgo" and HEALTH
    return ink_auto(load("design/logos/src/surgo.jpg"), (255, 255, 255), t=25), {}


def rohde_schwarz():            # our brand board: the name and the diamond mark, white on navy; the strapline goes
    box = (545, 1090, 905, 1195); c = crop(load("public/work/rohde-schwarz/rs-25-wide.jpg"), box)
    a = ink_auto(c, t=60)
    return clear(a, (545, 1155, 800, 1195), at=box[:2]), {"S": 2, "blur": 0.35}


LOGOS = {"engel-volkers": engel_volkers, "sifio-health": sifio_health, "bigtapp": bigtapp, "carlton-noble": carlton_noble,
         "care-connect": care_connect, "meetingful": meetingful, "oh-my-glam": oh_my_glam, "norsecom": norsecom,
         "sandlogic": sandlogic, "afthab-tours": afthab_tours, "cabot-solutions": cabot_solutions, "rxlive": rxlive,
         "surgo-health": surgo_health, "rohde-schwarz": rohde_schwarz}

MAP = os.path.join(ROOT, "src/content/client-logos.ts")
# Optical size on the cards, where 1 is the shared rule (same area for every logo): a heavy, solid wordmark looks
# bigger than a light one of the same size, a thin or spread-out one smaller.
OPTICAL = {"sifio-health": 0.8, "rohde-schwarz": 1.2, "sandlogic": 1.1}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug in sys.argv[1:] or LOGOS:
        a, kw = LOGOS[slug]()
        ratio, size = write(slug, a, **kw)
        print(f"{slug:16} ratio {ratio:6}  {size / 1024:.1f} KB")
    # The site's map: every logo file there is, with its width to height.
    ratios = {}
    for f in sorted(os.listdir(OUT)):
        if f.endswith(".svg"):
            w, h = [float(v) for v in open(os.path.join(OUT, f)).read().split('viewBox="')[1].split('"')[0].split()[2:]]
            ratios[f[:-4]] = round(w / h, 3)
    body = "".join(f'  "{k}": {{ ratio: {v}' + (f", size: {OPTICAL[k]}" if k in OPTICAL else "") + " },\n" for k, v in ratios.items())
    open(MAP, "w").write(
        "// Written by design/logos/build.py: do not edit by hand.\n"
        "/**\n * Client logos in /public/logos/<project slug>.svg (one colour). `ratio`: the logo's width to height.\n"
        " * `size`: its optical size on the cards against the shared rule (1 when left out).\n */\n"
        f"export const CLIENT_LOGOS: Record<string, {{ ratio: number; size?: number }}> = {{\n{body}}};\n")
