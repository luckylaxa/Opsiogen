# Phone version of the Websites service card (1074 x 1380): the same browser and phone, recomposed taller.
from PIL import Image, ImageDraw
import numpy as np
src=Image.open('/home/user/Opsiogen/public/services/ai-websites/card.jpg').convert('RGB')
W,H=1074,1380
# gradient background from the card's own colours (dark lower left, light upper right)
TL,TR,BL,BR=np.array([175,127,55]),np.array([221,177,104]),np.array([150,101,33]),np.array([205,160,90])
u=np.linspace(0,1,W)[None,:,None]; v=np.linspace(0,1,H)[:,None,None]
bg=(TL*(1-u)*(1-v)+TR*u*(1-v)+BL*(1-u)*v+BR*u*v).astype(np.uint8)
out=Image.fromarray(bg)
s=1.04
B=src.crop((480,430,1600,1189)); P=src.crop((230,520,542,1186))
def mask(size,r,top_only=False):
    m=Image.new('L',(size[0]*4,size[1]*4),0); d=ImageDraw.Draw(m)
    d.rounded_rectangle([0,0,size[0]*4-1,size[1]*4-1+(r*8 if top_only else 0)],radius=r*4,fill=255)
    return m.resize(size,Image.LANCZOS)
Bs=B.resize((round(B.width*s),round(B.height*s)),Image.LANCZOS)
Ps=P.resize((round(P.width*s),round(P.height*s)),Image.LANCZOS)
top=1385-Bs.height
px=24; bx=px+round(60*s)
out.paste(Bs,(bx,top),mask(Bs.size,round(10*s),top_only=True))
out.paste(Ps,(px,top+round(90*s)),mask(Ps.size,round(56*s)))
out.save('/home/user/Opsiogen/public/services/ai-websites/card-phone.jpg',quality=88,optimize=True,progressive=True)
print(top/H, out.size)
