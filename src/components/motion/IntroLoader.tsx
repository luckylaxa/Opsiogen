import { INTRO_IMAGES } from "@/lib/theme";

/**
 * The first-visit intro (design system; see INTRO_SCRIPT in lib/theme.ts and `.intro` in globals.css): on a black
 * screen our character pops in, crouches, jumps and does a backflip, comes out of it facing the visitor, then flies at
 * the screen and the page opens through its visor (Lucky, 25 Nov). Markup only: the head script starts it once its
 * three pictures are in, so it plays before the page's scripts load. The pictures are backgrounds, so pages that don't
 * play it never fetch them.
 */
export function IntroLoader() {
  const [flip, shell, face] = INTRO_IMAGES;
  return (
    <div className="intro" role="status" aria-label="Loading">
      <span className="intro__bg" />
      <div className="intro__zoom" aria-hidden="true">
        <div className="intro__lens">
          <span className="intro__veil" />
          <div className="intro__pop">
            <div className="intro__front">
              <span className="intro__face" style={{ backgroundImage: `url(${face})` }} />
              <span className="intro__shell" style={{ backgroundImage: `url(${shell})` }} />
            </div>
            <span className="intro__turn">
              <span className="intro__strip" style={{ backgroundImage: `url(${flip})` }} />
            </span>
          </div>
        </div>
      </div>
      <div className="intro__floor" aria-hidden="true">
        <span className="intro__glow" />
      </div>
    </div>
  );
}
