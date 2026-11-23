"""The four final views in one strip, on white, with labels."""
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(HERE, 'out')
TTF = os.path.join(O, 'outfit.ttf')
if not os.path.exists(TTF):
    from fontTools.ttLib import TTFont
    t = TTFont(os.path.join(HERE, '../../../../src/fonts/Outfit-Variable.woff2')); t.flavor = None; t.save(TTF)
f = ImageFont.truetype(TTF, 34); f.set_variation_by_axes([420])
S = 640; strip = Image.new('RGB', (S * 4, S + 60), (255, 255, 255)); d = ImageDraw.Draw(strip)
for i, (n, lab) in enumerate([('final-front', 'Front'), ('final-tq', '3/4'), ('final-side', 'Side'), ('final-back', 'Back')]):
    im = Image.open(os.path.join(O, n + '-white.jpg')).crop((105, 45, 795, 735)).resize((S, S), Image.LANCZOS); strip.paste(im, (i * S, 0))   # closer on the character
    d.text((i * S + S / 2, S + 10), lab, font=f, fill=(24, 22, 30), anchor='mm')
strip.save(os.path.join(HERE, 'character-v3-final-views.jpg'), quality=92); print('ok')
