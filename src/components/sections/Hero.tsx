import type { HeroSection, Img } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";
import { HeroCharacter } from "./HeroCharacter";

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
  image,
  children,
}: {
  section: HeroSection;
  full?: boolean;
  /** Shows the hero as one picture card filling the first screen, with the text on it. */
  image?: HeroImage;
  children?: React.ReactNode;
}) {
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
          {image.character && (
            // With the character, the sky at the top left darkens a little behind the words.
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgb(0_0_0/0.55),transparent_70%)]" />
          )}
          {image.character && <HeroCharacter />}
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
        "-mt-[var(--header-h)] bg-band pt-[calc(var(--header-h)+clamp(64px,calc(3.14vw+52px),112px))]",
        children ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]" : "pb-[clamp(104px,calc(7.07vw+77.6px),196px)]",
      )}
    >
      <GiantHeading
        as="h1"
        label={section.label}
        labelStyle="pill"
        heading={section.heading}
        accent={section.accent}
        text={section.text}
        // Full screen: the heading fills the first screen, centred above the floating bar.
        className={full ? "min-h-[calc(100svh-var(--header-h)-clamp(64px,calc(3.14vw+52px),112px))] justify-center pb-[clamp(96px,12vh,160px)]" : undefined}
      >
        {section.button?.href && section.button.label && (
          <ButtonLink href={section.button.href} className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
            {section.button.label}
          </ButtonLink>
        )}
      </GiantHeading>
      {children && <div className="mt-[clamp(48px,calc(2.88vw+37.2px),92px)]">{children}</div>}
    </div>
  );
}
