import type { HeroSection, Img } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";
import { HeroCharacter } from "./HeroCharacter";
import { HeroGlow } from "./HeroGlow";

const fadeOut = { opacity: "clamp(0, calc(1 - var(--hero-p, 0) * 3.2), 1)", transform: "translateY(calc(var(--hero-p, 0) * -60px))" } as React.CSSProperties;
const fadeIn = { opacity: "clamp(0, calc((var(--hero-p, 0) - 0.42) * 3.4), 1)", transform: "translateY(calc((1 - clamp(0, calc((var(--hero-p, 0) - 0.42) * 3.4), 1)) * 40px))" } as React.CSSProperties;

/** The scene grows toward its far end as the visitor scrolls, as if we follow the character into it. */
const dolly = (extra: number) => ({ transform: `scale(calc((1 + var(--hero-p, 0) * 0.22) * ${extra}))`, transformOrigin: "50% 55%" }) as React.CSSProperties;
const spotsFade = { opacity: "clamp(0, calc(1 - var(--hero-p, 0) * 6), 1)" } as React.CSSProperties;
const rushMask = "radial-gradient(ellipse 46% 44% at 50% 55%, transparent 62%, #000 100%)";

/**
 * Home: the first stop of the journey holds still for a short scroll. Our character floats in the middle, large,
 * with the heading small beside it (above it on phones). Points on the items in the picture make it look at them
 * and show a few words about each. As the visitor scrolls, the character turns its back and
 * flies into the scene: the picture moves toward us and streaks at the edges while it is fast, the heading fades
 * and one line about what we do takes its place. Then the page carries on.
 */
function HeroJourney({ section, image, children }: { section: HeroSection; image: HeroImage; children?: React.ReactNode }) {
  const words = "absolute inset-x-0 top-[calc(var(--header-h)+5svh)] px-gutter md:top-0 md:top-[calc(var(--header-h)+4svh)] md:right-auto md:w-[40vw]";
  return (
    <>
      <div data-hero-stage className="hero-picture hero-picture-dark on-dark relative -mt-[var(--header-h)] h-[220svh] bg-night text-white">
        <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
          <div className="absolute inset-0 will-change-transform" style={dolly(1)}>
            <Media image={image.image} phone={image.phone} sizes="100vw" priority />
            {/* The points sit on the picture itself: this box is the wide picture's own frame, so they stay on their items at any screen size. */}
            {image.spots && (
              <div style={spotsFade} className="pointer-events-none absolute top-1/2 left-1/2 hidden aspect-video w-[max(100vw,177.78svh)] -translate-1/2 sm:block">
                {image.spots.map((spot) => (
                  <button
                    key={spot.title}
                    type="button"
                    data-hero-spot
                    data-title={spot.title}
                    data-text={spot.text}
                    className="group pointer-events-auto absolute size-11 -translate-1/2 cursor-pointer rounded-full outline-offset-2 hover:z-10 focus-visible:z-10 data-[on]:z-10"
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  >
                    <span aria-hidden="true" className="absolute inset-[11px] rounded-full bg-white/35 motion-safe:animate-ping" />
                    <span aria-hidden="true" className="absolute inset-[14px] rounded-full bg-white shadow-[0_0_0_3px_rgb(0_0_0/0.25),0_2px_10px_rgb(0_0_0/0.4)] transition-transform duration-200 group-hover:scale-125" />
                    <span
                      className={cn(
                        "pointer-events-none absolute block w-[clamp(200px,17vw,260px)] scale-90 overflow-hidden rounded-[10px] border border-white/20 bg-[rgb(10_12_22/0.88)] px-3.5 pt-3 pb-3 text-left opacity-0 shadow-[0_12px_40px_rgb(0_0_0/0.45)] transition duration-200 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-data-[on]:scale-100 group-data-[on]:opacity-100",
                        spot.side === "left" ? "right-[calc(100%+2px)] origin-right" : "left-[calc(100%+2px)] origin-left",
                        spot.side === "up" ? "bottom-1/2" : spot.side === "down" ? "top-1/2" : "top-1/2 -translate-y-1/2",
                      )}
                    >
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#35d4ff,#5a7dff,#b667ff,#ff5fb4,#ff9a3c)]" />
                      <span className="block text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">{spot.title}</span>
                      <span className="mt-1 block text-[15px] leading-snug font-medium text-white">{spot.text}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Speed streaks: the same picture again, a little larger, at the edges only. The character code fills and shows them while it flies fast. */}
          {[1.05, 1.11].map((k) => (
            <div
              key={k}
              data-hero-rush
              data-wide={image.image.url}
              data-narrow={image.phone?.url}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0 will-change-[transform,opacity]"
              style={{ ...dolly(k), maskImage: rushMask, WebkitMaskImage: rushMask }}
            />
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-black/80 via-black/50 to-transparent md:h-40 md:from-black/45 md:via-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[48%] bg-gradient-to-r from-black/60 via-black/25 to-transparent md:block" />
          <div className={words}>
            <div style={fadeOut} className="flex flex-col items-center text-center md:items-start md:text-left">
              {section.label && (
                <p className="mb-[clamp(14px,1.4vw,22px)] rounded-[4px] border border-white/40 px-[0.6em] py-[0.15em] text-[clamp(13px,1vw,16px)]">{section.label}</p>
              )}
              <h1 className="max-w-[19ch] text-[length:clamp(30px,8.4vw,44px)] leading-[0.98] font-bold tracking-[-0.02em] uppercase [text-shadow:0_2px_30px_rgb(0_0_0/0.3)] md:text-[length:clamp(30px,min(2.7vw,5.4svh),52px)]">
                {section.heading}
              </h1>
              {section.button?.href && section.button.label && (
                <ButtonLink href={section.button.href} variant="light" className="mt-[clamp(18px,2.6svh,32px)]">
                  {section.button.label}
                </ButtonLink>
              )}
            </div>
          </div>
          {image.after && (
            <div className={`pointer-events-none ${words}`}>
              <p style={fadeIn} className="mx-auto max-w-[19ch] text-center text-[length:clamp(28px,7.6vw,40px)] leading-[1.04] font-bold tracking-[-0.02em] text-balance [text-shadow:0_2px_30px_rgb(0_0_0/0.3)] md:mx-0 md:text-left md:text-[length:clamp(30px,min(2.7vw,5.4svh),52px)]">
                {image.after}
              </p>
            </div>
          )}
          {image.caption && (
            <p style={spotsFade} className="pointer-events-none absolute right-gutter bottom-[96px] max-w-[60vw] text-right text-[12px] text-white/75 md:bottom-6 md:text-[13px]">{image.caption}</p>
          )}
          <HeroCharacter />
        </div>
      </div>
      {children && <div className="bg-band pt-[clamp(48px,calc(2.88vw+37.2px),92px)] pb-[clamp(40px,calc(2.3vw+31.4px),76px)]">{children}</div>}
    </>
  );
}

/**
 * A picture for the first hero: the wide image and a tall crop for phones, plus the
 * words that belong to the picture (small label, faint wordmark, scroll hint, note, second button).
 */
export type HeroImage = {
  image: Img;
  phone?: Omit<Img, "alt" | "hotspot">;
  /**
   * A daytime version for the light theme; `image` is then the dark theme's night version,
   * and the words and the header over the picture follow the theme.
   */
  day?: { image: Img; phone?: Omit<Img, "alt" | "hotspot"> };
  eyebrow?: string;
  wordmark?: string;
  scrollHint?: string;
  note?: string;
  secondButton?: { label: string; href: string };
  /** Dots down the right edge, one per stop of the tour. */
  stops?: number;
  /** Our character flies in the picture and turns to look at the visitor. */
  character?: boolean;
  /** With the character: points in the picture it looks at and explains in a few words, when the pointer goes to them. */
  spots?: { x: number; y: number; title: string; text: string; side?: "up" | "down" | "left" }[];
  /** With the character: one small line that says whose brand the picture shows. */
  caption?: string;
  /** With the character: the line that fades in once the heading has gone. */
  after?: string;
};

/**
 * Hero band from the reference: grey band that runs up under the header, a
 * small pill label, a giant uppercase heading and a button or line of text.
 * When followed by a featured project, the band continues behind its card.
 * `full` makes the heading fill the first screen (Home).
 */
export function Hero({
  section,
  full,
  glow,
  light,
  image,
  roomy,
  children,
}: {
  section: HeroSection;
  full?: boolean;
  /** Phones: a little more room between the heading's lines (see GiantHeading). */
  roomy?: boolean;
  /** Soft pools of colour behind the heading, on the page's own white or black, with our character (Home). */
  glow?: boolean;
  /** The same colour light behind the heading, without the character (Services, About, Contact). */
  light?: boolean;
  /** Shows the hero as one picture card filling the first screen, with the text on it. */
  image?: HeroImage;
  children?: React.ReactNode;
}) {
  if (image?.character) return <HeroJourney section={section} image={image}>{children}</HeroJourney>;
  if (image) {
    const label = image.eyebrow ?? section.label;
    const day = image.day;
    // With a day version the words take the theme's ink (dark by day, light by night);
    // with the night picture alone they are always white.
    const soft = day ? "text-ink/80" : "text-white/80";
    const wash = day ? "from-page/60" : "from-black/60";
    // Phones: the wash holds further up, behind the note that sits above the buttons.
    const washLow = day ? "from-page/80 max-md:via-page/55" : "from-black/75";
    return (
      <>
        {/* The picture fills the first screen and runs up under the clear header. */}
        <div
          className={cn(
            "hero-picture relative -mt-[var(--header-h)] h-[100svh] min-h-[560px] overflow-hidden",
            day ? "bg-band text-ink" : "hero-picture-dark on-dark bg-night text-white",
          )}
        >
          {day ? (
            <>
              {/* Night is the main image (dark is the default theme); day loads only when the light theme shows it. */}
              <div className="absolute inset-0 hidden dark:block">
                <Media image={image.image} phone={image.phone} sizes="100vw" priority />
              </div>
              <div className="absolute inset-0 dark:hidden">
                <Media image={day.image} phone={day.phone} sizes="100vw" />
              </div>
            </>
          ) : (
            <Media image={image.image} phone={image.phone} sizes="100vw" priority />
          )}
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b to-transparent", wash)} />
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent", washLow)} />
          {image.wordmark && (
            <p
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2vh)] hidden text-center text-[length:15vw] leading-none font-bold tracking-[-0.02em] uppercase select-none md:block",
                day ? "text-white/40 dark:text-white/[0.13]" : "text-white/[0.13]",
              )}
            >
              {image.wordmark}
            </p>
          )}
          {/* Phones: the words sit in the sky. Larger screens: bottom left, over the water; with the character, top left over the sky. */}
          <div
            className={cn(
              "absolute inset-x-0 top-[calc(var(--header-h)+12px)] p-[clamp(20px,calc(2.6vw+10px),48px)] md:right-auto md:max-w-[min(48vw,780px)]",
              image.character ? "md:top-[calc(var(--header-h)+3vh)]" : "md:top-auto md:bottom-0",
            )}
          >
            {label && <p className={cn("mb-[clamp(12px,1.2vw,20px)] text-[13px] tracking-[0.2em] uppercase", soft)}>{label}</p>}
            <h1 className="max-w-[13ch] text-[length:clamp(34px,calc(3.6vw+10px),80px)] leading-[0.98] font-bold tracking-[-0.02em] uppercase">
              {section.heading}
            </h1>
            {section.text && <p className={cn("mt-4 max-w-[38ch] text-lead", day ? "text-ink/85" : "text-white/85")}>{section.text}</p>}
            {image.character && section.button?.href && section.button.label && (
              <ButtonLink href={section.button.href} variant="light" className="mt-[clamp(20px,2.4vw,40px)]">
                {section.button.label}
              </ButtonLink>
            )}
          </div>
          {image.scrollHint && (
            <p
              aria-hidden="true"
              className={cn("absolute bottom-[112px] left-1/2 hidden -translate-x-1/2 text-center text-[11px] tracking-[0.24em] uppercase md:block", soft)}
            >
              {image.scrollHint}
              <span
                className={cn(
                  "relative mx-auto mt-2.5 block h-[34px] w-[22px] rounded-[12px] border-[1.5px] after:absolute after:top-[7px] after:left-1/2 after:h-[7px] after:w-[3px] after:-translate-x-1/2 after:rounded-[2px]",
                  day ? "border-ink after:bg-ink" : "border-white after:bg-white",
                )}
              />
            </p>
          )}
          {/* Note and buttons: above the floating bar on phones, bottom right on larger screens. */}
          {!image.character && (
          <div
            className="absolute inset-x-0 bottom-[92px] flex flex-col items-start gap-3 p-[clamp(20px,calc(2.6vw+10px),48px)] md:right-0 md:bottom-0 md:left-auto md:items-end"
          >
            {image.note && (
              <p className={cn("max-w-[30ch] text-[13px] leading-[1.35] md:text-right", day ? "text-ink/75" : "text-white/75")}>{image.note}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {section.button?.href && section.button.label && (
                <ButtonLink href={section.button.href} variant={day ? "dark" : "light"}>
                  {section.button.label}
                </ButtonLink>
              )}
              {image.secondButton && (
                <ButtonLink href={image.secondButton.href} variant={day ? "outline" : "outline-light"}>
                  {image.secondButton.label}
                </ButtonLink>
              )}
            </div>
          </div>
          )}
          {image.stops && (
            <div aria-hidden="true" className="absolute top-1/2 right-[clamp(14px,1.6vw,30px)] hidden -translate-y-1/2 gap-3.5 md:grid">
              {Array.from({ length: image.stops }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block size-[7px] rounded-full",
                    // White in both themes: by day they lie over the trees.
                    i === 0 ? "bg-white ring-4 ring-white/25" : day ? "bg-white/60 dark:bg-white/35" : "bg-white/35",
                  )}
                />
              ))}
            </div>
          )}
        </div>
        {children && (
          <div className="bg-band pt-[clamp(48px,calc(2.88vw+37.2px),92px)] pb-[clamp(40px,calc(2.3vw+31.4px),76px)]">{children}</div>
        )}
      </>
    );
  }
  return (
    <div
      className={cn(
        "-mt-[var(--header-h)] pt-[calc(var(--header-h)+clamp(64px,calc(3.14vw+52px),112px))]",
        // Phones (Home): the hero takes only the room it needs, so the showreel follows on the first screen.
        glow && "max-sm:pt-[calc(var(--header-h)+56px)]",
        // Our character sits near the right edge, and its flash and note would reach past the screen: keep the page
        // from growing sideways (on iPhones it let the page slide and showed an edge).
        glow && "overflow-x-clip",
        glow || light ? "relative isolate bg-page" : "bg-band",
        children
          ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]"
          : light
            ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]"
            : "pb-[clamp(104px,calc(7.07vw+77.6px),196px)]",
      )}
    >
      {glow && <HeroGlow />}
      {light && !glow && <HeroGlow short />}
      <GiantHeading
        as="h1"
        label={section.label}
        labelStyle="pill"
        roomy={roomy}
        heading={section.heading}
        accent={section.accent}
        text={section.text}
        // Full screen: the heading fills the first screen, centred above the floating bar. With something below it in
        // the band (Home's showreel), the first screen ends a little early so its top edge already shows, just under
        // our character, instead of a band of empty space (Lucky, 18 Nov).
        className={
          full
            ? cn(
                children
                  ? "min-h-[calc(100svh-var(--header-h)-clamp(64px,calc(3.14vw+52px),112px)-clamp(48px,calc(2.88vw+37.2px),92px)-clamp(28px,4svh,48px))]"
                  : "min-h-[calc(100svh-var(--header-h)-clamp(64px,calc(3.14vw+52px),112px))]",
                "justify-center pb-[clamp(96px,12vh,160px)]",
                glow && "-translate-y-[clamp(12px,3.5svh,44px)] max-sm:min-h-0 max-sm:translate-y-0 max-sm:pb-0",
              )
            : undefined
        }
      >
        {section.button?.href && section.button.label && (
          <ButtonLink href={section.button.href} className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
            {section.button.label}
          </ButtonLink>
        )}
      </GiantHeading>
      {/* Our character, bottom right of the first screen. On phones it sits just above the top right corner of what
          follows (Home's showreel), clear of the film, with its pool of light (Lucky, 21 Nov). Its box is wider than its
          body (its hands reach out to the sides), so the box is moved out by the difference to keep the body in place. */}
      {glow && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] min-h-[560px] max-sm:relative max-sm:z-10 max-sm:h-0 max-sm:min-h-0">
          <HeroCharacter className="pointer-events-auto right-[calc(clamp(14px,8vw,130px)-var(--w)*0.143)] bottom-[calc(clamp(100px,8svh,120px)-var(--w)*0.143)] [--w:clamp(129px,min(14.7vw,25.2svh),224px)] max-sm:right-[calc(var(--spacing-gutter)+14px-var(--w)*0.143)] max-sm:bottom-[calc(-62px-var(--w)*0.143)] max-[360px]:bottom-[calc(-86px-var(--w)*0.143)]! max-sm:[--w:112px]" />
        </div>
      )}
      {children && <div className={cn("mt-[clamp(48px,calc(2.88vw+37.2px),92px)]", glow && "max-sm:mt-[88px] max-[360px]:mt-[112px]!")}>{children}</div>}
    </div>
  );
}
