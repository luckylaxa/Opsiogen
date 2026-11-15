import sys, json, numpy as np
import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comp import coeffs, rounded, fit_art, place
from quad import find_quad
from PIL import Image, ImageDraw, ImageFilter
OUT=(1600,1200); TEXT=(0,0,960,450)
def expand(q,px):
    c=np.mean(q,0); return [tuple(c+(np.array(p)-c)*(1+px/np.linalg.norm(np.array(p)-c))) for p in q]
def build(scene, art, out, aspect=None, radius=0, anchor='top', xoff=None, padtop=0, flipit=False, restore=95, fill=None):
    im=Image.open(scene).convert('RGB'); q,_=find_quad(scene)
    if flipit:
        im=im.transpose(Image.FLIP_LEFT_RIGHT); W=im.width; tl,tr,br,bl=q; f=lambda p:(W-1-p[0],p[1]); q=[f(tr),f(tl),f(bl),f(br)]
    k=OUT[1]/im.height; im=im.resize((round(im.width*k),OUT[1]),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2,40,2))
    q=[(x*k,y*k) for x,y in q]
    a=Image.open(art).convert('RGBA'); a=fit_art(a,aspect,anchor) if aspect else a
    orig=np.array(im).astype(float)
    p=place(im,a,expand(q,2.5),radius=radius,glass=0.04,ss=2)
    pa=np.array(p).astype(float)
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).polygon([tuple(x) for x in expand(q,4)],fill=255); m=np.array(m)>0
    dark=orig.mean(2)<restore; sel=m&dark; pa[sel]=orig[sel]
    # gentle match: soften UI a hair and add photo grain
    p=Image.fromarray(np.clip(pa,0,255).astype('uint8'))
    pass  # no softening
    if padtop:
        import cv2
        a2=np.array(p); band=np.repeat(a2[:1],padtop,axis=0)
        full=np.concatenate([band,a2],0); mk=np.zeros(full.shape[:2],'uint8'); mk[:padtop+2]=255
        small=cv2.resize(full,(full.shape[1]//4,full.shape[0]//4)); smk=cv2.resize(mk,(mk.shape[1]//4,mk.shape[0]//4))
        inp=cv2.inpaint(small,smk,9,cv2.INPAINT_TELEA); inp=cv2.resize(inp,(full.shape[1],full.shape[0]),interpolation=cv2.INTER_CUBIC)
        inp=cv2.GaussianBlur(inp,(0,0),6); full[:padtop]=inp[:padtop]
        # feather seam
        for i in range(20): t=i/20; full[padtop+i]=(full[padtop+i]*t+inp[padtop+i]*(1-t)).astype('uint8')
        p=Image.fromarray(full); q=[(x,y+padtop) for x,y in q]
    W,H=p.size
    if fill:
        # fill=(top, right): the screen's top edge lands at `top` of the tile height and its right
        # edge at `right` of the width; the crop runs to the bottom of the scene. No blur, no padding.
        top,right=fill; sy=min(v[1] for v in q); sx=max(v[0] for v in q)
        h=int((H-sy)/(1-top)); h=min(h,H); w=int(h*4/3)
        if w>W: w=W; h=int(w*3/4)
        y0=H-h; x0=int(min(max(0,sx-right*w),W-w))
        p.crop((x0,y0,x0+w,y0+h)).resize(OUT,Image.LANCZOS).save(out,quality=90)
        print(out,'fill',x0,y0,w,h); return
    best=None
    for x0 in range(0,max(1,W-OUT[0])+1,10):
        for y0 in ([0] if H==OUT[1] else range(0,H-OUT[1]+1,10)):
            qo=[(x-x0,y-y0) for x,y in expand(q,70)]
            mm=Image.new('L',OUT,0); ImageDraw.Draw(mm).polygon([tuple(v) for v in qo],fill=255); arr=np.array(mm)>0
            ov=arr[TEXT[1]:TEXT[3],TEXT[0]:TEXT[2]].mean(); vis=arr.sum()
            score=ov*5-vis/1e6
            if best is None or score<best[0]: best=(score,x0,y0,ov,vis)
    _,x0,y0,ov,vis=best
    if xoff is not None: x0=xoff
    if padtop: y0=0
    p.crop((x0,y0,x0+OUT[0],y0+OUT[1])).save(out,quality=90)
    print(out,'x0',x0,'y0',y0,'overlap',round(ov,3))
