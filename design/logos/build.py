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


def write(slug, a, soft=None, **kw):
    """`soft`: a second ink map, for a part of the logo drawn in a light colour behind the rest; it is written at
    40% opacity, so the one-colour logo keeps the difference (on the site, a 40% white)."""
    d, path = trace(a, **kw)
    (x0, y0), (x1, y1) = bbox(path, kw.get("S", 1))
    extra = ""
    if soft is not None:
        d2, path2 = trace(soft, **kw)
        (a0, b0), (a1, b1) = bbox(path2, kw.get("S", 1))
        x0, y0, x1, y1 = min(x0, a0), min(y0, b0), max(x1, a1), max(y1, b1)
        extra = f'<path fill-rule="evenodd" fill-opacity=".4" d="{d2}"/>'
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {x1 - x0:.2f} {y1 - y0:.2f}">'
           f'{extra}<path fill-rule="evenodd" d="{d}"/></svg>\n')
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
def engel_volkers():            # Engel & Völkers' own logo file (from the owner, 19 Nov): grey letters, red "&", on clear
    return load("design/logos/src/engel-volkers.png")[:, :, 3] / 255, {}


def sifio_health():             # sifio's own logo file (from the owner, 19 Nov): the horizontal one, cream on clear
    return load("design/logos/src/sifio-health.png")[:, :, 3] / 255, {}


def bigtapp():                  # website header, white on navy: the bars over the name
    return ink_auto(crop(load("public/work/bigtapp/bigtapp-1-wide.jpg"), (85, 35, 265, 155))), {}


def carlton_noble():            # Carlton Noble's own logo file (from the owner, 19 Nov), white on clear
    return load("design/logos/src/carlton-noble.png")[:, :, 3] / 255, {}


def meetingful():               # Meetingful's own logo (from the owner, 19 Nov), on white: the orange M with ring
    c = load("design/logos/src/meetingful.png")  # ends and the name, and a lavender X behind the M (drawn lighter)
    a = ink_auto(c, (255, 255, 255), t=60)       # the orange parts (the lavender is too pale to count as full ink)
    rgb = c[:, :, :3]; d = np.linalg.norm(rgb - 255, axis=2)
    lav = (rgb[:, :, 0] > rgb[:, :, 2] + 8) & (d > 25)                 # bluish, not white (channels are BGR)
    soft = np.clip(d / np.percentile(d[lav], 90), 0, 1) * cv2.dilate(lav.astype(np.uint8), np.ones((3, 3), np.uint8))
    return a, {"soft": np.clip(soft - a, 0, 1)}


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


def cabot_solutions():          # Cabot's own white logo file (from the owner, 19 Nov), on clear
    return load("design/logos/src/cabot-white.png")[:, :, 3] / 255, {}


def rxlive():                   # logo file from Cabot's site, on white: "Rx Live" and the four-part plus
    c = load("design/logos/src/rxlive.jpg")
    a = ink_auto(c, (255, 255, 255), t=40)
    return drop(drop(a, (190, 150, 400, 200)), (380, 45, 415, 78)), {}       # the tagline and the SM


def surgo_health():             # Surgo Health's brand guide (from the owner, 19 Nov): the primary logo on white, page 3,
    # drawn from the guide's vector artwork at 600 dpi. The dots, "surgo" and HEALTH.
    return ink_auto(load("design/logos/src/surgo-health.png"), (255, 255, 255), t=25), {}


def rohde_schwarz():            # Rohde & Schwarz's own logo (from the owner, 19 Nov): the name and the diamond, on
    a = load("design/logos/src/rohde-schwarz.png")[:, :, 3] / 255   # clear; the claim "Make ideas real" under the
    return drop(a, (0, 128, 320, 207)), {}                            # name goes (too small to read in the row)


# Care Connect has no logo here (Lucky, 19 Nov: "Don't put care connect logo").
# ---- clients without a case study here (Lucky, 19 Nov: the logo wall he shared). Their logo files are the ones on
# Cabot's site (488 x 256, on white) in src/clients, except SAP and Microchip, drawn from their own vector logos
# (Wikimedia Commons, rendered large on white). Taglines, TM and (R) marks go: too small to read in the row.
def client(name, *drops, t=40, flat=False):
    c = load(f"design/logos/src/clients/{name}.png")
    if flat:   # every coloured part as full ink, even a pale one (My Healing Mate's light yellow and teal wing)
        a = np.clip((np.linalg.norm(c[:, :, :3] - 255, axis=2) - 12) / 28, 0, 1)
    else:
        a = ink_auto(c, (255, 255, 255), t=t)
    for box in drops: a = drop(a, box)
    return a, {}


FLAT = {"my-healing-mate"}
CLIENTS = {   # file name: (display name, boxes of parts left out: taglines, TM, (R))
    "my-healing-mate": ("My Healing Mate", [(0, 176, 488, 256)]),                       # FEEL BETTER, HEAL FASTER
    "graymatter-analytics": ("GrayMatter Analytics", [(118, 162, 488, 256), (54, 171, 112, 178), (360, 128, 380, 146)]),
    "altruity": ("Altruity", [(420, 140, 445, 160)]),                                    # TM
    "actigraph": ("ActiGraph", [(372, 156, 390, 170)]),                                  # TM
    "nephtech": ("NephTech", []),
    "corechair": ("CoreChair", []),
    "sap": ("SAP", []),
    "kinduct": ("Kinduct", []),
    "aaoms": ("AAOMS", [(330, 208, 352, 230)]),                                          # (R)
    "the-sieve": ("The Sieve", []),
    "dubai-police": ("Dubai Police", []),
    "nova-scotia-power": ("Nova Scotia Power", [(160, 160, 400, 195)]),                  # An Emera Company
    "microchip": ("Microchip", [(380, 15, 430, 65)]),                                    # (R)
    "rush": ("RUSH", []),
    "green-circle-life": ("Green Circle Life", []),
    "instachart": ("instachart", []),
}


LOGOS = {"engel-volkers": engel_volkers, "sifio-health": sifio_health, "bigtapp": bigtapp, "carlton-noble": carlton_noble,
         "meetingful": meetingful, "oh-my-glam": oh_my_glam, "norsecom": norsecom,
         "sandlogic": sandlogic, "afthab-tours": afthab_tours, "cabot-solutions": cabot_solutions, "rxlive": rxlive,
         "surgo-health": surgo_health, "rohde-schwarz": rohde_schwarz,
         **{k: (lambda k=k, drops=v[1]: client(k, *drops, flat=k in FLAT)) for k, v in CLIENTS.items()}}

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
    body = "".join(f'  "{k}": {{ ratio: {v}' + (f", size: {OPTICAL[k]}" if k in OPTICAL else "")
                   + (f', name: "{CLIENTS[k][0]}"' if k in CLIENTS else "") + " },\n" for k, v in ratios.items())
    open(MAP, "w").write(
        "// Written by design/logos/build.py: do not edit by hand.\n"
        "/**\n * Client logos in /public/logos/<project slug>.svg (one colour). `ratio`: the logo's width to height.\n"
        " * `size`: its optical size in the logo row against the shared rule (1 when left out). `name`: a client without a\n * case study here (the others take their name from their project).\n */\n"
        f"export const CLIENT_LOGOS: Record<string, {{ ratio: number; size?: number; name?: string }}> = {{\n{body}}};\n")
