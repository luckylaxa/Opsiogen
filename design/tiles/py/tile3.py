"""Tiles that work on desktop (4:3) and in the tall phone card (right 58% of the tile).
tile3(scene, art, out, box, fw, fr, ft): box = the device's bounding box in the scene (x1,y1,x2,y2);
the device fills `fw` of the tile width, its right edge at `fr`, its top at `ft` of the height.
Plain backgrounds are continued by mirroring where the crop runs past the scene (sharp, no blur).
`dark` multiplies the photo (not the screen) for a lower-key scene. No blur anywhere."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comp import place, coeffs
from fit import screen_mask, fit_quad
from quad import find_quad
from PIL import Image, ImageDraw, ImageFilter
OUT = (1600, 1200)
def expand(q, px):
    c = np.mean(q, 0); return [tuple(c + (np.array(p) - c) * (1 + px / np.linalg.norm(np.array(p) - c))) for p in q]
def tile3(scene, art, out, box, fw=0.54, fr=0.97, ft=0.44, radius=0, dark=1.0, artcrop=None, restore=95, quad=None):
    src = np.array(Image.open(scene).convert('RGB'))
    im = src.astype(float); H, W = im.shape[:2]
    smask = screen_mask(src)                      # the screen's real shape
    q = quad or fit_quad(smask)
    x1, y1, x2, y2 = box
    w = (x2 - x1) / fw; h = w * 3 / 4
    x0 = x2 - fr * w; y0 = y1 - ft * h
    pl, pt = max(0, -int(np.floor(x0))), max(0, -int(np.floor(y0)))
    pr, pb = max(0, int(np.ceil(x0 + w)) - W), max(0, int(np.ceil(y0 + h)) - H)
    print(os.path.basename(out), 'pad l/t/r/b', pl, pt, pr, pb, 'zoom', round(H / h, 2))
    if dark != 1.0: im = im * dark
    im = np.pad(im, ((pt, pb), (pl, pr), (0, 0)), mode='symmetric')
    mk = np.pad(smask, ((pt, pb), (pl, pr)), mode='constant')
    x0 += pl; y0 += pt; q = [(x + pl, y + pt) for x, y in q]
    box_ = (round(x0), round(y0), round(x0 + w), round(y0 + h))
    crop = Image.fromarray(np.clip(im, 0, 255).astype('uint8')).crop(box_).resize(OUT, Image.LANCZOS)
    crop = crop.filter(ImageFilter.UnsharpMask(1.2, 50, 2))
    # screen mask in tile space, grown by one scene pixel so the design meets the bezel
    import cv2
    # take in the soft grey ring between the white screen and the black bezel (not the bezel itself)
    lum = np.pad(src.min(axis=2), ((pt, pb), (pl, pr)), mode='symmetric')
    mk = (cv2.dilate(mk, np.ones((5, 5), np.uint8)) > 0) & (lum > 70)
    mk = (mk * 255).astype('uint8')
    alpha = np.array(Image.fromarray(mk).crop(box_).resize(OUT, Image.LANCZOS)).astype(float) / 255
    k = OUT[0] / w
    qq = [((x - box_[0]) * k, (y - box_[1]) * k) for x, y in q]
    a = Image.open(art).convert('RGBA')
    if artcrop: a = a.crop(artcrop)
    aw, ah = a.size; ss = 2
    warped = a.transform((OUT[0] * ss, OUT[1] * ss), Image.PERSPECTIVE,
                         coeffs([(x * ss, y * ss) for x, y in expand(qq, 2 * k)], [(0, 0), (aw, 0), (aw, ah), (0, ah)]), Image.BICUBIC).resize(OUT, Image.LANCZOS)
    wa = np.array(warped).astype(float); al = alpha * wa[..., 3] / 255
    out_ = np.array(crop).astype(float) * (1 - al[..., None]) + wa[..., :3] * al[..., None]
    Image.fromarray(np.clip(out_, 0, 255).astype('uint8')).save(out, quality=92)
