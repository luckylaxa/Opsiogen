import type { Section } from "@/lib/types";
import { getSettings } from "@/lib/data";
import { Hero } from "./Hero";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectGrid } from "./ProjectGrid";
import { ServicesList } from "./ServicesList";
import { PromiseList, ShortText } from "./TextSections";
import { CallToAction } from "./CallToAction";

/** Spacing wrapper between page sections. */
export function Block({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mt-section first:mt-0 [[data-band]+&]:mt-after-band ${className}`}>{children}</section>;
}

/**
 * Renders a page's CMS sections in order. A hero followed directly by a
 * featured project share one grey band, as in the reference.
 * `after` renders right after the first hero (used for the contact form).
 */
export async function SectionRenderer({ sections, after }: { sections: Section[]; after?: React.ReactNode }) {
  const settings = await getSettings();
  const out: React.ReactNode[] = [];
  let afterPlaced = false;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const next = sections[i + 1];
    switch (section._type) {
      case "hero": {
        if (next?._type === "featuredProject") {
          out.push(
            <section key={section._key} data-band>
              <Hero section={section}>
                <FeaturedProject project={next.project} />
              </Hero>
            </section>,
          );
          i++;
        } else {
          out.push(
            <section key={section._key} data-band>
              <Hero section={section} />
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
            <ShortText section={section} />
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
