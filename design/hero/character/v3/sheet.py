"""The character sheet in the same layout as Lucky's reference: four views on top, the pen pose and six emotions below."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math, sys
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(HERE, 'out')
TTF = os.path.join(O, 'outfit.ttf')
if not os.path.exists(TTF):                                       # the site's own font, unpacked for drawing
    from fontTools.ttLib import TTFont
    t = TTFont(os.path.join(HERE, '../../../../src/fonts/Outfit-Variable.woff2')); t.flavor = None; t.save(TTF)
def font(size, weight):
    f = ImageFont.truetype(TTF, size); f.set_variation_by_axes([weight]); return f
INK = (24, 22, 30); W, H = 2400, 1600
sheet = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(sheet)
F_L = font(40, 420)

def place(name, cx, cy, size):
    im = Image.open(os.path.join(O, name + '.png')).convert('RGBA').resize((size, size), Image.LANCZOS)
    sheet.alpha_composite(im, (round(cx - size / 2), round(cy - size / 2)))
def label(text, cx, y): d.text((cx, y), text, font=F_L, fill=INK, anchor='mm')

# four views
for i, (n, lab) in enumerate([('view-front', 'Front View'), ('view-tq', '3/4 View'), ('view-side', 'Side View'), ('view-back', 'Back View')]):
    cx = 356 + i * 562; place(n, cx, 250, 560); label(lab, cx, 520)
# the pen pose
place('hero', 590, 1080, 1060)
# emotions, three by two
EMO = [('happy', 'Happy'), ('thinking', 'Thinking'), ('idea', 'Idea'), ('cool', 'Cool'), ('wink', 'Winking'), ('surprised', 'Surprised')]
cols = [1330, 1720, 2110]; rows = [800, 1235]
for i, (n, lab) in enumerate(EMO):
    cx, cy = cols[i % 3], rows[i // 3]; place('emotion-' + n, cx, cy, 440); label(lab, cx, cy + 205)

# the little signs beside the emotions
def lines(cx, cy, colr, angles=(-105, -58, -12), r0=30, r1=72, w=11):
    for a in angles:
        a = math.radians(a); d.line((cx + r0 * math.cos(a), cy + r0 * math.sin(a), cx + r1 * math.cos(a), cy + r1 * math.sin(a)), fill=colr, width=w)
        for (x, y) in ((cx + r0 * math.cos(a), cy + r0 * math.sin(a)), (cx + r1 * math.cos(a), cy + r1 * math.sin(a))): d.ellipse((x - w / 2, y - w / 2, x + w / 2, y + w / 2), fill=colr)
def glyph(text, cx, cy, size, colr, rot=0):
    f = font(size, 800); lay = Image.new('RGBA', (size * 3, size * 2), (0, 0, 0, 0)); ImageDraw.Draw(lay).text((size * 1.5, size), text, font=f, fill=colr, anchor='mm')
    lay = lay.rotate(rot, resample=Image.BICUBIC); sheet.alpha_composite(lay, (round(cx - size * 1.5), round(cy - size)))
def bulb(cx, cy, r=34):
    lay = Image.new('RGBA', (r * 8, r * 8), (0, 0, 0, 0)); g = ImageDraw.Draw(lay); c = r * 4
    for k in range(5):                                           # rays
        a = math.radians(-160 + k * 35); g.line((c + (r + 14) * math.cos(a), c - 6 + (r + 14) * math.sin(a), c + (r + 40) * math.cos(a), c - 6 + (r + 40) * math.sin(a)), fill=(255, 196, 0, 255), width=9)
    g.ellipse((c - r, c - r - 6, c + r, c + r - 6), fill=(255, 205, 40, 255))
    g.polygon([(c - r * 0.62, c + r * 0.55), (c + r * 0.62, c + r * 0.55), (c + r * 0.42, c + r * 1.05), (c - r * 0.42, c + r * 1.05)], fill=(255, 205, 40, 255))
    g.ellipse((c - r * 0.55, c - r * 0.75, c - r * 0.05, c - r * 0.25), fill=(255, 245, 190, 255))
    g.arc((c - r * 0.38, c - r * 0.35, c + r * 0.38, c + r * 0.4), 200, 340, fill=(230, 140, 0, 255), width=5)
    for k in range(3): g.rounded_rectangle((c - r * 0.46, c + r * 1.08 + k * 11, c + r * 0.46, c + r * 1.08 + k * 11 + 8), radius=4, fill=(139, 92, 246, 255) if k != 1 else (110, 70, 210, 255))
    sheet.alpha_composite(lay, (round(cx - c), round(cy - c)))
glyph('?', cols[1] + 140, rows[0] - 190, 110, (140, 60, 245, 255), rot=-8)
bulb(cols[2] + 140, rows[0] - 190)
lines(cols[0] + 105, rows[1] - 125, (255, 45, 140, 255))
lines(cols[1] + 110, rows[1] - 120, (255, 150, 0, 255))
glyph('!!', cols[2] + 140, rows[1] - 170, 110, (255, 35, 110, 255), rot=-10)

out = os.path.join(HERE, 'character-v3-sheet.jpg'); sheet.convert('RGB').save(out, quality=92); print(out)
