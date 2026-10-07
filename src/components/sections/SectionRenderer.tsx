import type { Section } from "@/lib/types";
import { getSettings } from "@/lib/data";
import { Hero, type HeroVariant } from "./Hero";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectGrid } from "./ProjectGrid";
import { ServicesList } from "./ServicesList";
import { PromiseList, ShortText } from "./TextSections";
import { CallToAction } from "./CallToAction";

/** Spacing wrapper between page sections. */
export function Block({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mt-section first:mt-0 [[data-band]+&]:mt-after-band ${className}`}>{children}</section>;
}

export type PageLayout = {
  /** How the page's first hero looks (see Hero). */
  hero?: HeroVariant;
  /** Dark pill bar under the first hero's title. */
  toolbar?: React.ReactNode;
  /** Text sections read as an article column. */
  article?: boolean;
};

/**
 * Renders a page's CMS sections in order. A hero followed directly by a
 * featured project share one grey band, as in the reference.
 * `after` renders right after the first hero (used for the contact form).
 */
export async function SectionRenderer({
  sections,
  after,
  layout = {},
}: {
  sections: Section[];
  after?: React.ReactNode;
  layout?: PageLayout;
}) {
  const settings = await getSettings();
  const out: React.ReactNode[] = [];
  let afterPlaced = false;
  let heroSeen = false;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const next = sections[i + 1];
    switch (section._type) {
      case "hero": {
        const variant = heroSeen ? undefined : layout.hero;
        const toolbar = heroSeen ? undefined : layout.toolbar;
        heroSeen = true;
        if (next?._type === "featuredProject") {
          out.push(
            <section key={section._key} data-band>
              <Hero section={section} variant={variant} toolbar={toolbar}>
                <FeaturedProject project={next.project} />
              </Hero>
            </section>,
          );
          i++;
        } else {
          out.push(
            <section key={section._key} data-band>
              <Hero section={section} variant={variant} toolbar={toolbar} />
            </section>,
          );
        }
        if (after && !afterPlaced) {
          out.push(<div key="after">{after}</div>);
          afterPlaced = true;
        }
        break;
      }
      case "featuredProject":
        out.push(
          <Block key={section._key}>
            <FeaturedProject project={section.project} priority={false} />
          </Block>,
        );
        break;
      case "projectGrid":
        out.push(
          <Block key={section._key}>
            <ProjectGrid section={section} />
          </Block>,
        );
        break;
      case "servicesList":
        out.push(
          <Block key={section._key}>
            <ServicesList section={section} />
          </Block>,
        );
        break;
      case "shortText":
        out.push(
          <Block key={section._key}>
            <ShortText section={section} article={layout.article} />
          </Block>,
        );
        break;
      case "promiseList":
        out.push(
          <Block key={section._key}>
            <PromiseList section={section} />
          </Block>,
        );
        break;
      case "callToAction":
        out.push(
          <Block key={section._key}>
            <CallToAction cta={settings.cta} />
          </Block>,
        );
        break;
    }
  }

  if (after && !afterPlaced) out.unshift(<div key="after">{after}</div>);
  return <>{out}</>;
}
