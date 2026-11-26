"""The print page's exhibition stand is BigTapp's real one (26 Nov 2026): our SFF 2026 booth backdrop for BigTapp,
"Building the AI-First FSI" (the owner's Figma file "BigTapp AI — Exhibition Booth Backdrop (SFF 2026)"), from its
two photo mockups: the BigTapp blue version and the white version (design/tiles/out/figma-print/ai/bigtapp-sff-booth-*.png,
1536 x 1024). It replaces the Vantara stand everywhere it was:
- the page cover, desktop 2:1 (page.jpg) and phone 4:3 (page-phone.jpg): the blue version, cropped (nothing stretched);
- the Events tile, desktop and phone: the white version in the tile's own photo card (same place, same rounded
  corners), so the page shows both looks of the project;
- the showreel's booth shot (design/showreel/build/a/z-print-booth.jpg, "Service artwork: print"): the blue version.
The mockups leave the "Live demo" space beside the QR code blank (a dashed placeholder); the owner: "Put tv for blank
space for Bigtapp booth". So the placeholder is painted out with the panel round it and a slim 16:9 TV hangs there,
on the wall's angle, showing BigTapp's Beeonix AI page (our site for them; bigtapp-tv-screen.jpg).
Usage: python3 design/tiles/py/bigtapp_booth.py"""
import os
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..'))
AI = os.path.join(ROOT, 'design/tiles/out/figma-print/ai')
PAGE = os.path.join(ROOT, 'public/services/ai-print-collateral')
FILM = os.path.join(ROOT, 'design/showreel/build/a/z-print-booth.jpg')
SCREEN = Image.open(os.path.join(AI, 'bigtapp-tv-screen.jpg')).convert('RGB')

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

def tv_layer(w, pad):
    """A slim TV, w wide (16:9), on a transparent canvas with pad round it for its shadow on the wall."""
    h = round(w * 9 / 16); W, H = w + 2 * pad, h + 2 * pad
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sh = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle((pad + w * .01, pad + h * .05, pad + w * 1.01, pad + h * 1.05), w * .012, fill=120)
    im.putalpha(sh.filter(ImageFilter.GaussianBlur(w * .02)))
    im = Image.composite(Image.new('RGBA', (W, H), (10, 14, 30, 255)), Image.new('RGBA', (W, H), (0, 0, 0, 0)), im.getchannel('A'))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((pad, pad, pad + w, pad + h), w * .012, fill=(14, 14, 17, 255))       # the body
    d.rounded_rectangle((pad, pad, pad + w, pad + h), w * .012, outline=(58, 58, 64, 255), width=max(1, round(w * .002)))
    b = round(w * .018)                                                                      # a slim bezel
    sw, sh2 = w - 2 * b, h - 2 * b
    src = SCREEN.resize((sw, round(sw * SCREEN.height / SCREEN.width)), Image.LANCZOS)
    top = max(0, (src.height - sh2) // 2)
    screen = src.crop((0, top, sw, top + sh2)).convert('RGBA')
    yy, xx = np.mgrid[0:sh2, 0:sw]   # a faint sheen across the glass, from the top left
    glare = Image.fromarray((26 * np.clip(1 - (xx / sw + yy / sh2) / .9, 0, 1)).astype(np.uint8))
    screen.alpha_composite(Image.merge('RGBA', (Image.new('L', (sw, sh2), 255),) * 3 + (glare,)))
    im.alpha_composite(screen, (pad + b, pad + b))
    return im

def with_tv(img, quad, ss=4):
    """The TV in the place of the placeholder in quad (TL, TR, BR, BL on the photo): as wide as the placeholder and
    centred in its height, mapped through the wall's own perspective."""
    img = fill(img, quad)
    q = np.float32(quad)
    bw = 1000.0; bh = bw * ((q[3][1] - q[0][1]) + (q[2][1] - q[1][1])) / 2 / (q[1][0] - q[0][0])   # the box, flat
    Hm = cv2.getPerspectiveTransform(np.float32([[0, 0], [bw, 0], [bw, bh], [0, bh]]), q)
    w = 1200; pad = 90; th = w * 9 / 16; k = bw / w                                        # the TV in box units
    y0 = (bh - th * k) / 2
    flat = np.float32([[-pad * k, y0 - pad * k], [bw + pad * k, y0 - pad * k], [bw + pad * k, y0 + (th + pad) * k], [-pad * k, y0 + (th + pad) * k]])
    dst = cv2.perspectiveTransform(flat[None], Hm)[0] * ss
    layer = tv_layer(w, pad)
    L = np.asarray(layer).astype(np.float32); L[..., :3] *= L[..., 3:4] / 255
    x0, y0b = np.floor(dst.min(0)).astype(int) - 2; x1, y1 = np.ceil(dst.max(0)).astype(int) + 2
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [layer.width, 0], [layer.width, layer.height], [0, layer.height]]), (dst - [x0, y0b]).astype(np.float32))
    out = cv2.warpPerspective(L, M, (x1 - x0, y1 - y0b), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    al = np.clip(out[..., 3:4], 0, 255); rgb = np.where(al > 0, out[..., :3] * 255 / np.maximum(al, 1e-3), 0)
    warped = Image.fromarray(np.clip(np.concatenate([rgb, al], 2), 0, 255).astype(np.uint8), 'RGBA')
    warped = warped.resize(((x1 - x0) // ss, (y1 - y0b) // ss), Image.LANCZOS).filter(ImageFilter.GaussianBlur(.35))
    base = img.convert('RGBA'); base.alpha_composite(warped, (x0 // ss, y0b // ss))
    return base.convert('RGB')

# the "Live demo" placeholders, measured on each mockup
blue = with_tv(Image.open(os.path.join(AI, 'bigtapp-sff-booth-blue.png')).convert('RGB'), [(1234, 334.2), (1400, 346.5), (1400, 463.0), (1234, 458.5)])
white = with_tv(Image.open(os.path.join(AI, 'bigtapp-sff-booth-white.png')).convert('RGB'), [(1202, 307.6), (1385, 315.4), (1385, 440.9), (1202, 438.7)])
blue.save(os.path.join(AI, 'bigtapp-sff-booth-blue-tv.png')); white.save(os.path.join(AI, 'bigtapp-sff-booth-white-tv.png'))
sharpen = lambda im: im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2))
save = lambda im, path, q: (im.save(path, 'JPEG', quality=q, optimize=True, progressive=True), print('wrote', os.path.relpath(path, ROOT)))

# The cover. 2:1 from the 3:2 photo: the band from the headline's wall down past the counter's logo.
save(sharpen(blue.crop((0, 100, 1536, 868)).resize((2400, 1200), Image.LANCZOS)), os.path.join(PAGE, 'page.jpg'), 86)
# 4:3 for phones: the full height, the stand in the middle.
save(sharpen(blue.crop((77, 0, 1442, 1024)).resize((1600, 1200), Image.LANCZOS)), os.path.join(PAGE, 'page-phone.jpg'), 86)

# The Events tiles: the photo card sits at (x, y), w x h, with 14 px rounded corners (measured on the tiles).
card16x9 = lambda im: im.crop((0, 80, 1536, 944))
def rounded(w, h, r, ss=4):
    m = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * ss - 1, h * ss - 1), r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)
for name, x, y, w, h in [('tile-events.jpg', 280, 470, 1280, 720), ('tile-events-phone.jpg', 40, 640, 993, 559)]:
    path = os.path.join(PAGE, name)
    tile = Image.open(path).convert('RGB')
    tile.paste(card16x9(white).resize((w, h), Image.LANCZOS), (x, y), rounded(w, h, 14))
    save(tile, path, 88)

# The showreel's booth shot, 1920 x 1080.
if os.path.isdir(os.path.dirname(FILM)):
    save(sharpen(card16x9(blue).resize((1920, 1080), Image.BICUBIC)), FILM, 93)
