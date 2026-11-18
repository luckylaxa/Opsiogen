"""The film's music, made here in code: an original instrumental at 120 beats a minute, shaped by the cut list
(cuts.json from cuts.cjs) so the drums drop out on each chapter card, hit on each service line and end on the logo.
Usage: python3 music.py cuts.json out.wav
"""
import sys, json
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
BEAT = 0.5
rng = np.random.default_rng(7)
cut = json.load(open(sys.argv[1]))
DUR = cut["dur"]
N = int(SR * (DUR + 0.6))
L = np.zeros(N); R = np.zeros(N)

def put(buf, t, x, g=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    n = min(len(x), N - i); buf[i:i + n] += x[:n] * g

def both(t, x, g=1.0, pan=0.0):
    put(L, t, x, g * (1 - max(0, pan))); put(R, t, x, g * (1 + min(0, pan)))

def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def kick():
    n = int(.34 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / .028)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .13)
    return x + filt(rng.standard_normal(n), "high", 3000) * np.exp(-t / .004) * .25

def clap():
    n = int(.26 * SR); t = np.arange(n) / SR
    e = sum(np.exp(-np.maximum(0, t - d) / .012) * (t >= d) for d in (0, .011, .023)) * .5 + np.exp(-t / .08) * .5
    return filt(rng.standard_normal(n), "band", [900, 4200]) * e

def hat(d=.022):
    n = int(.09 * SR); t = np.arange(n) / SR
    return filt(rng.standard_normal(n), "high", 7500) * np.exp(-t / d)

def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * f * (1 + det)) % 1) - 1

def bass(f, dur=.21):
    n = int(dur * SR)
    x = saw(f, n) * .6 + np.sin(2 * np.pi * f * np.arange(n) / SR) * .8
    return filt(x, "low", 420) * env(n, .004, .16)

def pluck(f, dur=.3, bright=3200):
    n = int(dur * SR)
    x = saw(f, n, .003) + saw(f, n, -.004)
    return filt(x, "low", bright) * env(n, .002, .085) * .5

def stab(fs, dur=.55):
    n = int(dur * SR)
    x = sum(saw(f, n, d) for f in fs for d in (.004, -.004, 0))
    return filt(x, "low", 5200) * env(n, .003, .2) / len(fs) * .55

def noise_sweep(dur, up=True):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); step = 2048
    for i in range(0, n, step):
        p = i / n if up else 1 - i / n
        out[i:i + step] = filt(x[i:i + step], "band", [300 + 5200 * p, 900 + 9000 * p])
    ramp = np.linspace(0, 1, n) ** 2 if up else np.linspace(1, 0, n) ** 1.5
    return out * ramp

def impact():
    n = int(1.4 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t / .05)) / SR) * np.exp(-t / .38)
    return sub + filt(rng.standard_normal(n), "high", 2500) * np.exp(-t / .32) * .35

# Four chords, one per bar (two seconds): A minor, F, C, G.
CH = [(55.0, [220.0, 261.63, 329.63, 440.0]), (43.65, [174.61, 220.0, 261.63, 349.23]), (65.41, [196.0, 261.63, 329.63, 392.0]), (49.0, [196.0, 246.94, 293.66, 392.0])]
chord = lambda t: CH[int(t // 2) % 4]

words = [c for c, k in zip(cut["cuts"], cut["kinds"]) if k == "word"]
msgs = [c for c, k in zip(cut["cuts"], cut["kinds"]) if k == "msg"]
DROP = 3.0                      # the teaser starts: the beat comes in
END = DUR - 6.5                 # the closing words
LOGO = DUR - 2.75               # the logo
in_word = lambda t: any(w <= t < w + 1 for w in words)

K, C, Hh = kick(), clap(), hat()

# Opening: a soft arpeggio and a rising sweep into the drop.
for i in range(int(DROP / .25)):
    t = i * .25; r, tones = chord(t)
    both(t, pluck(tones[i % 4], .34, 1500 + 500 * i), .34, pan=(-.4 if i % 2 else .4))
both(DROP - 2.2, noise_sweep(2.2), .22)

t = DROP
while t < LOGO - 1e-6:
    r, tones = chord(t); step = round((t - DROP) / .125); beat = step % 4 == 0
    closing = t >= END; quiet = in_word(t) or (closing and t >= LOGO - 1.25)
    if not quiet:
        if beat:
            both(t, K, .95)
        if step % 8 == 4 and not closing: both(t, C, .5)
        if step % 2 == 0 and step % 4 == 2: both(t, Hh, .3, pan=.3)        # offbeat hats
        elif step % 2 == 1 and not closing: both(t, hat(.012), .1, pan=-.3)
        if step % 4 == 2: both(t, bass(r if step % 16 < 12 else r * 1.5), .55)   # the bass answers the kick, off the beat
    if step % 2 == 0 and not in_word(t):
        both(t, pluck(tones[(step // 2 * 3) % 4] * (2 if step % 16 >= 8 else 1), .3), .2, pan=(-.5 if step % 4 else .5))
    t += .125

# Chapter cards: one deep hit, the beat steps back, a short roll brings it in again.
for w in words:
    both(w, impact(), .8); both(w, stab(chord(w)[1], 1.0), .45)
    for j in range(4): both(w + .5 + j * .125, C, .18 + .09 * j)
    both(w + .45, noise_sweep(.55), .18)
# Service lines: a bright chord on each.
for m in msgs: both(m, stab([f * 2 for f in chord(m)[1]]), .42)
# The closing: a long sweep up to the logo, two chords for the last line, then one final hit that rings out.
both(END, impact(), .7); both(LOGO - 3.0, noise_sweep(3.0), .26)
both(LOGO - 1.25, stab(CH[1][1], .6), .5); both(LOGO - .625, stab(CH[3][1], .6), .5)
both(LOGO, impact(), 1.0)
n = int(3.2 * SR); tt = np.arange(n) / SR
ring = sum(np.sin(2 * np.pi * f * tt) for f in [110, 220, 261.63, 329.63, 440]) / 5 * np.exp(-tt / 1.1)
both(LOGO, ring, .55); both(LOGO, stab([220, 261.63, 329.63, 440, 659.25], 2.6), .5)

# A short echo for width, then a gentle limit so nothing clips.
d = int(.375 * SR)
for buf, other in ((L, R), (R, L)):
    wet = np.zeros(N); wet[d:] = other[:-d] * .16; buf += filt(wet, "high", 500)
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.15)
fade = int(.5 * SR); end = int(DUR * SR)
mix[end - fade:end] *= np.linspace(1, 0, fade)[:, None]; mix = mix[:end]
mix = mix / np.abs(mix).max() * .89
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print("music", round(len(mix) / SR, 2), "s")
