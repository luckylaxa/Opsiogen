"""The print page's exhibition stand is BigTapp's real one (26 Nov 2026): our SFF 2026 booth backdrop for BigTapp,
"Building the AI-First FSI" (the owner's Figma file "BigTapp AI — Exhibition Booth Backdrop (SFF 2026)"), from its
two photo mockups: the BigTapp blue version and the white version (design/tiles/out/figma-print/ai/bigtapp-sff-booth-*.png,
1536 x 1024). It replaces the Vantara stand everywhere it was:
- the page cover, desktop 2:1 (page.jpg) and phone 4:3 (page-phone.jpg): the blue version, cropped (nothing stretched);
- the Events tile, desktop and phone: the white version in the tile's own photo card (same place, same rounded
  corners), so the page shows both looks of the project;
- the showreel's booth shot (design/showreel/build/a/z-print-booth.jpg, "Service artwork: print"): the blue version.
The mockups leave two spaces blank: the "Live demo" panel (a dashed placeholder) and the QR code ("QR code awaiting
approved URL"). The owner: "Put real tv with stand and QR code, it should look real booth" (27 Nov; a TV on the wall
came first). So on both mockups:
- the "Live demo" placeholder is painted out with the panel round it, and a 3D TV on a floor stand (a column on a
  base plate on the carpet) stands in front of it, rendered in the photo's own perspective with its reflections and
  soft shadows (design/tiles/booth3d), showing BigTapp's Beeonix AI page (our site for them; bigtapp-tv-screen.jpg).
  The column stands in the gap between "Shaping the future with AI" and the bee, so it hides no text and not the
  mascot;
- a real QR code for BigTapp's site (https://www.bigtapp.ai/, the address printed on the stand) is printed on the
  card, square on the backdrop's plane.
The camera: level (the backdrop's verticals stay vertical), its horizon and the backdrop's vanishing point measured on
each photo from the backdrop's top and bottom edges, a plausible focal length, and the backdrop 2.5 m tall.
Usage: python3 design/tiles/py/bigtapp_booth.py [OUT_DIR]   (OUT_DIR: write the page images there instead of public/,
for approval before they go live)"""
import json, os, subprocess, sys
import numpy as np
import cv2
import segno
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..'))
AI = os.path.join(ROOT, 'design/tiles/out/figma-print/ai')
PAGE = os.path.join(ROOT, 'public/services/ai-print-collateral')
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else PAGE
FILM = os.path.join(ROOT, 'design/showreel/build/a/z-print-booth.jpg')
B3D = os.path.join(ROOT, 'design/tiles/booth3d')
QR_URL = 'https://www.bigtapp.ai/'

def fill(img, poly, ring=16):
    """Paints the inside of poly with the panel round it: a local average of the nearby panel pixels (those close to
    the panel's own colour, so the "LIVE DEMO" label and the QR box nearby are left out), nearest first."""
    a = np.asarray(img).astype(np.float32)
    hole = np.zeros(a.shape[:2], np.uint8); cv2.fillPoly(hole, [np.round(np.array(poly)).astype(np.int32)], 1)
    hole = cv2.dilate(hole, np.ones((7, 7), np.uint8)).astype(bool)
    near = cv2.dilate(hole.astype(np.uint8), np.ones((2 * ring + 1, 2 * ring + 1), np.uint8)).astype(bool) & ~hole
    panel = np.median(a[near], 0)
    keep = (near & (np.abs(a - panel).sum(2) < 45)).astype(np.float32)
    out, done = a.copy(), np.zeros(hole.shape, bool)
    for s in (3, 6, 12, 24, 48):
        w = cv2.GaussianBlur(keep, (0, 0), s)
        est = cv2.GaussianBlur(a * keep[..., None], (0, 0), s) / np.maximum(w, 1e-6)[..., None]
        ok = hole & ~done & ((w > .2) | (s == 48))
        out[ok] = est[ok]; done |= ok
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

class Cam:
    """A level camera at the origin looking down -Z (three.js's convention). The backdrop's horizontal lines meet at
    (xvp, y0) on the horizon; at column u0 its top edge is at row top and its foot at row floor, and it is H tall."""
    def __init__(s, y0, xvp, u0, top, floor, H=2.5, f=1300., cx=768.):
        s.cx, s.cy, s.f = cx, y0, f
        s.d = np.array([(xvp - cx) / f, 0, -1.0]); s.d /= np.linalg.norm(s.d)        # along the backdrop, rightward
        s.up = np.array([0, 1.0, 0])
        s.h = H * (floor - y0) / (floor - top)                                        # the camera's height
        s.P0 = s.ray(u0, floor) * s.h / ((floor - y0) / f)                            # the backdrop's foot at u0
        n = np.cross(s.d, s.up); s.n = n if n @ -s.P0 > 0 else -n                     # out of it, toward the camera
    def ray(s, u, v): return np.array([(u - s.cx) / s.f, -(v - s.cy) / s.f, -1.0])
    def world(s, a, y, z=0.): return s.P0 + a * s.d + y * s.up + z * s.n
    def img(s, P):
        P = np.atleast_2d(P); return np.stack([s.cx + s.f * P[:, 0] / -P[:, 2], s.cy - s.f * P[:, 1] / -P[:, 2]], 1)
    def plane(s, u, v, z=0.):
        """(a, y) of the point seen at pixel (u, v) on the plane z metres in front of the backdrop."""
        r = s.ray(u, v); X = r * ((s.P0 + z * s.n) @ s.n) / (r @ s.n)
        return float((X - s.P0) @ s.d), float((X - s.P0) @ s.up)

def qr_card(img, cam, dashed):
    """The card's dashed "QR code awaiting approved URL" box painted card-white, and a real QR code for QR_URL printed
    there, square on the backdrop."""
    a = np.asarray(img).astype(np.float32)
    poly = np.round(np.array(dashed)).astype(np.int32)
    m = np.zeros(a.shape[:2], np.uint8); cv2.fillPoly(m, [poly], 1)
    white = np.median(a[(m > 0) & (a.sum(2) > 680)], 0)
    m = cv2.dilate(m, np.ones((5, 5), np.uint8)).astype(bool)
    a[m] = white
    ay = np.array([cam.plane(u, v) for u, v in dashed])
    ac, yc = ay[:, 0].mean(), ay[:, 1].mean()
    side = .97 * min(ay[1, 0] - ay[0, 0], ay[0, 1] - ay[3, 1])
    sq = [(ac - side / 2, yc + side / 2), (ac + side / 2, yc + side / 2), (ac + side / 2, yc - side / 2), (ac - side / 2, yc - side / 2)]
    dst = cam.img(np.array([cam.world(x, y) for x, y in sq])).astype(np.float32)
    mat = np.array([list(r) for r in segno.make(QR_URL, error='m').matrix], np.uint8)       # 1 = dark module
    q = np.pad(mat, 1)                                                                      # 1 module of margin on the card
    k = 40; big = np.kron(q, np.ones((k, k), np.uint8)).astype(np.float32)
    ink = np.array([18, 20, 28], np.float32)
    rgb = (white[None, None] * (1 - big[..., None]) + ink * big[..., None]).astype(np.float32)
    ss = 6; x0, y0 = np.floor(dst.min(0)).astype(int) - 2; x1, y1 = np.ceil(dst.max(0)).astype(int) + 2
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [big.shape[1], 0], [big.shape[1], big.shape[0]], [0, big.shape[0]]]), ((dst - [x0, y0]) * ss).astype(np.float32))
    warped = cv2.warpPerspective(rgb, M, ((x1 - x0) * ss, (y1 - y0) * ss), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    cov = cv2.warpPerspective(np.ones(big.shape, np.float32), M, ((x1 - x0) * ss, (y1 - y0) * ss), flags=cv2.INTER_LINEAR)
    warped = cv2.resize(warped, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    cov = cv2.resize(cov, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)[..., None]
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - cov) + warped * cov
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def tv_on_stand(img, cam, box, pole_x, name):
    """A TV on a floor stand in front of the "Live demo" box (its corners TL, TR, BR, BL on the photo), its column at
    photo column pole_x, rendered in 3D by design/tiles/booth3d and laid over the photo with its shadows."""
    img = fill(img, box)
    (aL, yT), (aR, _), (_, yB) = cam.plane(*box[0]), cam.plane(*box[1]), cam.plane(*box[2])
    base = dict(w=.5, t=.025, d=.38, z=.04 + .19)
    pole = dict(w=.055, d=.035, z=base['z'])
    tw = .9 * (aR - aL); depth = .035; zf = pole['z'] + pole['d'] / 2 + .02 + .04 + depth
    # the column's place along the backdrop: where it falls on the photo at pole_x
    k = (pole_x - cam.cx) / cam.f; Q = cam.P0 + pole['z'] * cam.n
    a = float((Q[0] + k * Q[2]) / (-cam.d[0] - k * cam.d[2]))
    # the TV's height: centred on the box as seen
    vc = np.mean([p[1] for p in box]) + 6; Z = -(cam.world(a, 0, zf))[2]          # a little below the box's middle, clear of its label
    yc = float((cam.cy - vc) * Z / cam.f - cam.P0[1])
    P = dict(W=img.width, H=img.height, cx=cam.cx, cy=cam.cy, f=cam.f, scale=3, P0=cam.P0.tolist(), d=cam.d.tolist(),
             n=cam.n.tolist(), a=a, tv=dict(w=tw, h=tw * .58, depth=depth, y=yc, z=zf, bezel=.008, chin=.014),
             base=base, pole=pole, screen='http://local/ai/bigtapp-tv-screen.jpg', light=[-.4, 4.5, 3.4],
             key=1.5, hemi=.65, env=.55, exposure=1.0, glow=1.0, floorShadow=.36, wallShadow=.16, contact=.5, blur=24, map=1024)
    pj = os.path.join(B3D, f'params-{name}.json'); out = os.path.join(B3D, f'tv-{name}.png')
    json.dump(P, open(pj, 'w'), indent=1)
    subprocess.run(['node', os.path.join(B3D, 'render.cjs'), pj, out], check=True)
    L = np.asarray(Image.open(out).convert('RGBA')).astype(np.float32) / 255
    L[..., :3] *= L[..., 3:]                                                     # premultiplied, then down to 1x
    L = cv2.resize(L, (img.width, img.height), interpolation=cv2.INTER_AREA)
    L = cv2.GaussianBlur(L, (0, 0), .35)
    base_px = np.asarray(img).astype(np.float32) / 255
    outp = L[..., :3] + base_px * (1 - L[..., 3:])
    return Image.fromarray(np.clip(outp * 255, 0, 255).astype(np.uint8))

# Measured on each mockup: the backdrop's horizon and vanishing point, its top and foot at column 1300, the "Live demo"
# placeholder, the QR card's dashed box, and the column's place (between the band's text and the bee).
blue_cam = Cam(533.6, 4041.6, 1300, 202, 739)
white_cam = Cam(536.2, 5613.0, 1300, 167, 734.5)
blue = Image.open(os.path.join(AI, 'bigtapp-sff-booth-blue.png')).convert('RGB')
white = Image.open(os.path.join(AI, 'bigtapp-sff-booth-white.png')).convert('RGB')
blue = qr_card(blue, blue_cam, [(1164.75, 361.25), (1218.5, 364.4), (1218.5, 425.0), (1164.75, 423.5)])
white = qr_card(white, white_cam, [(1124.0, 340.1), (1184.75, 342.0), (1184.75, 405.1), (1124.0, 404.25)])
blue = tv_on_stand(blue, blue_cam, [(1234, 334.2), (1400, 346.5), (1400, 463.0), (1234, 458.5)], 1312, 'blue')
white = tv_on_stand(white, white_cam, [(1202, 307.6), (1385, 315.4), (1385, 440.9), (1202, 438.7)], 1287.5, 'white')
blue.save(os.path.join(AI, 'bigtapp-sff-booth-blue-tv.png')); white.save(os.path.join(AI, 'bigtapp-sff-booth-white-tv.png'))
sharpen = lambda im: im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
save = lambda im, path, q: (im.save(path, 'JPEG', quality=q, optimize=True, progressive=True), print('wrote', os.path.relpath(path, ROOT)))
os.makedirs(OUT, exist_ok=True)

# The cover. 2:1 from the 3:2 photo: the band from the headline's wall down past the counter's logo.
save(sharpen(blue.crop((0, 100, 1536, 868)).resize((2400, 1200), Image.LANCZOS)), os.path.join(OUT, 'page.jpg'), 86)
# 4:3 for phones: the full height, the stand in the middle.
save(sharpen(blue.crop((77, 0, 1442, 1024)).resize((1600, 1200), Image.LANCZOS)), os.path.join(OUT, 'page-phone.jpg'), 86)

# The Events tiles: the photo card sits at (x, y), w x h, with 14 px rounded corners (measured on the tiles).
card16x9 = lambda im: im.crop((0, 80, 1536, 944))
def rounded(w, h, r, ss=4):
    m = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * ss - 1, h * ss - 1), r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)
for name, x, y, w, h in [('tile-events.jpg', 280, 470, 1280, 720), ('tile-events-phone.jpg', 40, 640, 993, 559)]:
    tile = Image.open(os.path.join(PAGE, name)).convert('RGB')
    tile.paste(card16x9(white).resize((w, h), Image.LANCZOS), (x, y), rounded(w, h, 14))
    save(tile, os.path.join(OUT, name), 88)

# The showreel's booth shot, 1920 x 1080.
if os.path.isdir(os.path.dirname(FILM)):
    save(sharpen(card16x9(blue).resize((1920, 1080), Image.BICUBIC)), FILM, 93)
