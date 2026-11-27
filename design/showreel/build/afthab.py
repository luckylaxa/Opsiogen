"""Shot 14 (owner, 27 Nov: "Can you replace mockup 14 sec car mockups with some of our other work", then "Don't use
LinkedIn mockups and right mockup no white space on right side of the image. Put top designs only"): the Vaelo car
collage becomes Afthab Tours, our client whose work was not in the film yet, with its top designs only: the tall
"Your National Day escape" poster and the six travel posters of the National Day campaign (Azerbaijan, Thailand,
Almaty, Georgia and two National Day posts), each cut a few pixels inside its own edge from the case study's
gallery (public/work/afthab-tours/afthab-4-wide.jpg), so no gallery background shows; the film rounds the corners.
Usage: python3 afthab.py"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', '..', 'public', 'work', 'afthab-tours', 'afthab-4-wide.jpg')
INSET = 9   # inside each design's rounded corner
boxes = {'af-national-day': (120, 392, 594, 1056),                        # x, y, w, h, measured on the gallery image
         'af-azerbaijan': (932, 160, 448, 560), 'af-thailand': (1415, 160, 450, 560), 'af-almaty': (1900, 160, 448, 560),
         'af-georgia': (932, 809, 448, 560), 'af-nd-list': (1415, 809, 450, 560), 'af-nd-couple': (1900, 809, 447, 560)}
im = Image.open(SRC).convert('RGB')
for name, (x, y, w, h) in boxes.items():
    c = im.crop((x + INSET, y + INSET, x + w - INSET, y + h - INSET))
    c.save(os.path.join(HERE, 'a', name + '.jpg'), quality=93); print('a/' + name + '.jpg', c.size, round(c.width / c.height, 3))
