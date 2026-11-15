"""Render flat tiles: each tile is an HTML body (devices and cards with our own screens) rendered
straight-on at 1600x1200 (desktop) and 1074x1380 (phone card). Nothing is warped or generated."""
import json, os, subprocess, sys, textwrap
D = os.path.dirname(os.path.abspath(__file__))
ART = os.path.abspath(D + '/../art')
def page(body, W, H, bg):
    return f'''<!doctype html><meta charset=utf-8><link rel=stylesheet href="{D}/frames.css">
<style>:root{{--W:{W}px;--H:{H}px;--bg:{bg}}}</style><body>{body}</body>'''
def art(n): return f'file://{ART}/{n}'
def render(jobs, outdir):
    """jobs: list of (name, W, H, bg, body_html)."""
    outdir = os.path.abspath(outdir); os.makedirs(outdir, exist_ok=True); tmp = []
    for name, W, H, bg, body in jobs:
        p = f'{outdir}/_{name}.html'; open(p, 'w').write(page(body, W, H, bg)); tmp.append((p, f'{outdir}/{name}', W, H))
    js = 'const {chromium}=require("playwright");(async()=>{const b=await chromium.launch();for(const [p,o,w,h] of ' + json.dumps(tmp) + '){const pg=await b.newPage({viewport:{width:w,height:h}});await pg.goto("file://"+p);await pg.waitForTimeout(400);await pg.screenshot({path:o,type:"jpeg",quality:92});await pg.close();}await b.close();})();'
    open(outdir + '/_r.cjs', 'w').write(js); subprocess.run(['node', outdir + '/_r.cjs'], check=True)
