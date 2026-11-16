import sys; sys.path.insert(0,'/home/user/Opsiogen/design/tiles/py')
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from comp import coeffs
card=Image.open(sys.argv[1]).convert('RGB')
W,H=card.size; ss=2
poster=Image.open('design/tiles/out/figma-cs/sw-poster.png').convert('RGB'); pw,ph=poster.size
q=[(471.5,490),(1287,318),(1764,1395),(820.5,1615)]
w=poster.transform((W*ss,H*ss),Image.PERSPECTIVE,coeffs([(x*ss,y*ss) for x,y in q],[(0,0),(pw,0),(pw,ph),(0,ph)]),Image.BICUBIC).resize((W,H),Image.LANCZOS)
S=4
def poly_mask(pts):
    m=Image.new('L',(W*S,H*S),0); ImageDraw.Draw(m).polygon([(x*S,y*S) for x,y in pts],fill=255); return m.resize((W,H),Image.LANCZOS)
quad=poly_mask(q)
# phone outline traced along the real bezel
phone=[(1163,720),(1168,682),(1176,664),(1188,651),(1204,643),(1222,639),(1410,605),(1428,602.5),(1445,603),(1460,609),(1474,621),(1490,640),(1600,800),(1600,1200),(1350,1200),(1163,1200)]
pm=poly_mask(phone)
m=np.array(quad,float)/255*(1-np.array(pm,float)/255)
a=np.array(w,float)
xx=np.arange(W)[None,:]; light=0.86+0.14*np.clip((xx-470)/900,0,1)
a*=light[...,None]
# soft contact shadow from the phone onto the poster
sh=np.array(pm.filter(ImageFilter.GaussianBlur(9)),float)/255
a*=(1-0.45*sh)[...,None]
base=np.array(card,float)
out=base*(1-m[...,None])+a*m[...,None]
Image.fromarray(np.clip(out,0,255).astype('uint8')).save('design/tiles/out/figma-cs/card.jpg',quality=92)
