"""The site's intro pictures and the Home character's still, from intro.cjs's frames:
public/intro/flip.webp     the crouch, the jump and the backflip, 11 pictures side by side, drawn on black with no
                           transparency (a third of the size; the intro's backdrop is pure black to match);
public/intro/shell.webp    the character facing the visitor after the flip, its visor cut out, so the page shows
                           through it as it flies at the screen;
public/intro/face.webp     that visor alone, which sits under the shell until the visor clears;
public/home/character-front.webp   the still the Home character shows until its 3D is drawn.
It prints where the visor is in the picture, for VX..FACE in design/showreel/build/intro_css.py.
Usage: python3 intro_pictures.py FRAMES_DIR"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
FR = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..')
F, BIG, STILL = 330, 640, 420
frames = sorted(glob.glob(os.path.join(FR, 'flip-*.png')))
strip = Image.new('RGB', (F * len(frames), F), (0, 0, 0))
for i, f in enumerate(frames):
    im = Image.open(f).convert('RGBA').resize((F, F), Image.LANCZOS)
    strip.paste(im, (i * F, 0), im)
strip.save(os.path.join(ROOT, 'public', 'intro', 'flip.webp'), 'WEBP', quality=78, method=6)
front = Image.open(os.path.join(FR, 'front.png')).convert('RGBA').resize((BIG, BIG), Image.LANCZOS)
visor = np.asarray(Image.open(os.path.join(FR, 'visor.png')).convert('L').resize((BIG, BIG), Image.LANCZOS)) > 60
ys, xs = np.nonzero(visor)
x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
print('visor: centre %.4f %.4f, radii %.4f %.4f' % ((x0 + x1) / 2 / BIG, (y0 + y1) / 2 / BIG, (x1 - x0) / 2 / BIG, (y1 - y0) / 2 / BIG))
# the shell: the visor cut out, drawn in a little so its rim stays, with a soft edge
mask = Image.fromarray((visor * 255).astype(np.uint8))
hole = np.asarray(mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255
shell = np.asarray(front).copy()
shell[..., 3] = (shell[..., 3].astype(np.float32) * (1 - hole)).astype(np.uint8)
Image.fromarray(shell).save(os.path.join(ROOT, 'public', 'intro', 'shell.webp'), 'WEBP', quality=72, method=6, alpha_quality=75)
# the face: the visor of the same picture, a little wider than the hole (it sits under the shell)
grow = mask.filter(ImageFilter.MaxFilter(5))
box = grow.getbbox()
face = np.asarray(front).copy()
face[..., 3] = np.minimum(face[..., 3], np.asarray(grow))
Image.fromarray(face).crop(box).save(os.path.join(ROOT, 'public', 'intro', 'face.webp'), 'WEBP', quality=80, method=6, alpha_quality=80)
print('face: left %.4f top %.4f width %.4f height %.4f' % (box[0] / BIG, box[1] / BIG, (box[2] - box[0]) / BIG, (box[3] - box[1]) / BIG))
still = Image.open(os.path.join(FR, 'still.png')).convert('RGBA')
still.resize((STILL, STILL), Image.LANCZOS).save(os.path.join(ROOT, 'public', 'home', 'character-front.webp'), 'WEBP', quality=80, method=6, alpha_quality=80)
for n in ('public/intro/flip.webp', 'public/intro/shell.webp', 'public/intro/face.webp', 'public/home/character-front.webp'):
    print(n, os.path.getsize(os.path.join(ROOT, n)) // 1024, 'KB')
