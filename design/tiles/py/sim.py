# simulate desktop (4:3, hotspot .74,.8) and mobile (10:9) tiles with text
import sys
from PIL import Image, ImageDraw, ImageFont
F=lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',s)
def view(path,title,desc,aspect,W):
    im=Image.open(path); w,h=im.size
    if aspect<w/h: cw=int(h*aspect); x0=int((w-cw)*0.74); im=im.crop((x0,0,x0+cw,h))
    else: ch=int(w/aspect); y0=int((h-ch)*0.8); im=im.crop((0,y0,w,y0+ch))
    H=int(W/aspect); im=im.resize((W,H)); d=ImageDraw.Draw(im)
    if W<500: d.multiline_text((30,30),title,fill='white',font=F(32),spacing=2); d.multiline_text((30,34+(80 if '\n' in title else 42)),desc,fill='white',font=F(21),spacing=5)
    else: d.multiline_text((30,30),title,fill='white',font=F(30)); d.multiline_text((30,32+(78 if '\n' in title else 42)),desc,fill='white',font=F(18),spacing=4)
    return im
def sheet(items,out):
    cells=[]
    for p,t,dsc,dm in items: cells.append((view(p,t,dsc,4/3,640),view(p,t,dm,10/9,400)))
    S=Image.new('RGB',(1060,len(cells)*490),'white')
    for i,(a,b) in enumerate(cells): S.paste(a,(0,i*490)); S.paste(b,(650,i*490))
    S.save(out,quality=85)
