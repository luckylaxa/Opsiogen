"""Builds index.html from page.html: puts the logo, the fallback picture and the 3D model inside the page,
so it is one file and opens anywhere (the phone app does not load files that sit beside a page)."""
import base64, pathlib
here = pathlib.Path(__file__).parent
def b64(p): return base64.b64encode(p.read_bytes()).decode()
page = (here / 'page.html').read_text()
page = page.replace('{{LOGO}}', 'data:image/png;base64,' + b64(here.parent / 'cards-proto/img/logo.png'))
page = page.replace('{{FRONT}}', 'data:image/webp;base64,' + b64(here.parent / 'character/front.webp'))
page = page.replace('{{GLB}}', b64(here.parent / 'character/model/character.glb'))
(here / 'index.html').write_text(page)
print('index.html', round(len(page) / 1e6, 2), 'MB')
