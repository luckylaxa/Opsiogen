"""Tiles that work on desktop (4:3) and in the tall phone card (right 58% of the tile).
tile3(scene, art, out, box, fw, fr, ft): box = the device's bounding box in the scene (x1,y1,x2,y2);
the device fills `fw` of the tile width, its right edge at `fr`, its top at `ft` of the height.
Plain backgrounds are continued by mirroring where the crop runs past the scene (sharp, no blur).
`dark` multiplies the photo (not the screen) for a lower-key scene. No blur anywhere."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comp import place
from quad import find_quad
from PIL import Image, ImageDraw, ImageFilter
OUT = (1600, 1200)
def expand(q, px):
    c = np.mean(q, 0); return [tuple(c + (np.array(p) - c) * (1 + px / np.linalg.norm(np.array(p) - c))) for p in q]
def tile3(scene, art, out, box, fw=0.54, fr=0.97, ft=0.44, radius=0, dark=1.0, artcrop=None, restore=95, quad=None):
    im = np.array(Image.open(scene).convert('RGB')).astype(float); H, W = im.shape[:2]
    q = quad or find_quad(scene)[0]
    x1, y1, x2, y2 = box
    w = (x2 - x1) / fw; h = w * 3 / 4
    x0 = x2 - fr * w; y0 = y1 - ft * h
    pl, pt = max(0, -int(np.floor(x0))), max(0, -int(np.floor(y0)))
    pr, pb = max(0, int(np.ceil(x0 + w)) - W), max(0, int(np.ceil(y0 + h)) - H)
    print(os.path.basename(out), 'pad l/t/r/b', pl, pt, pr, pb, 'zoom', round(H / h, 2))
    if dark != 1.0: im = im * dark
    im = np.pad(im, ((pt, pb), (pl, pr), (0, 0)), mode='symmetric')
    x0 += pl; y0 += pt; q = [(x + pl, y + pt) for x, y in q]
    img = Image.fromarray(np.clip(im, 0, 255).astype('uint8'))
    k = OUT[0] / w
    crop = img.crop((round(x0), round(y0), round(x0 + w), round(y0 + h))).resize(OUT, Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(1.2, 50, 2))
    qq = [((x - x0) * k, (y - y0) * k) for x, y in q]
    a = Image.open(art).convert('RGBA')
    if artcrop: a = a.crop(artcrop)
    orig = np.array(crop).astype(float)
    p = place(crop, a, expand(qq, 1.5 * k), radius=radius, glass=0.03, ss=2)
    pa = np.array(p).astype(float)
    m = Image.new('L', OUT, 0); ImageDraw.Draw(m).polygon([tuple(v) for v in expand(qq, 3 * k)], fill=255); m = np.array(m) > 0
    sel = m & (orig.mean(2) < restore); pa[sel] = orig[sel]
    Image.fromarray(np.clip(pa, 0, 255).astype('uint8')).save(out, quality=92)
