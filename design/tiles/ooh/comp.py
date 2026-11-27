"""Real photos with our artwork on their blank panels (27 Nov, the owner on the showreel's out-of-home tiles: "It looks
like ai generated. Can you replace the better mockups"). Each photo is a real one from Unsplash (free licence, no
credits): a roadside billboard at sunset, a bus shelter at night with a glowing panel, a hanging screen in a concourse
(photos/). Each panel's corners were found on the photo (panel.py); the artwork (art/, from render.cjs) is mapped on in
the photo's own perspective and then lit like the panel it replaces: the billboard's paper (its warm sunlight, creases
and seams), the shelter's light box (glow, falloff, a soft halo) and the screen (a slight vignette). The photo's grain
and softness are matched; nothing else in the photos is changed, except the outdoor company's label on the shelter's
frame, painted out.
Writes out/<name>.jpg (the whole photo) and the showreel's square tiles (design/showreel/build/a/rs-09.jpg, nc-14.jpg,
sl-08.jpg, 1526 x 1529).
Usage: python3 design/tiles/ooh/comp.py"""
import os
import numpy as np, cv2
from PIL import Image

H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, '../../..'))
OUT = os.path.join(H, 'out'); os.makedirs(OUT, exist_ok=True)
TILES = os.path.join(ROOT, 'design/showreel/build/a')
rng = np.random.default_rng(7)

lin = lambda x: np.where(x / 255 <= .04045, x / 255 / 12.92, ((x / 255 + .055) / 1.055) ** 2.4)
srgb = lambda y: np.where(np.clip(y, 0, 1) <= .0031308, np.clip(y, 0, 1) * 12.92, 1.055 * np.clip(y, 0, 1) ** (1 / 2.4) - .055) * 255
luma = lambda a: a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722

def warp(art_path, quad, ss=3):
    """The artwork mapped onto quad (TL, TR, BR, BL): its colour (sRGB, float) and coverage, in the quad's bounding box."""
    art = Image.open(art_path).convert('RGB')
    q = np.float32(quad); x0, y0 = np.floor(q.min(0)).astype(int) - 2; x1, y1 = np.ceil(q.max(0)).astype(int) + 2
    w = np.linalg.norm(q[1] - q[0]) / 2 + np.linalg.norm(q[2] - q[3]) / 2; h = np.linalg.norm(q[3] - q[0]) / 2 + np.linalg.norm(q[2] - q[1]) / 2
    art = np.asarray(art.resize((int(w * ss), int(h * ss)), Image.LANCZOS)).astype(np.float32)   # about 1:1 before the warp
    src = np.float32([[0, 0], [art.shape[1], 0], [art.shape[1], art.shape[0]], [0, art.shape[0]]])
    M = cv2.getPerspectiveTransform(src, ((q - [x0, y0]) * ss).astype(np.float32))
    size = ((x1 - x0) * ss, (y1 - y0) * ss)
    rgb = cv2.warpPerspective(art, M, size, flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    cov = cv2.warpPerspective(np.ones(art.shape[:2], np.float32), M, size, flags=cv2.INTER_LINEAR)
    down = lambda a: cv2.resize(a, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    return down(np.clip(rgb, 0, 255)), np.clip(down(cov), 0, 1), (x0, y0, x1, y1)

def grain(shape, std, chroma=.35, size=.7):
    """Film or sensor grain: mostly brightness, a little colour, slightly clumped."""
    g = rng.normal(0, 1, shape[:2]).astype(np.float32)
    c = rng.normal(0, 1, shape).astype(np.float32)
    n = g[..., None] + chroma * c
    return cv2.GaussianBlur(n, (0, 0), size) * std / max(cv2.GaussianBlur(n, (0, 0), size).std(), 1e-6)

def place(photo, rgb, cov, box):
    x0, y0, x1, y1 = box
    region = photo[y0:y1, x0:x1]
    photo[y0:y1, x0:x1] = region * (1 - cov[..., None]) + rgb * cov[..., None]

def billboard():
    photo = np.asarray(Image.open(os.path.join(H, 'photos/billboard-dusk-r2Pmvr_7Dec.jpg')).convert('RGB')).astype(np.float32)
    # the billboard company's name on the small sign on the pole, painted out with the sign's own dark face
    fx0, fy0, fx1, fy1 = 1144, 1600, 1273, 1645
    face = photo[fy0:fy1, fx0:fx1]
    text = cv2.dilate((luma(face) > 75).astype(np.uint8), np.ones((5, 5), np.uint8))
    face = cv2.inpaint(np.clip(face, 0, 255).astype(np.uint8), text, 6, cv2.INPAINT_TELEA).astype(np.float32)
    photo[fy0:fy1, fx0:fx1] = np.where(text[..., None] > 0, face + grain(face.shape, 6.0), face)
    quad = [(793.0, 1078.1), (1634.3, 1067.8), (1637.9, 1414.4), (790.1, 1419.7)]
    rgb, cov, box = warp(os.path.join(H, 'art/rs.png'), quad)
    x0, y0, x1, y1 = box
    paper = photo[y0:y1, x0:x1]
    L = luma(lin(paper)); inside = cov > .99
    Ls = cv2.GaussianBlur(L, (0, 0), 30); Ls = np.where(inside, Ls, np.median(L[inside]))
    detail = np.clip(L / np.maximum(cv2.GaussianBlur(L, (0, 0), 6), 1e-4), .85, 1.15)            # creases and seams
    light = (Ls / np.percentile(Ls[inside], 90))[..., None]                                         # the sun's falloff
    tint = lin(np.median(paper[inside], 0)) / luma(lin(np.median(paper[inside], 0))[None])[0]      # the warm paper
    white = luma(lin(np.median(paper[inside], 0))[None])[0]
    a = lin(rgb)
    out = white * light * tint * (.022 + .978 * a) * (1 + (detail[..., None] - 1) * .9) + (detail[..., None] - 1) * .012
    out = cv2.GaussianBlur(srgb(out).astype(np.float32), (0, 0), .75) + grain(out.shape, 6.5)
    place(photo, out, cov, box)
    return photo, (290, 860, 1830, 2400)     # the square: the board, the lamps above it, the pole, trees and the car

def shelter():
    photo = np.asarray(Image.open(os.path.join(H, 'photos/bus-shelter-night-csDVMvtsS50.jpg')).convert('RGB')).astype(np.float32)
    # the outdoor company's label on the frame, painted out with the frame on either side of it
    ya, yb, xa, xb = 1447, 1477, 1440, 1614
    t = np.linspace(0, 1, xb - xa)[None, :, None]
    left = photo[ya:yb, xa - 6:xa].mean(1, keepdims=True); right = photo[ya:yb, xb:xb + 6].mean(1, keepdims=True)
    photo[ya:yb, xa:xb] = left * (1 - t) + right * t + grain((yb - ya, xb - xa, 3), 3.0)
    quad = [(1134.2, 1477.9), (1879.9, 1476.3), (1886.0, 2548.3), (1128.3, 2548.9)]
    rgb, cov, box = warp(os.path.join(H, 'art/nc.png'), quad)
    x0, y0, x1, y1 = box
    panel = photo[y0:y1, x0:x1]; inside = cov > .99
    L = luma(lin(panel)); Ls = cv2.GaussianBlur(L, (0, 0), 20); Ls = np.where(inside, Ls, np.percentile(L[inside], 95))
    back = np.clip(Ls / np.percentile(Ls[inside], 97), 0, 1)[..., None]                              # the light box's falloff
    a = lin(rgb) * back * 1.04
    a = a + .10 * cv2.GaussianBlur(a, (0, 0), 7) + .05 * cv2.GaussianBlur(a, (0, 0), 22)            # a soft halo on the glass
    out = srgb(a).astype(np.float32)
    quiet = 1 - .75 * (luma(out) / 255)[..., None]                                                   # a phone's night noise sits in the darks
    out = cv2.GaussianBlur(out, (0, 0), .6) + grain(a.shape, 2.6, size=.8) * quiet
    place(photo, out, cov, box)
    return photo, (430, 1250, 2230, 3050)    # the panel, the shelter's frame, the wet street and the bench

def screen():
    photo = np.asarray(Image.open(os.path.join(H, 'photos/concourse-screen-2a9IpjX5Kek.jpg')).convert('RGB')).astype(np.float32)
    quad = [(921.2, 281.5), (2958.3, 281.5), (2948.9, 1430.0), (926.1, 1432.9)]
    rgb, cov, box = warp(os.path.join(H, 'art/sl.png'), quad, ss=2)
    x0, y0, x1, y1 = box
    panel = photo[y0:y1, x0:x1]; inside = cov > .99
    L = luma(lin(panel)); Ls = cv2.GaussianBlur(L, (0, 0), 40); Ls = np.where(inside, Ls, np.percentile(L[inside], 95))
    vig = np.clip(Ls / np.percentile(Ls[inside], 98), .9, 1)[..., None]
    yy, xx = np.mgrid[0:rgb.shape[0], 0:rgb.shape[1]]
    glare = np.clip(1 - (xx / rgb.shape[1] * .7 + yy / rgb.shape[0] * .5), 0, 1)[..., None] * .018   # a faint sheen
    a = (.012 + .955 * lin(rgb)) * vig + glare
    out = cv2.GaussianBlur(srgb(a).astype(np.float32), (0, 0), .55) + grain(a.shape, 2.2)
    place(photo, out, cov, box)
    return photo, (712, 0, 3168, 2456)       # the screen, the pillars and the people walking under it

def interp(img, known, sigmas=(4, 10, 24, 60, 140, 320, 700)):
    """Each unknown pixel from the known ones round it, nearest first (normalized convolution, finer to coarser; the
    coarse passes run on a 1/8 image so their weights never vanish)."""
    out, done = img.astype(np.float64), known.copy()
    k = known.astype(np.float64)
    for s in sigmas:
        if s < 100:
            w = cv2.GaussianBlur(k, (0, 0), s); est = cv2.GaussianBlur(out * k[..., None], (0, 0), s) / np.maximum(w, 1e-9)[..., None]
        else:
            f = 8; sm = lambda a: cv2.resize(a, (a.shape[1] // f, a.shape[0] // f), interpolation=cv2.INTER_AREA)
            ws = cv2.GaussianBlur(sm(k), (0, 0), s / f); es = cv2.GaussianBlur(sm(out * k[..., None]), (0, 0), s / f)
            up = lambda a: cv2.resize(a, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)
            w = up(ws); est = up(es) / np.maximum(w, 1e-12)[..., None]
        ok = ~done & ((w > .15) | (s == sigmas[-1]))
        out[ok] = est[ok]; done |= ok
    return out.astype(np.float32)

def unbrand(photo, box, thr=28):
    """Text and logos on a pale board inside box, painted out with the board round them."""
    x0, y0, x1, y1 = box
    region = np.clip(photo[y0:y1, x0:x1], 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(region, cv2.COLOR_RGB2HSV)
    board = np.percentile(luma(region.astype(np.float32)), 85)
    ink = ((board - luma(region.astype(np.float32)) > thr) | (hsv[..., 1] > 70)).astype(np.uint8)
    ink = cv2.dilate(ink, np.ones((5, 5), np.uint8))
    photo[y0:y1, x0:x1] = cv2.inpaint(region, ink, 7, cv2.INPAINT_TELEA).astype(np.float32) + grain(region.shape, 2.5) * ink[..., None]

def booth():
    """The Rohde & Schwarz stand (27 Nov, the owner: "Replace this one also", the AI booth "Make ideas real."): a real
    trade-fair photo of a stand's outer wall, a white band lit by four arm spotlights over a printed panel. The panel
    gets our artwork (art/bp.png, at the panel's own proportions: the wall measured in the photo's perspective) under the
    band's own light, and the band gets the R&S logo in navy where the stand's logo was. Other companies' names in the
    photo (the brochure counter, a stand behind) are painted out."""
    photo = np.asarray(Image.open(os.path.join(H, 'photos/booth-wall-mE_36BQ6oeg.jpg')).convert('RGB')).astype(np.float32)
    for b in ((664, 1366, 720, 1504), (597, 1508, 717, 1559), (595, 1562, 717, 1609), (506, 1815, 598, 2032)):
        unbrand(photo, b)
    wall = np.float32([(1430.2, 513.8), (2863.8, -221.0), (2877.0, 2903.8), (1426.0, 2385.0)])
    panel = [(1460.8, 1190.7), (2782.2, 905.8), (2803.7, 2753.2), (1458.0, 2319.8)]
    h, w = photo.shape[:2]
    inwall = np.zeros((h, w), np.uint8); cv2.fillPoly(inwall, [np.round(wall).astype(np.int32)], 1)
    inpan = np.zeros((h, w), np.uint8); cv2.fillPoly(inpan, [np.round(np.float32(panel)).astype(np.int32)], 1)
    near_pan = cv2.dilate(inpan, np.ones((25, 25), np.uint8)).astype(bool)
    # the wall's top edge, to keep the spotlights and their arms out of every mask
    top = lambda x: wall[0][1] + (wall[1][1] - wall[0][1]) * (x - wall[0][0]) / (wall[1][0] - wall[0][0])
    yy, xx = np.mgrid[0:h, 0:w]
    below_lamps = yy > top(xx) + 200
    hsv = cv2.cvtColor(np.clip(photo, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    lum = luma(photo); sat = hsv[..., 1]
    # the wall's own coordinates: u right, v down, its left edge 1 tall (a level camera of a phone's focal length)
    uv = np.float32([(0, 0), (.843, -.025), (.847, .975), (-.004, 1.0)])
    Hw = cv2.getPerspectiveTransform(uv, wall)
    area = lambda u0, v0, u1, v1: cv2.perspectiveTransform(np.float32([[(u0, v0), (u1, v0), (u1, v1), (u0, v1)]]), Hw)[0]
    old = np.zeros((h, w), np.uint8); cv2.fillPoly(old, [np.round(area(.08, .1, .77, .315)).astype(np.int32)], 1)
    band = inwall.astype(bool) & ~near_pan & below_lamps
    # the stand's old logo: darker than the wall round it (a closing takes the letters out of the wall's shading) or red
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (71, 71))
    bgrgb = np.dstack([cv2.morphologyEx(photo[..., c], cv2.MORPH_CLOSE, k) for c in range(3)])
    ink = old.astype(bool) & band & (((luma(bgrgb) - lum) > 16) | (sat > 45))
    ink = cv2.dilate(ink.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool) & band
    white = inwall.astype(bool) & ~near_pan & ~ink & below_lamps & (lum > 90) & (sat < 50)
    L = lin(photo)
    L[ink] = lin(cv2.GaussianBlur(bgrgb, (0, 0), 4))[ink]                      # the wall as it is round the letters
    wallw = interp(L, white | ink)                                             # the lit white wall everywhere on it
    # the R&S logo on the band, in navy ink, through the wall's perspective
    logo = Image.open(os.path.join(H, 'art/rs-logo-wall.png'))
    lw = .52; lh = lw * logo.height / logo.width; u0, v0 = .425 - lw / 2, .205 - lh / 2
    rect = np.float32([(u0, v0), (u0 + lw, v0), (u0 + lw, v0 + lh), (u0, v0 + lh)])
    dst = cv2.perspectiveTransform(rect[None], Hw)[0]
    ss = 3; big = np.asarray(logo.resize((logo.width * 3, logo.height * 3), Image.LANCZOS)).astype(np.float32)
    x0, y0 = np.floor(dst.min(0)).astype(int) - 2; x1, y1 = np.ceil(dst.max(0)).astype(int) + 2
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [big.shape[1], 0], [big.shape[1], big.shape[0]], [0, big.shape[0]]]), ((dst - [x0, y0]) * ss).astype(np.float32))
    warped = cv2.warpPerspective(big, M, ((x1 - x0) * ss, (y1 - y0) * ss), flags=cv2.INTER_LINEAR)
    warped = cv2.resize(warped, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    al = (warped[..., 3:] / 255) * .97
    navy = lin(warped[..., :3])
    L[y0:y1, x0:x1] = L[y0:y1, x0:x1] * (1 - al) + L[y0:y1, x0:x1] * navy * al
    # the panel: the artwork as the print, lit by the light that falls on the white wall at each point
    rgb, cov, box = warp(os.path.join(H, 'art/bp.png'), panel)
    bx0, by0, bx1, by1 = box
    a = lin(rgb); Wl = wallw[by0:by1, bx0:bx1]
    pan = Wl * (.018 + .97 * a)
    L[by0:by1, bx0:bx1] = L[by0:by1, bx0:bx1] * (1 - cov[..., None]) + pan * cov[..., None]
    out = srgb(L).astype(np.float32)
    changed = ink.copy(); changed[by0:by1, bx0:bx1] |= cov > .01; changed[y0:y1, x0:x1] |= al[..., 0] > .01
    soft = cv2.GaussianBlur(out, (0, 0), .7)
    out = np.where(changed[..., None], soft + grain(out.shape, 3.2), photo)
    return out, (270, 330, 2870, 2930)       # the wall, the stand behind it with people, the stools and the floor

for name, fn, tile in (('rohde-schwarz-billboard', billboard, 'rs-09.jpg'), ('norsecom-bus-shelter', shelter, 'nc-14.jpg'),
                       ('sandlogic-screen', screen, 'sl-08.jpg'), ('rohde-schwarz-booth', booth, 'rs-07.jpg')):
    photo, (cx0, cy0, cx1, cy1) = fn()
    im = Image.fromarray(np.clip(photo, 0, 255).astype(np.uint8))
    im.save(os.path.join(OUT, name + '.jpg'), quality=93)
    sq = im.crop((cx0, cy0, cx1, cy1)).resize((1526, 1529), Image.LANCZOS)
    sq.save(os.path.join(OUT, name + '-square.jpg'), quality=93)
    # Not written into the showreel's build any more: the owner kept the earlier tiles (27 Nov, "Use previous version").
    print('wrote', name, im.size, '-> tile', tile)
