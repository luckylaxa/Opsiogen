import type { HeroSection } from "@/lib/types";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Hero band from the reference: grey band that runs up under the header, a
 * small pill label, a giant uppercase heading and a button or line of text.
 * When followed by a featured project, the band continues behind its card.
 */
export function Hero({ section, children }: { section: HeroSection; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "-mt-[var(--header-h)] bg-band pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]",
        children ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]" : "pb-[clamp(72px,calc(5.24vw+52.3px),132px)]",
      )}
    >
      <GiantHeading as="h1" label={section.label} labelStyle="pill" heading={section.heading} text={section.text}>
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
