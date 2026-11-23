"""The concept sheet for character version 2, from the renders in ./out (run build.py views emotions mouse hero first)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(HERE, 'out'); BG = (244, 243, 246); INK = (10, 9, 13); MUTE = (98, 96, 106); CARD = (255, 255, 255)
TTF = os.path.join(O, 'outfit.ttf')
if not os.path.exists(TTF):                                       # the site's own font, unpacked for drawing
    from fontTools.ttLib import TTFont
    t = TTFont(os.path.join(HERE, '../../../../src/fonts/Outfit-Variable.woff2')); t.flavor = None; t.save(TTF)
def font(size, weight):
    f = ImageFont.truetype(TTF, size); f.set_variation_by_axes([weight]); return f
F_H, F_S, F_L, F_SEC = font(84, 650), font(34, 400), font(30, 500), font(44, 600)
W = 2400; PAD = 80; GAP = 28
sheet = Image.new("RGB", (W, 3090), BG); d = ImageDraw.Draw(sheet)

def card(box, img=None, label=None, fit=1.0, dy=0):
    x0, y0, x1, y1 = box; d.rounded_rectangle(box, radius=30, fill=CARD)
    if img is not None:
        im = Image.open(os.path.join(O, img)).convert('RGBA'); s = min(x1 - x0, y1 - y0 - (60 if label else 0)) * fit
        im = im.resize((round(s), round(s)), Image.LANCZOS); px = x0 + (x1 - x0 - im.width) // 2; py = y0 + (y1 - y0 - (60 if label else 0) - im.height) // 2 + dy
        sheet.paste(im, (px, py), im)
    if label: d.text(((x0 + x1) / 2, y1 - 44), label, font=F_L, fill=INK, anchor='mm')

def cursor(x, y, s=1.6, click=False):
    pts = [(0, 0), (0, 34), (9, 26), (16, 41), (22, 38), (15, 24), (27, 24)]
    pts = [(x + px * s, y + py * s) for px, py in pts]
    if click:
        for r, a in ((34, 70), (22, 120)): d.ellipse((x - r, y - r, x + r, y + r), outline=(1, 165, 226), width=4)
    d.polygon(pts, fill=INK, outline=(255, 255, 255), width=3)

d.text((PAD, 96), 'Our character, version 2', font=F_H, fill=INK)
d.text((PAD, 200), 'The same glossy white body. A friendly face instead of the camera lens, headphone ears, a top light,', font=F_S, fill=MUTE)
d.text((PAD, 246), 'hands that float, and the ring from our logo around it. Built in Blender from our current model.', font=F_S, fill=MUTE)

# hero and turnaround
y = 340; big = 1180; card((PAD, y, PAD + big, y + big), 'hero.png', 'Light from the hand', fit=1.06, dy=10)
cw = (W - PAD * 2 - big - GAP - GAP) // 2
for i, (n, lab) in enumerate([('front', 'Front'), ('threequarter', 'Three-quarter'), ('side', 'Side'), ('back', 'Back')]):
    cx = PAD + big + GAP + (i % 2) * (cw + GAP); cy = y + (i // 2) * ((big - GAP) // 2 + GAP)
    card((cx, cy, cx + cw, cy + (big - GAP) // 2), 'view-' + n + '.png', lab, fit=1.12, dy=8)

# emotions
y += big + 90; d.text((PAD, y), 'Emotions', font=F_SEC, fill=INK); y += 80
ew = (W - PAD * 2 - GAP * 5) // 6
for i, (n, lab) in enumerate([('happy', 'Happy'), ('thinking', 'Thinking'), ('idea', 'Idea'), ('cool', 'Cool'), ('wink', 'Wink'), ('surprised', 'Surprised')]):
    cx = PAD + i * (ew + GAP); card((cx, y, cx + ew, y + ew + 60), 'emotion-' + n + '.png', lab, fit=1.0, dy=4)

# with the mouse
y += ew + 60 + 90; d.text((PAD, y), 'With the mouse', font=F_SEC, fill=INK); y += 80
mw = (W - PAD * 2 - GAP * 2) // 3; mh = 640
labels = ['It turns and looks at your pointer', 'On hover: it smiles and bounces', 'On click: it draws light from its hand']
for i, (img, lab) in enumerate(zip(['mouse-look.png', 'mouse-hover.png', 'hero.png'], labels)):
    cx = PAD + i * (mw + GAP); card((cx, y, cx + mw, y + mh), img, lab, fit=1.0 if i < 2 else 0.98, dy=0)
cursor(PAD + 90, y + 250)
cursor(PAD + mw + GAP + mw // 2 + 40, y + 300)
hx = PAD + 2 * (mw + GAP); cursor(hx + 92, y + 222, click=True)
sheet.save(os.path.join(HERE, 'character-v2-sheet.jpg'), quality=90); print(sheet.size)
