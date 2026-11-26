"""The print page's exhibition stand is BigTapp's real one (26 Nov 2026): our SFF 2026 booth backdrop for BigTapp,
"Building the AI-First FSI" (the owner's Figma file "BigTapp AI — Exhibition Booth Backdrop (SFF 2026)"), from its
two photo mockups: the BigTapp blue version and the white version (design/tiles/out/figma-print/ai/bigtapp-sff-booth-*.png,
1536 x 1024). It replaces the Vantara stand everywhere it was:
- the page cover, desktop 2:1 (page.jpg) and phone 4:3 (page-phone.jpg): the blue version, cropped (nothing stretched);
- the Events tile, desktop and phone: the white version in the tile's own photo card (same place, same rounded
  corners), so the page shows both looks of the project;
- the showreel's booth shot (design/showreel/build/a/z-print-booth.jpg, "Service artwork: print"): the blue version.
Usage: python3 design/tiles/py/bigtapp_booth.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..'))
AI = os.path.join(ROOT, 'design/tiles/out/figma-print/ai')
PAGE = os.path.join(ROOT, 'public/services/ai-print-collateral')
FILM = os.path.join(ROOT, 'design/showreel/build/a/z-print-booth.jpg')
blue = Image.open(os.path.join(AI, 'bigtapp-sff-booth-blue.png')).convert('RGB')
white = Image.open(os.path.join(AI, 'bigtapp-sff-booth-white.png')).convert('RGB')
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
