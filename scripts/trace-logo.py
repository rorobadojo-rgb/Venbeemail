"""Vectorize the VenbeeMail logo raster into layered SVG paths.

Usage: pip install pillow numpy scipy potracer && python3 scripts/trace-logo.py path/to/logo.jpg
Writes public/logo.svg and src/logo-data.js.
"""
import sys, os
from PIL import Image
import numpy as np, potrace
from scipy import ndimage as nd
im=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
x0,x1,y0,y1=206,990,348,1078
im=im[y0:y1,x0:x1]
r,g,b=im[...,0],im[...,1],im[...,2]
lum=im.mean(2)
dark=lum<90
lab,n=nd.label(dark)
border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(border))
sil=nd.binary_fill_holes(~bg)
sil=nd.binary_opening(sil,iterations=1)
red=(r>180)&(g<120)&(b<90)
grey=(abs(r-g)<30)&(r>90)&(r<200)&(b<170)&(b>70)&sil
grey=nd.binary_opening(grey,iterations=1)
black=dark&sil
def svgpath(mask,turd=6):
    bm=potrace.Bitmap(~mask)
    p=bm.trace(turdsize=turd,alphamax=1.0,opttolerance=0.3)
    out=[]
    for c in p:
        s=c.start_point; out.append(f"M{s.x:.1f} {s.y:.1f}")
        for seg in c:
            if seg.is_corner:
                out.append(f"L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
            else:
                out.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        out.append("Z")
    return "".join(out)
H,W=sil.shape
box=np.zeros_like(sil); box[120:300,600:790]=True
ga=grey&box
near=nd.binary_dilation(ga,iterations=9)
anger_black=black&near&box
black_main=black&~anger_black
layers=dict(
 anger_grey=svgpath(nd.binary_dilation(ga,iterations=2)&sil),
 anger_black=svgpath(anger_black,2),
 sil=svgpath(sil,20),
 red=svgpath(nd.binary_dilation(red,iterations=2)&sil),
 grey=svgpath(nd.binary_dilation(grey&~box,iterations=2)&sil),
 black=svgpath(black_main,4),
)
import json
root=os.path.join(os.path.dirname(__file__),'..')
js="// Auto-traced from the official VenbeeMail logo by scripts/trace-logo.py — do not edit by hand.\n"
js+=f"export const LOGO_W = {W};\nexport const LOGO_H = {H};\n"
for k in ['sil','red','grey','black','anger_grey','anger_black']:
    js+=f"export const {k.upper()} = '{layers[k]}';\n"
open(os.path.join(root,'src/logo-data.js'),'w').write(js)
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">
<path fill="#F5E6C8" d="{layers['sil']}"/>
<path fill="#FF3A1F" fill-rule="evenodd" d="{layers['red']}"/>
<path fill="#9A9082" fill-rule="evenodd" d="{layers['grey']}"/>
<path fill="#0A0A0A" fill-rule="evenodd" d="{layers['black']}"/>
<g id="anger"><path fill="#9A9082" fill-rule="evenodd" d="{layers['anger_grey']}"/><path fill="#0A0A0A" fill-rule="evenodd" d="{layers['anger_black']}"/></g>
</svg>'''
open(os.path.join(root,'public/logo.svg'),'w').write(svg)
print(W,H,{k:len(v) for k,v in layers.items()})
