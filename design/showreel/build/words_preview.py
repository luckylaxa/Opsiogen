"""Preview of cut 22's big words (the 'Word:' shots in frames.html), for approval before the whole film is rendered:
each word with the shot before it and the first second of the shot after it (its hand-over), with the film's own track
at that point, one after another with a short black gap.
Usage: python3 words_preview.py STILLS_DIR OUT.mp4   (STILLS_DIR: SHARE=1 node frames.cjs STILLS_DIR)"""
import sys, os, json, subprocess
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
B = os.path.dirname(os.path.abspath(__file__)); WD = os.path.join(FR, 'words'); os.makedirs(WD, exist_ok=True)
FPS, BPM = 30, 140; BEAT = 60 / BPM; AFTER = 30
run = lambda c: subprocess.run(c, check=True)
shots = [s['name'] for s in json.load(open(os.path.join(FR, 'shots.json')))]
MULTI = ("Grid of", "collage", "tiles", "wall across", "row of", "Torvi: site", "billboard, badge", "guideline pages", "Three apps")
def beats(n):   # as in film.py
    if n == "Opening line": return 3
    if n == "Brands already did": return 8
    if n.startswith("We take it"): return 2
    if n == "Chapter word": return 2
    if n.startswith("Fast word"): return 1
    if n.startswith("One partner"): return 4
    if n in ("Word: Adoption.", "Word: Growth."): return 3
    if n.startswith("Word:"): return 2
    if n.startswith("Logo"): return 9
    if n.startswith("Wall of"): return 3
    if n == "Website: Engel & Völkers, Mykonos": return 2
    if n == "Websites: wall across projects": return 1
    if "488563452" in n: return 3
    if n.startswith(("Stock", "Life")): return 2
    if any(m in n for m in MULTI): return 2
    return 1
Bt = [beats(n) for n in shots]; logo = len(shots) - 1
while sum(Bt[:logo]) % 4 != 3: Bt[logo - 1] += 1
start = [sum(Bt[:i]) for i in range(len(Bt) + 1)]
fr = lambda b: round(b * BEAT * FPS)
N = [fr(start[i + 1]) - fr(start[i]) for i in range(len(shots))]
# The film's track for the new cut, so each word plays on its own beat.
cuts = os.path.join(WD, 'cuts.json'); music = os.path.join(WD, 'music.wav')
json.dump({"dur": fr(start[-1]) / FPS, "cuts": [fr(b) / FPS for b in start[:-1]], "hit": fr(start[logo] + 4) / FPS}, open(cuts, 'w'))
run(['python3', os.path.join(B, 'track.py'), cuts, 'percussion', music])
still = lambda i: os.path.join(FR, f'{i + 1:02d}.jpg')
last = lambda i, n: os.path.join(WD, 'frames', f'{i:03d}', f'{n - 1:03d}.jpg')
words = [i for i, n in enumerate(shots) if n.startswith('Word:')]
jobs = []
for w in words:
    jobs += [[w - 1, N[w - 1], still(w - 2)], [w, N[w], last(w - 1, N[w - 1])], [w + 1, AFTER, last(w, N[w])]]
json.dump({'frames': FR, 'out': os.path.join(WD, 'frames'), 'fps': FPS, 'jobs': jobs}, open(os.path.join(WD, 'jobs.json'), 'w'))
run(['node', os.path.join(B, 'render-anim.cjs'), os.path.join(WD, 'jobs.json')])
ENC = ['-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
parts = []
for w in words:
    seg = []
    for i, n in [(w - 1, N[w - 1]), (w, N[w]), (w + 1, AFTER)]:
        c = os.path.join(WD, f'{w:03d}-{i:03d}.mp4'); seg.append(c)
        run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(WD, 'frames', f'{i:03d}', '%03d.jpg'), '-frames:v', str(n), '-an'] + ENC + [c])
    t0, dur = fr(start[w - 1]) / FPS, (N[w - 1] + N[w] + AFTER) / FPS
    part = os.path.join(WD, f'part-{w:03d}.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-i', seg[0], '-i', seg[1], '-i', seg[2], '-ss', f'{t0:.4f}', '-t', f'{dur:.4f}', '-i', music,
         '-filter_complex', f'[0:v][1:v][2:v]concat=n=3:v=1[v];[3:a]afade=t=in:d=0.06,afade=t=out:st={dur - .15:.4f}:d=0.15[m]',
         '-map', '[v]', '-map', '[m]'] + ENC + ['-c:a', 'aac', '-b:a', '160k', '-ar', '48000', part])
    parts.append(part)
gap = os.path.join(WD, 'gap.mp4')
run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', f'color=c=black:s=1920x1080:r={FPS}:d=0.5', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
     '-t', '0.5'] + ENC + ['-c:a', 'aac', '-b:a', '160k', gap])
seq = [p for q in parts for p in (q, gap)][:-1]
open(os.path.join(WD, 'list.txt'), 'w').write(''.join(f"file '{p}'\n" for p in seq))
run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(WD, 'list.txt')] + ENC + ['-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', OUT])
print('preview of', len(parts), 'words:', ', '.join(shots[w][6:] for w in words))
