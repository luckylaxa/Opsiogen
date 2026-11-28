"""Blog covers (owner, 28 Nov 2026: six real articles, covers from our own service artwork, no client logos and no
AI-made people; then "why white space on left" and "this too": the 4:3 tiles keep their left and top clear for the
service page's heading, which a cover doesn't have). Every cover is 16:10 (1600 x 1000) with its artwork across the
frame and even margins, at its own size or smaller (never enlarged):
- the website revamp tile, whose two pages already fill the width, cut from the 4:3 tile (1600 x 1200) by dropping
  the empty band at the top;
- three service pages' wide top images (2400 x 1200), whose devices spread across the frame: product design and
  automation cut in the middle; social, whose cards run nearly edge to edge, cut a little wider with its plain
  background continued above (mirrored, sharp, as design/tiles does);
- the brand rollout tile's site, phone and poster, centred in the frame, the tile's plain background continued past
  its edges with its own gradient (fitted from the background);
- the SEO tile's three cards at their own size, in two columns in the middle, on the tile's own gradient.
The post page shows the cover at 21:10 on wider screens (the middle 762 rows), so nothing that matters sits in the
top or bottom 119 rows unless it runs off the edge anyway.
Usage: python3 design/blog/covers.py  ->  public/blog/<slug>.jpg"""
import os
import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SRC = os.path.join(ROOT, 'public', 'services')
OUT = os.path.join(ROOT, 'public', 'blog')
SIZE = (1600, 1000)
load = lambda p: Image.open(os.path.join(SRC, p)).convert('RGB')
save = lambda im, slug: (im.save(os.path.join(OUT, slug + '.jpg'), quality=88, optimize=True, progressive=True), print(slug, im.size))

# The revamp tile: its old and new pages fill the width.
save(load('ai-websites/tile-revamp.jpg').crop((0, 200, 1600, 1200)), 'how-to-brief-a-website-redesign')

# Product design (devices across x 300-2090) and automation (x 300-2090): the middle 1920 columns hold them all.
for slug, wide in {
    'designing-a-product-people-use-without-training': 'ai-product-design/page.jpg',
    'where-ai-automation-fits-in-everyday-operations': 'ai-automation/page.jpg',
}.items():
    save(load(wide).crop((240, 0, 2160, 1200)).resize(SIZE, Image.LANCZOS), slug)

# Social: the cards span x 240-2320 and start 210 rows down; columns 160-2400 centre them, and 200 rows of the plain
# background above (mirrored from the top rows) make the frame 16:10.
wide = np.asarray(load('ai-social-media-marketing/page.jpg'))
wide = np.concatenate([wide[1:201][::-1], wide], 0)[:, 160:2400]
save(Image.fromarray(wide).resize(SIZE, Image.LANCZOS), 'planning-a-month-of-social-content-in-one-sitting')

def terms(x, y):   # a smooth surface over a 4:3 tile
    x, y = x / 1600.0, y / 1200.0
    return np.stack([np.ones_like(x), x, y, x * x, y * y, x * y, x ** 3, y ** 3], -1)


def gradient(tile, background):
    """The tile's background as a smooth surface, fitted on the pixels `background` marks (every 4th)."""
    H, W = tile.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    pick = background & ((xx % 4) == 0) & ((yy % 4) == 0)
    A = terms(xx[pick], yy[pick])
    coef = np.linalg.lstsq(A, tile[pick], rcond=None)[0]
    print('  gradient fit: residual sd', (tile[pick] - A @ coef).std(axis=0).round(2))
    return coef


grain = lambda shape: np.random.default_rng(7).normal(0, 0.8, shape)   # the tiles' own fine noise

# Brand: the rollout tile's site, phone and poster (x 160-1568, y 420-1068, measured) centred in a 1600 x 1000 window.
# Where the window runs past the tile (64 px at the right, 44 at the bottom), the background continues as its fitted
# gradient plus the tile's own grain, taken from the plain band along that edge (the last 20 columns, clear of the
# poster's edge and its halo, which end at column 1576; the last 40 rows) and mirrored back and forth, so the edge doesn't show.
tile = np.asarray(load('ai-brand-services/tile-rollout.jpg')).astype(np.float64)
H, W = tile.shape[:2]
ART = (160, 420, 1568, 1068)
yy, xx = np.mgrid[0:H, 0:W]
coef = gradient(tile, ~((xx > ART[0] - 20) & (xx < ART[2] + 20) & (yy > ART[1] - 20) & (yy < ART[3] + 20)))
grainy = tile - terms(xx.astype(np.float64), yy.astype(np.float64)) @ coef   # the tile's texture over its gradient


def fold(v, n, band):   # a coordinate past the edge (v >= n), folded back and forth inside the last `band` pixels
    d = np.where(v >= n, v - n, 0) % (2 * band)
    return np.where(v >= n, n - 1 - np.where(d < band, d, 2 * band - 1 - d), v)


wx0 = (ART[0] + ART[2]) // 2 - SIZE[0] // 2
wy0 = (ART[1] + ART[3]) // 2 - SIZE[1] // 2
gy, gx = np.mgrid[wy0:wy0 + SIZE[1], wx0:wx0 + SIZE[0]]
win = terms(gx.astype(np.float64), gy.astype(np.float64)) @ coef + grainy[fold(gy, H, 40), fold(gx, W, 20)]
assert wx0 >= 0 and wy0 >= 0 and W - 20 > 1576 and H - 40 > ART[3]
print('  window', (wx0, wy0), 'art margins', ART[0] - wx0, wx0 + SIZE[0] - ART[2], ART[1] - wy0, wy0 + SIZE[1] - ART[3])
save(Image.fromarray(np.clip(win, 0, 255).astype(np.uint8)), 'keeping-a-brand-consistent-across-every-channel')

# SEO: the tile's cards (search result, ranking chart, organic visits; corners 28 px), measured on the tile.
tile = np.asarray(load('digital-marketing/tile-seo.jpg')).astype(np.float64)
SEARCH, CHART, VISITS = (880, 170, 1560, 473), (170, 560, 770, 913), (820, 540, 1380, 1073)
H, W = tile.shape[:2]
bg = np.ones((H, W), bool)
for x0, y0, x1, y1 in (SEARCH, CHART, VISITS):
    bg[max(0, y0 - 14):y1 + 14, max(0, x0 - 14):x1 + 14] = False
coef = gradient(tile, bg)
cy, cx = np.mgrid[0:SIZE[1], 0:SIZE[0]]
canvas = terms(cx.astype(np.float64), cy * 1.2) @ coef + grain((SIZE[1], SIZE[0], 3))
out = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8))

# Two columns in the middle: the search result over the chart on the left, the visits card on the right, 50 px apart.
size = lambda c: (c[2] - c[0], c[3] - c[1])
(sw, sh), (cw, ch), (vw, vh) = size(SEARCH), size(CHART), size(VISITS)
gap = 50
bw, bh = sw + gap + vw, sh + gap + ch
x0, y0 = (SIZE[0] - bw) // 2, (SIZE[1] - bh) // 2
place = {SEARCH: (x0, y0), CHART: (x0, y0 + sh + gap), VISITS: (x0 + sw + gap, y0 + (bh - vh) // 2)}
print('cards from', (x0, y0), 'to', (x0 + bw, y0 + bh))
src, SS, R = Image.fromarray(tile.astype(np.uint8)), 4, 28
for box, at in place.items():
    w, h = size(box)
    m = Image.new('L', (w * SS, h * SS), 0)   # the card's own rounded shape, a pixel inside its painted edge
    ImageDraw.Draw(m).rounded_rectangle((SS, SS, w * SS - SS - 1, h * SS - SS - 1), (R - 1) * SS, fill=255)
    out.paste(src.crop(box), at, m.resize((w, h), Image.LANCZOS))
save(out, 'how-to-show-up-in-google-and-ai-answers')
