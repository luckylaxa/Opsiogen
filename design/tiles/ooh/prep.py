"""Logos and photo for the three out-of-home artworks (art/), from the clients' own logo files (design/logos/src)."""
import json, os
import numpy as np, cv2
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(H, '../../..'))
ART = os.path.join(H, 'art'); os.makedirs(ART, exist_ok=True)
logo = lambda f: os.path.join(ROOT, 'design/logos/src', f)

def unwhite(rgb):
    """Colour-to-alpha against white: the ink's own colour and how much of it covers each pixel."""
    a = (255 - rgb.min(2)) / 255.0
    f = np.where(a[..., None] > 0, (rgb - (1 - a[..., None]) * 255) / np.maximum(a[..., None], 1e-6), 0)
    return np.clip(f, 0, 255), a

# Rohde & Schwarz: the grey lockup in white, for the dark billboard
r = np.asarray(Image.open(logo('rohde-schwarz.png')).convert('RGBA')).copy(); r[..., :3] = 255
Image.fromarray(r).save(os.path.join(ART, 'rs-logo-white.png'))

# Norsecom: the azure logo on a clear background, and the N mark alone for a large pale watermark
n = np.asarray(Image.open(logo('norsecom.png')).convert('RGB')).astype(float)
f, a = unwhite(n)
Image.fromarray(np.dstack([f, a * 255]).astype(np.uint8)).save(os.path.join(ART, 'nc-logo.png'))
mark = np.dstack([np.full(a.shape, 0.0), np.full(a.shape, 128.0), np.full(a.shape, 255.0), a * 255])[25:240, 28:272]
Image.fromarray(mark.astype(np.uint8)).save(os.path.join(ART, 'nc-mark.png'))

# SandLogic, for a dark panel (as on its brand board): the black swoosh and the wordmark in white, the dots in colour
s = np.asarray(Image.open(logo('sandlogic.jpg')).convert('RGB')).astype(float)[360:885, 220:2350]
f, a = unwhite(s)
dark = f.max(2) < 90                                      # the swoosh's near-black ink
word = np.zeros(a.shape, bool); word[:, 744 - 220 + 30:] = True
f[dark | word] = 255
sat = ~(dark | word)                                      # the dots: full colour, brighter on black
f[sat] = np.clip(f[sat] * 1.15 + 20, 0, 255); a2 = np.where(sat, np.clip(a * 1.25, 0, 1), a)
Image.fromarray(np.dstack([f, a2 * 255]).astype(np.uint8)).save(os.path.join(ART, 'sl-logo-dark.png'))

# The night Earth (NASA, from the ISS): the city lights' brightest clusters, for the "links" lines
e = Image.open(os.path.join(H, 'photos/earth-night-nasa-Q1p7bh3SHj8.jpg')).convert('RGB')
g = cv2.GaussianBlur(np.asarray(e.convert('L')).astype(np.float32), (0, 0), 14)
pts = []
for _ in range(40):
    y, x = np.unravel_index(np.argmax(g), g.shape)
    if g[y, x] < 30: break
    pts.append([int(x), int(y), float(g[y, x])]); cv2.circle(g, (int(x), int(y)), 170, 0, -1)
open(os.path.join(ART, 'earth-lights.js'), 'w').write('window.LIGHTS = ' + json.dumps({'size': e.size, 'lights': pts}) + ';\n')   # a script, as file:// pages can't fetch
print('lights', pts[:12])
