import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
def coeffs(dst, src):
    A=[]; B=[]
    for (x,y),(u,v) in zip(dst,src):
        A.append([x,y,1,0,0,0,-u*x,-u*y]); B.append(u)
        A.append([0,0,0,x,y,1,-v*x,-v*y]); B.append(v)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()
def rounded(art, r):
    if not r: return art.convert('RGBA')
    a=art.convert('RGBA'); m=Image.new('L',a.size,0); ImageDraw.Draw(m).rounded_rectangle([0,0,a.width-1,a.height-1],radius=r,fill=255)
    a.putalpha(m); return a
def place(photo, art, quad, radius=0, glass=0.06, ss=2):
    W,H=photo.size; art=rounded(art,radius); aw,ah=art.size
    q=[(x*ss,y*ss) for x,y in quad]
    w=art.transform((W*ss,H*ss),Image.PERSPECTIVE,coeffs(q,[(0,0),(aw,0),(aw,ah),(0,ah)]),Image.BICUBIC)
    w=w.resize((W,H),Image.LANCZOS)
    # soft glass sheen: a gentle diagonal highlight, only on the screen
    if glass:
        g=Image.linear_gradient('L').rotate(35,expand=False).resize((W,H))
        sheen=Image.new('RGBA',(W,H),(255,255,255,0)); sheen.putalpha(g.point(lambda v:int(v*glass)))
        alpha=w.split()[3]; sheen.putalpha(Image.fromarray((np.array(sheen.split()[3]).astype(float)*np.array(alpha)/255).astype('uint8')))
        w=Image.alpha_composite(w,sheen)
    out=photo.convert('RGBA'); out=Image.alpha_composite(out,w); return out.convert('RGB')
def flip(photo, quad):
    W=photo.width; p=photo.transpose(Image.FLIP_LEFT_RIGHT)
    tl,tr,br,bl=quad; f=lambda pt:(W-1-pt[0],pt[1])
    return p,[f(tr),f(tl),f(bl),f(br)]
def grade(img, mult=1.0, vignette=0.0, tl_shade=0.0):
    a=np.array(img).astype(float)*mult
    H,W=a.shape[:2]; yy,xx=np.mgrid[0:H,0:W]
    if vignette:
        d=np.sqrt(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2); a*= (1-vignette*np.clip(d-0.4,0,1)[...,None])
    if tl_shade:
        t=np.clip(1-np.sqrt((xx/(W*0.75))**2+(yy/(H*0.55))**2),0,1); a*=(1-tl_shade*t[...,None])
    return Image.fromarray(np.clip(a,0,255).astype('uint8'))
def crop_to(img, box, size):
    return img.crop(box).resize(size,Image.LANCZOS)

def fit_art(art, aspect, anchor='top'):
    a=art.convert('RGBA'); w,h=a.size
    if anchor=='pad':
        col=a.getpixel((2,h//2)); 
        if w/h>aspect: nw,nh=w,int(w/aspect)
        else: nw,nh=int(h*aspect),h
        c=Image.new('RGBA',(nw,nh),col); c.paste(a,((nw-w)//2,(nh-h)//2)); return c
    if w/h>aspect:  # too wide: crop sides
        nw=int(h*aspect); x=(w-nw)//2; return a.crop((x,0,x+nw,h))
    nh=int(w/aspect); y=0 if anchor=='top' else (h-nh)//2; return a.crop((0,y,w,y+nh))
def notch(art, kind):
    if not kind: return art
    a=art.copy(); d=ImageDraw.Draw(a); w,h=a.size
    if kind=='island': d.rounded_rectangle([w*0.35,h*0.012,w*0.65,h*0.045],radius=h*0.02,fill=(0,0,0,255))
    else: d.rounded_rectangle([w*0.26,-h*0.02,w*0.74,h*0.035],radius=h*0.02,fill=(0,0,0,255))
    return a
def recolor_bg(photo, quad, top, bottom, exclude_screen=True):
    a=np.array(photo).astype(float); H,W=a.shape[:2]
    lum=a.mean(axis=2)
    alpha=np.clip((lum-45)/140,0,1)
    if exclude_screen:
        m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon([tuple(p) for p in quad],fill=255)
        m=np.array(m.filter(ImageFilter.MaxFilter(9)))>0; alpha[m]=0
    t=np.linspace(0,1,H)[:,None,None]; top=np.array(top,float); bottom=np.array(bottom,float)
    bg=top*(1-t)+bottom*t; bg=np.broadcast_to(bg,(H,W,3))
    shade=(lum/ max(1,np.percentile(lum[alpha>0.9],60) if (alpha>0.9).any() else 1))[...,None]
    bg=bg*np.clip(0.85+0.15*shade,0.7,1.15)
    out=a*(1-alpha[...,None])+bg*alpha[...,None]
    return Image.fromarray(np.clip(out,0,255).astype('uint8'))
def fit_box(size, quad, out=(1600,1200), pos=(0.66,0.62), dev=0.72):
    W,H=size; xs=[p[0] for p in quad]; ys=[p[1] for p in quad]
    bw,bh=max(xs)-min(xs),max(ys)-min(ys); cx,cy=(max(xs)+min(xs))/2,(max(ys)+min(ys))/2
    ar=out[0]/out[1]
    ch=max(bh/dev, bw/dev/ar); cw=ch*ar
    if cw>W: cw=W; ch=cw/ar
    if ch>H: ch=H; cw=ch*ar
    x0=cx-pos[0]*cw; y0=cy-pos[1]*ch
    x0=min(max(0,x0),W-cw); y0=min(max(0,y0),H-ch)
    return (int(x0),int(y0),int(x0+cw),int(y0+ch))
def hexc(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))
