from PIL import Image, ImageFilter, ImageDraw
import numpy as np, cv2
K=2
sc=Image.open('raw.png').convert('RGB').resize((1536*K,864*K),Image.LANCZOS)
S=np.asarray(sc).astype(np.float32)/255
B=Image.open('brand.png').convert('RGB')
def crop(x0,y0,x1,y1): return B.crop((int(x0*4.8),int(y0*4.8),int(x1*4.8),int(y1*4.8)))
paper=np.array([0xF2,0xF1,0xED],np.float32)/255
def norm(im):
    a=np.asarray(im).astype(np.float32)/255; return np.clip(a/paper,0,1)
def mult_rect(art,x,y,w,strength=0.93):
    h=int(round(w*art.height/art.width)); a=norm(art.resize((int(w*K),int(h*K)),Image.LANCZOS))
    X,Y=int(x*K),int(y*K); reg=S[Y:Y+a.shape[0],X:X+a.shape[1]]; reg[:]=reg*(1-strength+strength*a)
def mult_quad(art,quad,strength=0.95):
    a=norm(art); h,w=a.shape[:2]
    M=cv2.getPerspectiveTransform(np.float32([[0,0],[w,0],[w,h],[0,h]]),np.float32(quad)*K)
    wa=cv2.warpPerspective(a,M,(S.shape[1],S.shape[0]),flags=cv2.INTER_AREA,borderValue=(1,1,1)); S[:]=S*(1-strength+strength*wa)
logo=crop(55,128,395,232); quiet=crop(805,533,1135,592)
mult_rect(logo,1045,238,290); mult_rect(quiet,1112,352,156,0.8)
mult_rect(logo,176,585,196,0.9)
# welcome poster on the easel: logo, the stacked headline from our banner, and the mark on green
ban=Image.open('/home/user/Opsiogen/design/hero/car/scenes/banner-art.png').convert('RGBA')
bg=Image.new('RGBA',ban.size,(0xF2,0xF1,0xED,255)); ban=Image.alpha_composite(bg,ban).convert('RGB')
head=ban.crop((40,120,430,475))
bd=Image.new('RGB',(620,1180),(0xF2,0xF1,0xED)); d=ImageDraw.Draw(bd)
def put(im,x,y,w):
    im=im.resize((w,int(w*im.height/im.width)),Image.LANCZOS); bd.paste(im,(x,y)); return y+im.height
y=put(logo,70,90,330); y=put(head,60,y+100,470)
d.rectangle((0,850,620,1180),fill=(0x0E,0x4D,0x34))
t=crop(553,570,647,647).resize((150,int(150*77/94)),Image.LANCZOS); bd.paste(t,(235,955))
mult_quad(bd,[[1382,346],[1494,343],[1469,569],[1353,559]])
t=np.asarray(crop(553,570,647,647)).astype(np.float32)/255; lum=t.mean(2); g=lum.min(); al=np.clip((lum-g)/(lum.max()-g),0,1)
def vmark(cx,cy,w,rot=0,op=0.92):
    h=int(w*al.shape[0]/al.shape[1]); m=cv2.resize(al,(int(w*K),int(h*K)),interpolation=cv2.INTER_AREA)
    if rot:
        R=cv2.getRotationMatrix2D((m.shape[1]/2,m.shape[0]/2),rot,1); m=cv2.warpAffine(m,R,(m.shape[1],m.shape[0]))
    X,Y=int(cx*K-m.shape[1]/2),int(cy*K-m.shape[0]/2); reg=S[Y:Y+m.shape[0],X:X+m.shape[1]]
    col=np.array([0.93,0.91,0.84],np.float32); reg[:]=reg*(1-m[...,None]*op)+col*m[...,None]*op*0.9
vmark(822,170,40,-4); vmark(927,172,40,-4); vmark(1272,480,20,0,0.85)
out=Image.fromarray((np.clip(S,0,1)*255).astype(np.uint8)); out.save('scene.png')
out.crop((2560,560,3072,1260)).save('easel.jpg',quality=90)
R='/home/user/Opsiogen/'
out.save(R+'design/hero/car/scenes/01-brand-launch-pavilion.jpg',quality=92)
out.resize((2560,1440),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1,40,2)).save(R+'public/home/hero-quay.jpg',quality=80,progressive=True,optimize=True)
out.crop((1500,0,2700,1728)).resize((1000,1440),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1,40,2)).save(R+'public/home/hero-quay-phone.jpg',quality=78,progressive=True,optimize=True)
