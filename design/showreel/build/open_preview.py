"""Preview of the share cut's opening: the opening line (cut 12's clip), the new logo beat, the stock clip opening out of
it in the lens circle with our character, "We take it from here" and the next shot (cut 12's clips), with the track.
Usage: python3 open_preview.py FRAMES_DIR OUT.mp4"""
import sys, os, json, subprocess
FR, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
B = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(B); SRC = os.path.join(FR, 'film'); WD = os.path.join(FR, 'openprev')
BEAT, FPS = 60 / 140, 30; fr = lambda b: round(b * BEAT * FPS)
run = lambda c, **k: subprocess.run(c, check=True, **k)
os.makedirs(WD, exist_ok=True)
beats = [0, 3, 11, 14, 16, 18]          # opening line 3, logo beat 8, stock 3, "We take it" 2, three apps 2
N = [fr(beats[i + 1]) - fr(beats[i]) for i in range(5)]
op_last = os.path.join(SRC, 'frames', '000', sorted(os.listdir(os.path.join(SRC, 'frames', '000')))[-1])
beat_last = os.path.join(WD, 'frames', '001', f'{N[1] - 1:03d}.jpg')
json.dump({'frames': FR, 'out': os.path.join(WD, 'frames'), 'fps': FPS,
           'jobs': [[1, N[1], op_last], [2, N[2], beat_last, 'alpha']]}, open(os.path.join(WD, 'jobs.json'), 'w'))
run(['node', os.path.join(B, 'render-anim.cjs'), os.path.join(WD, 'jobs.json')], env={**os.environ, 'SHARE': '1'})
ENC = lambda n, o: ['-frames:v', str(n), '-an', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-r', str(FPS), o]
run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(WD, 'frames', '001', '%03d.jpg')] + ENC(N[1], os.path.join(WD, '001.mp4')))
# The stock clip, opening out of the logo beat in the lens circle drawn in its character layer (film.py's iris).
FIT = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1'
run(['ffmpeg', '-y', '-v', 'error', '-ss', '1.2', '-i', os.path.join(R, 'raw', 'stock', 'as-488563452.mov'),
     '-framerate', str(FPS), '-i', os.path.join(WD, 'frames', '002a', '%03d.png'),
     '-filter_complex', f'[0:v]setpts=PTS-STARTPTS,{FIT},fps={FPS},settb=1/{FPS}[v];[v]null[o0];[o0][1:v]overlay=0:0[o]', '-map', '[o]'] + ENC(N[2], os.path.join(WD, '002.mp4')))
files = [os.path.join(SRC, '000.mp4'), os.path.join(WD, '001.mp4'), os.path.join(WD, '002.mp4'), os.path.join(SRC, '002.mp4'), os.path.join(SRC, '003.mp4')]
open(os.path.join(WD, 'list.txt'), 'w').write(''.join(f"file '{f}'\n" for f in files))
dur = fr(beats[-1]) / FPS
run(['ffmpeg', '-y', '-v', 'error', '-ss', '1.726', '-i', os.path.join(R, 'music', 'fast-percussion.mp3'), '-t', str(dur), os.path.join(WD, 'music.wav')])
run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(WD, 'list.txt'), '-i', os.path.join(WD, 'music.wav'), '-t', str(dur),
     '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-af', f'afade=t=out:st={dur - .6:.2f}:d=0.6', '-movflags', '+faststart', OUT])
print('preview', round(dur, 2), 's; logo beat', round(fr(beats[1]) / FPS, 2), '-', round(fr(beats[2]) / FPS, 2))
