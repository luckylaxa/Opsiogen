import type { HeroSection } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Hero band from the reference: grey band that runs up under the header, a
 * small pill label, a giant uppercase heading and a button or line of text.
 * When followed by a featured project, the band continues behind its card.
 * `full` makes the heading fill the first screen (Home).
 */
export function Hero({ section, full, children }: { section: HeroSection; full?: boolean; children?: React.ReactNode }) {
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
