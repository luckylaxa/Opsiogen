import type { HeroSection } from "@/lib/types";
import { getProjects, getSettings } from "@/lib/data";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RevealText } from "@/components/motion/RevealText";
import { CoverStrip } from "@/components/work/CoverStrip";
import { cn } from "@/lib/utils";

/**
 * How a page opens. The layout is fixed per page in code, the words come from the CMS.
 * - band: grey band under the header with a giant uppercase title (Home, Work).
 * - plain: the same title on the page background (Services, service pages).
 * - showcase: centred title, a moving strip of project covers, then the text as a
 *   large statement under a turning badge (About).
 * - article: a centred uppercase title over a reading column (Privacy).
 */
export type HeroVariant = "band" | "plain" | "showcase" | "article";

export function Hero({
  section,
  variant = "band",
  toolbar,
  children,
}: {
  section: HeroSection;
  variant?: HeroVariant;
  toolbar?: React.ReactNode;
  children?: React.ReactNode;
}) {
  if (variant === "showcase") return <ShowcaseHero section={section} />;
  if (variant === "article") return <ArticleHero section={section} />;

  const band = variant === "band";
  return (
    <div
      className={cn(
        band && "-mt-[var(--header-h)] bg-band pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]",
        !band && "pt-[clamp(40px,calc(1.57vw+34px),64px)]",
        band && (children ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]" : "pb-[clamp(72px,calc(5.24vw+52.3px),132px)]"),
      )}
    >
      <GiantHeading as="h1" label={section.label} labelStyle="pill" heading={section.heading} text={section.text}>
        {section.button?.href && section.button.label && (
          <ButtonLink href={section.button.href} className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
            {section.button.label}
          </ButtonLink>
        )}
      </GiantHeading>
      {toolbar && <div className="mt-[clamp(28px,calc(1.6vw+22px),56px)] px-gutter">{toolbar}</div>}
      {children && <div className="mt-[clamp(48px,calc(2.88vw+37.2px),92px)]">{children}</div>}
    </div>
  );
}

async function ShowcaseHero({ section }: { section: HeroSection }) {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  return (
    <div className="pt-[clamp(32px,calc(1.6vw+26px),64px)]">
      <div className="flex flex-col items-center px-gutter text-center">
        {section.label && (
          <p className="mb-[clamp(18px,calc(1vw+14px),34px)] rounded-[4px] border border-ink/25 px-[0.6em] py-[0.15em] text-base">
            {section.label}
          </p>
        )}
        <h1 className="max-w-[17ch] text-display font-semibold text-balance">{section.heading}</h1>
        {section.button?.href && section.button.label && (
          <ButtonLink href={section.button.href} className="mt-[clamp(24px,calc(1.2vw+19px),44px)]">
            {section.button.label}
          </ButtonLink>
        )}
      </div>

      <div className="mt-[clamp(48px,calc(3.4vw+35px),112px)]">
        <CoverStrip projects={projects} />
      </div>

      {section.text && (
        <div className="mt-[clamp(80px,calc(6vw+58px),190px)] flex flex-col items-center px-gutter text-center">
          <Badge text={settings.footerLine} mark={`${settings.siteTitle.charAt(0)}.`} className="text-ink-2" />
          <RevealText
            text={section.text}
            className="mt-[clamp(32px,calc(2vw+24px),64px)] max-w-[34ch] text-statement text-balance"
          />
        </div>
      )}
    </div>
  );
}

function ArticleHero({ section }: { section: HeroSection }) {
  return (
    <div className="flex flex-col items-center px-gutter pt-[clamp(40px,calc(2.6vw+30px),96px)] text-center">
      {section.label && <p className="mb-[clamp(16px,calc(0.8vw+13px),28px)] text-small">{section.label}</p>}
      <h1 className="max-w-[22ch] text-[length:clamp(32px,calc(2.2vw+24px),68px)] leading-[1.05] font-semibold tracking-[-0.015em] uppercase text-balance">
        {section.heading}
      </h1>
      {section.text && <p className="mt-6 max-w-[46ch] text-lead text-ink-2">{section.text}</p>}
    </div>
  );
}
