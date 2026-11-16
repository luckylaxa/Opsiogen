import type { HeroSection, Img } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

/** A picture for the first hero: the wide image, and a tall crop for phones. */
export type HeroImage = { image: Img; phone?: Omit<Img, "alt" | "hotspot"> };

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
    return (
      <div
        className={cn(
          "-mt-[var(--header-h)] bg-band pt-[var(--header-h)]",
          children ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]" : "pb-[clamp(16px,2vw,32px)]",
        )}
      >
        <div className="px-gutter">
          {/* The card ends above the phone's floating bar, and above the fold's edge on larger screens. */}
          <div className="on-dark relative h-[calc(100svh-var(--header-h)-104px)] min-h-[440px] overflow-hidden rounded-card bg-night text-white md:h-[calc(100svh-var(--header-h)-clamp(16px,2vw,32px))] md:min-h-[520px]">
            <Media image={image.image} phone={image.phone} sizes="100vw" priority />
            {/* The words sit in the picture's open sky, the button over the water, so the building stays clear. */}
            <div className="absolute inset-x-0 top-0 p-[clamp(20px,calc(2.6vw+10px),56px)]">
              {section.label && (
                <p className="mb-[clamp(14px,1.4vw,24px)] w-fit rounded-[4px] border border-white/35 px-[0.6em] py-[0.15em] text-base text-white">
                  {section.label}
                </p>
              )}
              <h1 className="max-w-[13ch] text-[length:clamp(32px,calc(3.3vw+19px),78px)] leading-[0.98] font-bold tracking-[-0.02em] text-balance uppercase md:max-w-[19ch]">
                {section.heading}
              </h1>
              {section.text && <p className="mt-4 max-w-[38ch] text-lead text-white/85">{section.text}</p>}
            </div>
            {section.button?.href && section.button.label && (
              <ButtonLink
                href={section.button.href}
                variant="light"
                className="absolute bottom-[clamp(20px,calc(2.6vw+10px),56px)] left-[clamp(20px,calc(2.6vw+10px),56px)]"
              >
                {section.button.label}
              </ButtonLink>
            )}
          </div>
        </div>
        {children && <div className="mt-[clamp(48px,calc(2.88vw+37.2px),92px)]">{children}</div>}
      </div>
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
