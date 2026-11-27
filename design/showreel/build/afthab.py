"""Shot 14 (owner, 27 Nov: "Can you replace mockup 14 sec car mockups with some of our other work"): the Vaelo car
collage becomes Afthab Tours, our client whose work was not in the film yet. Four pieces cut from its case study's
gallery (public/work/afthab-tours), below each image's caption: the tilted wall of its posts, two National Day posters,
two of the offsite carousel's cards and the tall National Day poster. Written to build/a at the layout's proportions.
Usage: python3 afthab.py"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(HERE, '..', '..', '..', 'public', 'work', 'afthab-tours')
for out, src, box in (('af-wall.jpg', 'afthab-11-wide.jpg', (0, 160, 2400, 1360)),          # 2 : 1
                      ('af-national-day.jpg', 'afthab-4-wide.jpg', (895, 130, 1875, 742)),   # 1.6 : 1, two posters
                      ('af-offsite.jpg', 'afthab-7-wide.jpg', (800, 138, 1785, 754)),        # 1.6 : 1, two cards
                      ('af-poster.jpg', 'afthab-4-wide.jpg', (75, 370, 715, 1471))):         # 0.581, the tall poster
    im = Image.open(os.path.join(W, src)).convert('RGB').crop(box)
    im.save(os.path.join(HERE, 'a', out), quality=92); print('a/' + out, im.size, round(im.width / im.height, 3))
