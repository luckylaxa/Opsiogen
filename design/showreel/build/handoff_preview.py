"""Preview of the hand-overs from the stock clips of people to the work (handoff.py, frames.html ENTER), for approval:
each one is the last second of the clip with its new ending and the first 1.2 seconds of the shot after, with the
film's own track at that point, one after another with a short black gap.
Usage: python3 handoff_preview.py FRAMES_DIR OUT.mp4   (FRAMES_DIR: the last website cut's frames, with film/)"""
import sys, os, json, subprocess
from handoff import tail
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
B = os.path.dirname(os.path.abspath(__file__)); ST = os.path.join(B, '..', 'raw', 'stock') + '/'
SRC = os.path.join(FR, 'film'); WD = os.path.join(FR, 'handoff'); os.makedirs(WD, exist_ok=True)
FPS = 30; run = lambda c: subprocess.run(c, check=True)
cuts = json.load(open(os.path.join(SRC, 'cuts.json')))['cuts']
shots = [s['name'] for s in json.load(open(os.path.join(FR, 'shots.json')))]
N = lambda i: round((cuts[i + 1] - cuts[i]) * FPS)
# (stock clip, its file and in point, the shot after it in frames.html now). The getaway now leads into the Mykonos
# page (it swapped places with the wall of websites).
PAIRS = [(7, 'as-480737977.mov', 13.6, 8), (9, 'as-405010525.mov', 3.0, 10), (33, '208770_large.mp4', 4.6, 34),
         (56, 'as-150778364.mov', 4.0, 57), (74, 'as-577275631.mov', 3.2, 75)]
FIT = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1'
PUNCH = "scale=w='2*trunc(960*(1+0.1*pow(max(0,1-t/0.2),3)))':h=-2:eval=frame,crop=1920:1080"
ENC = lambda n, o: ['-frames:v', str(n), '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), o]
jobs = []
for i, f, t0, nx in PAIRS:
    n = N(i); tl = tail(shots[i], n / FPS); clip = os.path.join(WD, f'{i:03d}.mp4')
    inputs = ['-ss', str(t0), '-i', ST + f]
    fc = f'[0:v]setpts=PTS-STARTPTS,{FIT},fps={FPS},settb=1/{FPS}[v];[v]{PUNCH}' + (',' + tl if tl else '') + '[o]'
    over = os.path.join(SRC, 'frames', f'{i:03d}a')
    if os.path.isdir(over):   # our character beside him, drawn on its own
        inputs += ['-framerate', str(FPS), '-i', os.path.join(over, '%03d.png')]
        fc = fc.replace('[o]', '[o0]') + ';[o0][1:v]overlay=0:0[o]'
    run(['ffmpeg', '-y', '-v', 'error'] + inputs + ['-filter_complex', fc, '-map', '[o]'] + ENC(n, clip))
    last = os.path.join(WD, f'last-{i:03d}.jpg')
    run(['ffmpeg', '-y', '-v', 'error', '-i', clip, '-vf', f'select=eq(n\\,{n - 1})', '-frames:v', '1', '-q:v', '2', last])
    jobs.append([nx, 36, last])
json.dump({'frames': FR, 'out': os.path.join(WD, 'frames'), 'fps': FPS, 'jobs': jobs}, open(os.path.join(WD, 'jobs.json'), 'w'))
run(['node', os.path.join(B, 'render-anim.cjs'), os.path.join(WD, 'jobs.json')])
parts = []
for i, f, t0, nx in PAIRS:
    n = N(i); clip = os.path.join(WD, f'{i:03d}.mp4'); after = os.path.join(WD, f'{nx:03d}-in.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(WD, 'frames', f'{nx:03d}', '%03d.jpg')] + ENC(36, after))
    keep = min(1.0, n / FPS); cut = cuts[i + 1]; pair = os.path.join(WD, f'pair-{i:03d}.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-i', clip, '-i', after, '-ss', f'{cut - keep:.4f}', '-t', f'{keep + 1.2:.4f}', '-i', os.path.join(SRC, 'music.wav'),
         '-filter_complex', f'[0:v]trim=start={n / FPS - keep:.4f},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[v];'
         f'[2:a]afade=t=in:d=0.08,afade=t=out:st={keep + 1.2 - .15:.4f}:d=0.15[m]',
         '-map', '[v]', '-map', '[m]', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', pair])
    parts.append(pair)
gap = os.path.join(WD, 'gap.mp4')
run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', f'color=c=black:s=1920x1080:r={FPS}:d=0.4', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
     '-t', '0.4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', gap])
seq = [p for q in parts for p in (q, gap)][:-1]
open(os.path.join(WD, 'list.txt'), 'w').write(''.join(f"file '{p}'\n" for p in seq))
run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(WD, 'list.txt'), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
     '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', OUT])
print('preview', len(parts), 'hand-overs')
