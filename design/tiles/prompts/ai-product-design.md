# Product design: scene prompts (remake with big devices)

Model: GPT image (gpt-image-2.6 "sunburst" in ElevenLabs, or the highest GPT image model in Runway).
Landscape 16:9, 1 image each. Save each as `design/tiles/scenes/ai-product-design/r-<name>.png`.

Done: `r-green.png` (Product design tile, approved composition).

## r-blue.png (UX audits)
Crisp editorial product photograph, wide landscape, shot at f/11: everything in sharp focus, no bokeh, no blur, no haze, no vignette. A deep navy blue velvet sofa along the bottom of the frame, and on its seat an open thin silver laptop seen from a low side angle, its screen facing toward the left. Composition rule: the laptop is large: the top edge of its screen sits at one third of the frame height and the laptop fills the right 55% of the frame width, its base near the bottom edge, with nothing in front of the screen. The top third and the left 45% of the frame are an empty, flat, evenly lit, matte deep steel-blue painted wall and the sofa back. The laptop screen is completely blank, flat pure white, evenly lit, no content, no reflections. No people, no text, no logos.

## r-hand.png (Redesign and iteration)
Crisp editorial photograph, wide landscape, shot at f/11: hand, phone and background all in sharp focus, no bokeh, no blur, no vignette. A right hand rises from the bottom edge of the frame holding the latest iPhone Pro (natural titanium frame, very thin even black bezels, small pill-shaped Dynamic Island, no notch) upright in portrait, tilted about 10 degrees. Composition rule: the phone is large: its top edge sits at one third of the frame height and its bottom runs off the bottom edge of the frame, centred at about 72% of the frame width, the whole phone screen visible. The top third and the left half of the frame are an empty, sharply detailed, rich dark-honey vertical wood-panelled wall. The phone screen is completely blank, flat pure white, evenly lit, no content, no reflections. Natural skin, no rings or nail polish, only hand and wrist, no face. No text, no logos.

## r-sage.png (Prototypes and validation)
Crisp editorial flat-lay photograph, wide landscape, shot from directly above at f/11: everything in sharp focus, no bokeh, no blur, no vignette. A deep sage green linen tablecloth with crisp hard-edged leaf shadows. The latest iPhone Pro (natural titanium frame, very thin even black bezels, small pill-shaped Dynamic Island, no notch) lies flat, rotated about 20 degrees. Composition rule: the phone is large: its top corner sits at one third of the frame height and its bottom corner runs just off the bottom edge, centred at about 72% of the frame width, the whole screen visible. The top third and the left half of the frame are empty linen with leaf shadows. The phone screen is completely blank, flat pure white, evenly lit, no content, no reflections. Deep muted greens. No people, no text, no logos.

## r-walnut.png (Developer-ready handoff)
Crisp editorial photograph, wide landscape, seen from above at an angle, shot at f/11: everything in sharp focus, no bokeh, no blur, no vignette. A dark walnut wooden desk in warm late-afternoon sun with crisp long window shadows. An open space-grey laptop with a closed black notebook and a pencil to its left. Composition rule: the laptop is large: the top edge of its screen sits at one third of the frame height and the laptop fills the right 55% of the frame width, its keyboard running off the bottom edge, with nothing in front of the screen. The top third and the left 40% of the frame are empty dark walnut wood (the notebook sits low at the left of the laptop). The laptop screen is completely blank, flat pure white, evenly lit, no content, no reflections. No plants, no people, no text, no logos.

Design systems: no image needed (flat card, `screens/dsys.html`).
After the scenes: `py/tile.py` with fill=(0.33, 0.92) laptops / (0.30, 0.80) phones, check
desktop and phone, then publish (skill steps 5).
