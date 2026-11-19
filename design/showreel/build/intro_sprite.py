"""The site's first-visit intro images (src/components/motion/IntroLoader.tsx) from intro-frames.cjs's renders:
public/intro/turn.webp, one full turn as TURN frames side by side (F px each, frame 0 faces the visitor), and
public/intro/shell.webp, the front view larger with its lens glass cut out, so the page shows through the lens as
the character rushes at the screen.
Usage: python3 intro_sprite.py FRAMES_DIR"""
import sys, os, glob
import numpy as np
from PIL import Image
FR = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'public', 'intro')
os.makedirs(OUT, exist_ok=True)
F, BIG = 288, 640
GLASS = 0.283                                    # the hole's radius, a fraction of the picture (the glass edge is at 0.29)
frames = sorted(glob.glob(os.path.join(FR, 'turn-*.png')))
box = Image.open(frames[0]).getbbox()            # the sphere and its light, the same box in every frame
pad = 8; box = (box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad)
strip = Image.new('RGBA', (F * len(frames), F), (0, 0, 0, 0))
for i, f in enumerate(frames):
    strip.paste(Image.open(f).crop(box).resize((F, F), Image.LANCZOS), (i * F, 0))
strip.save(os.path.join(OUT, 'turn.webp'), 'WEBP', quality=78, method=6, alpha_quality=80)
shell = np.asarray(Image.open(os.path.join(FR, 'front.png')).crop(box).resize((BIG, BIG), Image.LANCZOS)).copy()
y, x = np.mgrid[0:BIG, 0:BIG] + 0.5
r = np.hypot(x - BIG / 2, y - BIG / 2) / BIG
shell[..., 3] = (shell[..., 3] * np.clip((r - GLASS) * BIG / 1.5, 0, 1)).astype(np.uint8)   # a 1.5 px soft edge
Image.fromarray(shell).save(os.path.join(OUT, 'shell.webp'), 'WEBP', quality=80, method=6, alpha_quality=85)
for n in ('turn.webp', 'shell.webp'):
    print(n, os.path.getsize(os.path.join(OUT, n)) // 1024, 'KB')
print('frames', len(frames), 'box', box)
