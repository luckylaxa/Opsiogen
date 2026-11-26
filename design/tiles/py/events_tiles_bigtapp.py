"""The print page's Events tiles with BigTapp's stand (26 Nov 2026). The tiles hold the stand photo without the team
member (vantara-booth.png) on their blue card: 1:1 at (280, 470) on the desktop tile, 0.776 at (40, 640) on the phone
tile (found by matching the photo). Only the pixels booth_bigtapp.py changed (the sign, wall, counter and roll-up)
are laid in, with a soft edge, so the rest of each tile stays exactly as it was.
Usage: python3 design/tiles/py/events_tiles_bigtapp.py   (run booth_bigtapp.py first)"""
import os
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..'))
AI = os.path.join(ROOT, 'design/tiles/out/figma-print/ai')
PAGE = os.path.join(ROOT, 'public/services/ai-print-collateral')
old = cv2.imread(os.path.join(AI, 'vantara-booth.png')).astype(np.float32)
new = cv2.imread(os.path.join(AI, 'bigtapp-booth.png')).astype(np.float32)
changed = (np.abs(new - old).sum(2) > 12).astype(np.uint8)
changed = cv2.dilate(changed, np.ones((13, 13), np.uint8)).astype(np.float32)
changed = cv2.GaussianBlur(changed, (0, 0), 2)

for name, scale, x, y in [('tile-events.jpg', 1.0, 280, 470), ('tile-events-phone.jpg', 0.776, 40, 640)]:
    path = os.path.join(PAGE, name)
    tile = cv2.imread(path).astype(np.float32)
    w, h = round(1280 * scale), round(720 * scale)
    img = cv2.resize(new, (w, h), interpolation=cv2.INTER_AREA) if scale != 1 else new
    m = cv2.resize(changed, (w, h), interpolation=cv2.INTER_AREA)[..., None] if scale != 1 else changed[..., None]
    region = tile[y:y + h, x:x + w]
    tile[y:y + h, x:x + w] = region * (1 - m) + img * m
    out = Image.fromarray(cv2.cvtColor(np.clip(tile, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
    out.save(path, 'JPEG', quality=88, optimize=True, progressive=True)
    print('wrote', path)

# The showreel's booth shot (design/showreel/build/a/z-print-booth.jpg, "Service artwork: print"): the stand with the
# team member at 1.542 x, the window found on the approved still, so the shot keeps its framing.
FILM = os.path.join(ROOT, 'design/showreel/build/a/z-print-booth.jpg')
if os.path.isdir(os.path.dirname(FILM)):
    from PIL import ImageFilter
    model = Image.open(os.path.join(AI, 'bigtapp-booth-model.png')).convert('RGB')
    big = model.resize((round(1280 * 1.542), round(720 * 1.542)), Image.BICUBIC).crop((27, 14, 27 + 1920, 14 + 1080))
    big.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=2)).save(FILM, 'JPEG', quality=93)
    print('wrote', FILM)
