import type { HeroSection, Img } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

/**
 * A picture for the first hero: the wide image and a tall crop for phones, plus the
 * words that belong to the picture (small label, faint wordmark, scroll hint, note, second button).
 */
export type HeroImage = {
  image: Img;
  phone?: Omit<Img, "alt" | "hotspot">;
  eyebrow?: string;
  wordmark?: string;
  scrollHint?: string;
  note?: string;
  secondButton?: { label: string; href: string };
  /** Dots down the right edge, one per stop of the tour. */
  stops?: number;
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
    return (
      <>
        {/* The picture fills the first screen and runs up under the clear header. */}
        <div className="on-dark relative -mt-[var(--header-h)] h-[100svh] min-h-[560px] overflow-hidden bg-night text-white">
          <Media image={image.image} phone={image.phone} sizes="100vw" priority />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
          {image.wordmark && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+2vh)] hidden text-center text-[length:15vw] leading-none font-bold tracking-[-0.02em] text-white/[0.13] uppercase select-none md:block"
            >
              {image.wordmark}
            </p>
          )}
          {/* Phones: the words sit in the sky. Larger screens: bottom left, over the water. */}
          <div
            className="absolute inset-x-0 top-[calc(var(--header-h)+12px)] p-[clamp(20px,calc(2.6vw+10px),48px)] md:top-auto md:right-auto md:bottom-0 md:max-w-[min(38vw,560px)]"
          >
            {label && <p className="mb-[clamp(12px,1.2vw,20px)] text-[13px] tracking-[0.2em] text-white/80 uppercase">{label}</p>}
            <h1 className="max-w-[13ch] text-[length:clamp(31px,calc(2.2vw+13px),52px)] leading-[1] font-bold tracking-[-0.02em] uppercase">
              {section.heading}
            </h1>
            {section.text && <p className="mt-4 max-w-[38ch] text-lead text-white/85">{section.text}</p>}
          </div>
          {image.scrollHint && (
            <p
              aria-hidden="true"
              className="absolute bottom-[112px] left-1/2 hidden -translate-x-1/2 text-center text-[11px] tracking-[0.24em] text-white/80 uppercase md:block"
            >
              {image.scrollHint}
              <span className="relative mx-auto mt-2.5 block h-[34px] w-[22px] rounded-[12px] border-[1.5px] border-white after:absolute after:top-[7px] after:left-1/2 after:h-[7px] after:w-[3px] after:-translate-x-1/2 after:rounded-[2px] after:bg-white" />
            </p>
          )}
          {/* Note and buttons: above the floating bar on phones, bottom right on larger screens. */}
          <div
            className="absolute inset-x-0 bottom-[92px] flex flex-col items-start gap-3 p-[clamp(20px,calc(2.6vw+10px),48px)] md:right-0 md:bottom-0 md:left-auto md:items-end"
          >
            {image.note && <p className="max-w-[30ch] text-[13px] leading-[1.35] text-white/75 md:text-right">{image.note}</p>}
            <div className="flex flex-wrap gap-3">
              {section.button?.href && section.button.label && (
                <ButtonLink href={section.button.href} variant="light">
                  {section.button.label}
                </ButtonLink>
              )}
              {image.secondButton && (
                <ButtonLink href={image.secondButton.href} variant="outline-light">
                  {image.secondButton.label}
                </ButtonLink>
              )}
            </div>
          </div>
          {image.stops && (
            <div aria-hidden="true" className="absolute top-1/2 right-[clamp(14px,1.6vw,30px)] hidden -translate-y-1/2 gap-3.5 md:grid">
              {Array.from({ length: image.stops }, (_, i) => (
                <span key={i} className={cn("block size-[7px] rounded-full", i === 0 ? "bg-white ring-4 ring-white/20" : "bg-white/35")} />
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
