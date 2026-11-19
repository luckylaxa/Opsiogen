import { INTRO_IMAGES } from "@/lib/theme";

/**
 * The first-visit intro (design system; see INTRO_SCRIPT in lib/theme.ts and `.intro` in globals.css): our character
 * drops in, bounces, spins once in the air, lands facing the visitor, then rushes at the screen, and the page opens
 * through its lens. Markup only: the head script starts it once its two pictures are in, so it plays before the
 * page's scripts load. The pictures are backgrounds, so pages that don't play it never fetch them.
 */
export function IntroLoader() {
  const [turn, shell] = INTRO_IMAGES;
  return (
    <div className="intro" role="status" aria-label="Loading">
      <span className="intro__bg" />
      <div className="intro__zoom" aria-hidden="true">
        <span className="intro__veil" />
        <span className="intro__glow" />
        <div className="intro__hop">
          <div className="intro__rock">
            <span className="intro__shell" style={{ backgroundImage: `url(${shell})` }} />
            <span className="intro__turn">
              <span className="intro__strip" style={{ backgroundImage: `url(${turn})` }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
