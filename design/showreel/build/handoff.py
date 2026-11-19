"""How a stock clip of people hands over to the work after it, without text (Lucky, 19 Nov: "Instead of text any other
idea"; then "Show only these cuts transition and after approval you can mix all works").

The clip's last T seconds: the camera rushes into what they look at (push: to a point, which comes to the middle),
pans fast the way they move
(whip, +1 to the right), or rushes a little at the high five's hands and whites out (flash). The lens circle (lens) is
drawn by the shot after alone. The shot after picks each of these up in frames.html (ENTER), so keep the two in step.
Keyed by the stock clip's number in its shot name."""
OUT = {
    "488563452": ("push", 1515, 615, 4),     # she points at our character: rush into it, onto "We take it from here"
    "480737977": ("lens",),                  # the win: the work opens out of our character's lens beside him
    "405010525": ("whip", 1),                # the after-work ride: she rides right, into the bike brand
    "Pixabay 208770": ("push", 720, 840, 9), # her smile: into her phone, onto the lipstick app
    "150778364": ("push", 420, 440, 4),      # the getaway: out to sea, onto the coast on the property site
    "577275631": ("flash", 840, 270),        # the high five: the hands meet, white, onto the wall of the work
    "249372459": ("push", 1050, 390, 3),     # a big laugh: in on her, onto the stage she is watching
    "191180958": ("push", 990, 240, 4),      # the open road: down the road ahead, onto the car
    "490354049": ("whip", 1),                # a confident smile: across to the next smile
    "294857367": ("push", 1320, 540, 3),     # family time: into the hug, onto the health apps
    "5137353": ("push", 1410, 840, 6),       # laughing at the laptop: into the laptop, onto the website
    "329117728": ("whip", -1),               # free on the road: the other way, onto the campaigns
    "4053012": ("push", 960, 720, 5),        # two friends laughing: into their laptop, onto the closing words
}
T = 0.3   # seconds the hand-over takes at the end of the clip
FPS = 30


def tail(name, dur):
    """ffmpeg filters (no leading comma) for the end of a stock clip already fitted to 1920x1080 at the film's
    frame rate, starting at t=0; '' when the clip has no hand-over of its own."""
    k = next((v for s, v in OUT.items() if s in name), None)
    if not k or k[0] == "lens":
        return ""
    te = dur - T
    q = f"max(0,(on/{FPS}-{te:.4f})/{T})"   # 0 to 1 over the hand-over (zoompan counts frames: on)
    # zoompan keeps the frame size fixed while it zooms (a crop after a growing scale keeps its first frame's size and
    # drifts to the corner); x, y: the top left of the window it shows, so the point (px, py) stays put.
    zp = lambda z, x, y: f"zoompan=z='{z}':x='{x}':y='{y}':d=1:s=1920x1080:fps={FPS}"
    if k[0] == "push":   # rushes in up to zm times, the point (px, py) coming to the middle as it does
        px, py, zm = k[1:]
        return (zp(f"1+{zm - 1}*pow({q},3)", f"{px}-({px}+{960 - px}*{q})/zoom", f"{py}-({py}+{540 - py}*{q})/zoom")
                + f",boxblur=12:1:enable='gte(t,{te + T * .5:.4f})'")
    if k[0] == "flash":  # a little rush at the hands, then white
        px, py = k[1:]
        return (zp(f"1+.35*pow({q},2)", f"{px}*(1-1/zoom)", f"{py}*(1-1/zoom)")
                + f",fade=t=out:st={dur - .12:.4f}:d=0.12:color=white")
    d = k[1]   # whip: zooms a little while the view runs off the way they move, blurred along the move
    return (zp(f"1+.6*pow({q},2)", f"(iw-iw/zoom)/2*(1+{d}*{q})", "(ih-ih/zoom)/2")
            + f",avgblur=sizeX=40:sizeY=1:enable='gte(t,{te + T * .4:.4f})'")
