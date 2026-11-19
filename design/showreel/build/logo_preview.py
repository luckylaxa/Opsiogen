"""Preview of the film's close for approval: the spine ("Your idea. Branded. ..."), "One partner. Every digital need."
and the logo shot rendered fresh from frames.html, with the film's own track from the same point, so the last hit lands
where it does in the film. The two shots before the logo come from the last film render (FRAMES_DIR/film).
Usage: python3 logo_preview.py FRAMES_DIR OUT.mp4"""
import sys, os, json, subprocess
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
B = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(FR, 'film'); WD = os.path.join(FR, 'logoprev')
FPS = 30
run = lambda c, **k: subprocess.run(c, check=True, **k)
os.makedirs(WD, exist_ok=True)
cuts = json.load(open(os.path.join(SRC, 'cuts.json')))
logo = len(cuts['cuts']) - 1                                   # the logo shot is the last one
t0, tl, dur = cuts['cuts'][logo - 2], cuts['cuts'][logo], cuts['dur']
N = round((dur - tl) * FPS)
prev = os.path.join(SRC, 'frames', f'{logo - 1:03d}'); under = os.path.join(prev, sorted(os.listdir(prev))[-1])
json.dump({'frames': FR, 'out': os.path.join(WD, 'frames'), 'fps': FPS, 'jobs': [[logo, N, under]]}, open(os.path.join(WD, 'jobs.json'), 'w'))
run(['node', os.path.join(B, 'render-anim.cjs'), os.path.join(WD, 'jobs.json')])
ENC = lambda n, o: ['-frames:v', str(n), '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), o]
new = os.path.join(WD, f'{logo:03d}.mp4')
run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(WD, 'frames', f'{logo:03d}', '%03d.jpg')] + ENC(N, new))
files = [os.path.join(SRC, f'{logo - 2:03d}.mp4'), os.path.join(SRC, f'{logo - 1:03d}.mp4'), new]
open(os.path.join(WD, 'list.txt'), 'w').write(''.join(f"file '{f}'\n" for f in files))
d = dur - t0
run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(WD, 'list.txt'), '-ss', f'{t0:.4f}', '-i', os.path.join(SRC, 'music.wav'),
     '-map', '0:v', '-map', '1:a', '-t', f'{d:.4f}', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
     '-af', f'afade=t=out:st={d - 1.2:.2f}:d=1.2', '-movflags', '+faststart', OUT])
print('preview', round(d, 2), 's; logo shot from', round(tl - t0, 2), 's, last hit at', round(cuts['hit'] - t0, 2), 's')
