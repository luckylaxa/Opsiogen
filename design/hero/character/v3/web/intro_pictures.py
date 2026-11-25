"""The site's intro pictures and the Home character's still, from intro.cjs's frames:
public/intro/turn.webp     one full turn, 12 frames side by side (frame 0 faces the visitor), framed exactly as the Home
                           character's own 3D canvas, so the intro can land on it at the same size;
public/intro/shell.webp    the front, larger, with its visor cut out, so the page shows through it as it rushes at the
                           screen (the ending on pages other than Home);
public/home/character-front.webp   the still the Home character shows until its 3D is drawn.
Usage: python3 intro_pictures.py FRAMES_DIR"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
FR = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..')
F, BIG, STILL = 300, 640, 420
frames = sorted(glob.glob(os.path.join(FR, 'turn-*.png')))
strip = Image.new('RGBA', (F * len(frames), F), (0, 0, 0, 0))
for i, f in enumerate(frames): strip.paste(Image.open(f).convert('RGBA').resize((F, F), Image.LANCZOS), (i * F, 0))
strip.save(os.path.join(ROOT, 'public', 'intro', 'turn.webp'), 'WEBP', quality=72, method=6, alpha_quality=72)
front = Image.open(os.path.join(FR, 'front.png')).convert('RGBA')
front.resize((STILL, STILL), Image.LANCZOS).save(os.path.join(ROOT, 'public', 'home', 'character-front.webp'), 'WEBP', quality=80, method=6, alpha_quality=80)
# the visor's hole: its own outline, drawn in a little so the rim stays, with a soft edge
mask = Image.open(os.path.join(FR, 'visor.png')).convert('L').point(lambda v: 255 if v > 60 else 0)
mask = mask.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(2)).resize((BIG, BIG), Image.LANCZOS)
shell = np.asarray(front.resize((BIG, BIG), Image.LANCZOS)).copy()
shell[..., 3] = (shell[..., 3].astype(np.float32) * (1 - np.asarray(mask, dtype=np.float32) / 255)).astype(np.uint8)
Image.fromarray(shell).save(os.path.join(ROOT, 'public', 'intro', 'shell.webp'), 'WEBP', quality=72, method=6, alpha_quality=75)
for n in ('public/intro/turn.webp', 'public/intro/shell.webp', 'public/home/character-front.webp'):
    print(n, os.path.getsize(os.path.join(ROOT, n)) // 1024, 'KB')
