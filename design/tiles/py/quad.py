import cv2, numpy as np, sys
from PIL import Image
def find_quad(path, thr=225):
    im=np.array(Image.open(path).convert('RGB')); g=im.min(axis=2)
    m=(g>thr).astype('uint8')*255
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); mm=(lab==i).astype('uint8')*255
    cs,_=cv2.findContours(mm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea)
    hull=cv2.convexHull(c)
    for eps in np.linspace(0.005,0.08,60):
        ap=cv2.approxPolyDP(hull,eps*cv2.arcLength(hull,True),True)
        if len(ap)==4: break
    pts=ap.reshape(-1,2).astype(float)
    # order TL,TR,BR,BL by angle around centre, TL = closest to top-left of the screen's own orientation
    c0=pts.mean(0); ang=np.arctan2(pts[:,1]-c0[1],pts[:,0]-c0[0]); pts=pts[np.argsort(ang)]  # starts at ~ -pi (left)
    s=pts.sum(1); k=np.argmin(s); pts=np.roll(pts,-k,axis=0)
    return pts.tolist(), len(ap)
if __name__=='__main__':
    for p in sys.argv[1:]: print(p, find_quad(p))

def find_quads(path, n=2, thr=225):
    im=np.array(Image.open(path).convert('RGB')); g=im.min(axis=2)
    m=(g>thr).astype('uint8')*255; m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    k,lab,st,_=cv2.connectedComponentsWithStats(m); order=1+np.argsort(-st[1:,cv2.CC_STAT_AREA])
    out=[]
    for i in order[:n]:
        mm=(lab==i).astype('uint8')*255; cs,_=cv2.findContours(mm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); hull=cv2.convexHull(max(cs,key=cv2.contourArea))
        for eps in np.linspace(0.005,0.08,60):
            ap=cv2.approxPolyDP(hull,eps*cv2.arcLength(hull,True),True)
            if len(ap)==4: break
        pts=ap.reshape(-1,2).astype(float); c0=pts.mean(0); pts=pts[np.argsort(np.arctan2(pts[:,1]-c0[1],pts[:,0]-c0[0]))]; pts=np.roll(pts,-np.argmin(pts.sum(1)),axis=0)
        out.append(pts.tolist())
    return out
