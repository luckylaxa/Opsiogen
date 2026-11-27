"""Rouge Club's illustrated ad in three places (27 Nov, the owner: "show in appropriate location and show in different
places"): the same real photos and the same light as comp.py (a roadside billboard at sunset, a bus shelter's light box
at night, a hanging screen in a concourse), with the ad in each place's proportions (art/rc-*.png, from
render-rouge.cjs). Writes out/rouge-club-<place>.jpg, and for the showreel its square tiles (build/a/rc-billboard.jpg,
rc-shelter.jpg, rc-screen.jpg, 1526 x 1529, as the film's other out-of-home tiles) and the ad itself in the film's frame
(build/a/s-rouge-ad.jpg). Usage: node render-rouge.cjs && python3 rouge.py"""
import os
import numpy as np
from PIL import Image
import comp

import cv2

def plain_banner(photo, box):
    """A lamp post's banner inside box, its printed graphics (another advertiser's) covered with its own plain red; the
    pole beside it and the sky round it stay as they are."""
    x0, y0, x1, y1 = box
    reg = np.clip(photo[y0:y1, x0:x1], 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(reg, cv2.COLOR_RGB2HSV)
    red = ((hsv[..., 0] < 13) | (hsv[..., 0] > 165)) & (hsv[..., 1] > 150) & (hsv[..., 2] > 60)   # the pole is browner (hue 14-16)
    ys, xs = np.nonzero(red)
    bx0, bx1 = np.percentile(xs, [3, 97]).astype(int); by0, by1 = np.percentile(ys, [1, 99]).astype(int)   # the banner's edges
    deep = reg[red & (hsv[..., 0] < 10) & (hsv[..., 1] > 180)].astype(np.float32)
    base = np.median(deep, 0)                                                     # its printed red, under the sun
    h, w = reg.shape[:2]
    m = np.zeros((h, w), np.float32); m[by0:by1 + 1, bx0:bx1 + 1] = 1
    m = cv2.GaussianBlur(m, (0, 0), 1.2)[..., None]                               # as soft as the photo's own edges
    yy = (np.arange(h)[:, None, None] - by0) / max(by1 - by0, 1) * 2 - 1
    fill = base * (1 - .06 * yy) + comp.grain((h, w, 3), 6.0)
    photo[y0:y1, x0:x1] = photo[y0:y1, x0:x1] * (1 - m) + fill * m

for name, fn, art in (('billboard', comp.billboard, 'rc-bb.png'), ('shelter', comp.shelter, 'rc-sh.png'), ('screen', comp.screen, 'rc-sc.png')):
    photo, (cx0, cy0, cx1, cy1) = fn(art=art)
    if name == 'billboard':   # the two banners on the lamp posts
        for box in ((470, 1780, 570, 1955), (1595, 1600, 1705, 1860)): plain_banner(photo, box)
    im = Image.fromarray(np.clip(photo, 0, 255).astype(np.uint8))
    im.save(os.path.join(comp.OUT, f'rouge-club-{name}.jpg'), quality=93)
    im.crop((cx0, cy0, cx1, cy1)).resize((1526, 1529), Image.LANCZOS).save(os.path.join(comp.TILES, f'rc-{name}.jpg'), quality=92)
    print('wrote', f'rouge-club-{name}.jpg', im.size, '-> a/' + f'rc-{name}.jpg')
Image.open(os.path.join(comp.H, 'art/rc-ad.png')).convert('RGB').save(os.path.join(comp.TILES, 's-rouge-ad.jpg'), quality=93)
print('wrote a/s-rouge-ad.jpg')
