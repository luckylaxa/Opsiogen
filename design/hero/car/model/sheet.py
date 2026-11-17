import sys, os
from PIL import Image
S='/tmp/claude-0/-home-user-Opsiogen/b0b3e356-e22d-529e-b60c-0b778d0659f0/scratchpad/'
ns=[n for n in sys.argv[1:] if os.path.exists(f'check-{n}.png')]
ims=[Image.open(f'check-{n}.png').convert('RGBA') for n in ns]
cols=2 if len(ims)>2 else 1; rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(1280*cols,720*rows),(255,255,255))
for i,im in enumerate(ims): s.paste(im,((i%cols)*1280,(i//cols)*720),im)
k=1920/s.width if cols==2 else 960/s.width
s.resize((int(s.width*k),int(s.height*k))).save(S+'car-check.jpg',quality=88); print(ns)
