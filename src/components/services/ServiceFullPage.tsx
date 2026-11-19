import type { ProcessSection, ProjectCard, Service, SiteSettings } from "@/lib/types";
import { GROUP_LABELS } from "@/lib/utils";
import { GiantHeading } from "@/components/ui/Headings";
import { HeroGlow } from "@/components/sections/HeroGlow";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { BigCard } from "@/components/ui/BigCard";
import { Media } from "@/components/ui/Media";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { WorkGrid } from "@/components/work/WorkGrid";
import { TILE_FOCUS, TILE_PHONES } from "@/content/tile-focus";

type Props = {
  service: Service;
  settings: SiteSettings;
  work: ProjectCard[];
  /** How we work from the Services page; not shown on the short page, kept for callers. */
  process?: ProcessSection | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The anchor with its across-the-width position replaced, where one is set for phones' tall cards. */
const focus = (h: { x: number; y: number }, x?: number) => (x === undefined ? h : { ...h, x });

/** Services with a hero image use the full page. */
/** Service pages whose What we do tiles were made in the plain style (see the service-tiles skill). */
const HIDE_WORK = new Set(["ai-video-production"]);
const PLAIN_TILES = new Set(["ai-product-design", "ai-mvps-business-apps", "ai-video-production", "ai-automation", "ai-social-media-marketing", "digital-marketing", "ai-creative-subscription", "ai-print-collateral", "ai-brand-services"]);

export const hasFullPage = (service: Service) => Boolean(service.hero?.image?.url);

/**
 * The full service page, kept short so the offer comes first: the banner, what
 * we do as big cards, the questions people have, the work and the call to
 * action. The clients, statement, numbers and steps stay in the CMS but are
 * not shown here.
 */
export function ServiceFullPage({ service, settings, work }: Props) {
  const cards = service.offerings;
  const plain = PLAIN_TILES.has(service.slug);
  const contact = `/contact?service=${encodeURIComponent(service.slug)}`;
  // Hidden for now on the video page, until we have our own films to show.
  const showWork = HIDE_WORK.has(service.slug) ? [] : work.slice(0, 4);

  return (
    <>
      {/* 1. Hero: giant title, one line, a button, then the service's thumbnail */}
      {/* On the page's own white or black, with the inner pages' light behind the heading, like Services and About
          (Lucky, 19 Nov: the service pages were missing it). */}
      <section data-band className="-mt-[var(--header-h)] bg-page pb-[clamp(40px,calc(2.3vw+31.4px),76px)] pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]">
        <div className="relative isolate">
          <HeroGlow short />
          <GiantHeading as="h1" label={GROUP_LABELS[service.group]} labelStyle="pill" heading={service.name} text={service.tagline}>
            <ButtonLink href={contact} className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
              Get a quote
            </ButtonLink>
            {service.note && <p className="mt-5 text-small text-mute">{service.note}</p>}
          </GiantHeading>
        </div>
        {service.card?.url ? (
          // The service's own thumbnail, as on the Services page: 4:3 on phones, wider from tablets up.
          <div className="relative mx-edge mt-[clamp(48px,calc(2.88vw+37.2px),92px)] aspect-[4/3] overflow-hidden rounded-card bg-night md:aspect-[2/1]">
            <Media
              image={
                service.pageImage?.url
                  ? { ...service.pageImage, hotspot: service.pageImage.hotspot ?? { x: 0.5, y: 0.5 } }
                  : { ...service.card, hotspot: service.card.hotspot ?? { x: 0.7, y: 0.72 } }
              }
              phone={service.pageImage?.url ? service.pageImagePhone : null}
              phoneBelow={768}
              priority
              sizes="100vw"
            />
          </div>
        ) : (
          service.hero?.image?.url && (
            <div className="mx-edge mt-[clamp(48px,calc(2.88vw+37.2px),92px)] overflow-hidden rounded-card bg-night px-[clamp(12px,7.5%,142px)] pt-[clamp(24px,5%,96px)] pb-[clamp(12px,2%,40px)]">
              <Media image={service.hero.image} fill={false} priority sizes="(min-width: 640px) 85vw, 100vw" className="mx-auto max-w-[1300px]" />
            </div>
          )
        )}
      </section>

      {/* 2. What we do, straight after the banner */}
      {cards.length > 0 && (
        <Block>
          <GiantHeading
            label={service.offer?.label || "What we do"}
            heading={service.offer?.heading || "What we do."}
            accent={service.offer?.accent}
            className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
          />
          <ul className="@container grid grid-cols-1 gap-gap px-gutter lg:grid-cols-2">
            {cards.map((o, i) => (
              <li key={o._key ?? o.title}>
                <BigCard
                  badge={pad(i + 1)}
                  layout="top"
                  // Pages remade in the plain style: one picture, no shade, crops anchored at the device
                  // (bottom right). Other pages keep the earlier card exactly as approved.
                  plain={plain}
                  image={o.image ? { ...o.image, hotspot: focus(o.image.hotspot ?? (plain ? { x: 1, y: 1 } : { x: 0.74, y: 0.8 }), TILE_FOCUS[`${service.slug}/${o.title}`]) } : o.image}
                  imagePhone={TILE_PHONES[`${service.slug}/${o.title}`] ? { url: TILE_PHONES[`${service.slug}/${o.title}`], width: 1074, height: 1380 } : null}
                  title={o.title}
                  footLeft={o.text}
                />
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* 3. The questions people have, answered straight after the offer */}
      {service.faqs.length > 0 && (
        <Block>
          <GiantHeading label="Questions" heading="Your questions, answered." accent="answered" className="mb-[clamp(40px,calc(3.4vw+27px),100px)]" />
          <div className="px-gutter">
            <Accordion
              name="questions"
              numbered={false}
              openFirst={false}
              items={service.faqs.map((f, i) => ({ key: f._key ?? String(i), title: f.question, content: f.answer }))}
            />
          </div>
        </Block>
      )}

      {/* 4. Work, as big cards */}
      {showWork.length > 0 && (
        <Block>
          <GiantHeading
            label={service.related?.label || "Selected work"}
            heading={service.related?.heading || "Work."}
            accent={service.related?.accent}
            className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
          />
          <WorkGrid projects={showWork} pageSize={showWork.length} headingLevel="h3" />
          {work.length > showWork.length && (
            <div className="mt-[clamp(40px,calc(2.6vw+30px),80px)] flex justify-center px-gutter">
              <ButtonLink href="/work" variant="outline">
                View all work
              </ButtonLink>
            </div>
          )}
        </Block>
      )}

      {/* 5. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} photo={1} />
      </Block>
    </>
  );
}
