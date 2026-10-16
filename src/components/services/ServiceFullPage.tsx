import type { ProcessSection, ProjectCard, Service, SiteSettings } from "@/lib/types";
import { GROUP_LABELS } from "@/lib/utils";
import { AccentText, GiantHeading, Label, MaskReveal } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { BigCard } from "@/components/ui/BigCard";
import { Media } from "@/components/ui/Media";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { Process } from "@/components/sections/Process";
import { WorkGrid } from "@/components/work/WorkGrid";

type Props = {
  service: Service;
  settings: SiteSettings;
  work: ProjectCard[];
  /** How we work from the Services page, used when the service has no process of its own. */
  process: ProcessSection | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Services with a hero image use the full page. */
export const hasFullPage = (service: Service) => Boolean(service.hero?.image?.url);

/**
 * The full service page, in the site's own style: giant headings, big dark
 * cards and very little text. Hero with the service image in the dark frame,
 * clients, one big statement, numbers, what we do and the work as big cards,
 * how we work, questions and the call to action.
 */
export function ServiceFullPage({ service, settings, work, process }: Props) {
  const clients = [...new Set(work.map((p) => p.client || p.name))];
  const cards = service.offerings;
  const steps: ProcessSection | null = service.steps?.items?.length
    ? {
        _type: "process",
        _key: "service",
        label: service.steps.label,
        heading: service.steps.heading || "How we work",
        accent: service.steps.accent,
        steps: service.steps.items.map((s, i) => ({ _key: s._key ?? String(i), title: s.title, text: s.text ?? "" })),
      }
    : process;
  const contact = `/contact?service=${encodeURIComponent(service.slug)}`;
  const showWork = work.slice(0, 4);

  return (
    <>
      {/* 1. Hero: giant title, one line, a button, then the image in the dark frame */}
      <section data-band className="-mt-[var(--header-h)] bg-band pb-[clamp(40px,calc(2.3vw+31.4px),76px)] pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]">
        <GiantHeading as="h1" label={GROUP_LABELS[service.group]} labelStyle="pill" heading={service.name} text={service.tagline}>
          <ButtonLink href={contact} className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
            {settings.headerButton.label}
          </ButtonLink>
          {service.note && <p className="mt-5 text-small text-mute">{service.note}</p>}
        </GiantHeading>
        {service.hero?.image?.url && (
          <div className="mx-edge mt-[clamp(48px,calc(2.88vw+37.2px),92px)] overflow-hidden rounded-card bg-night px-[clamp(12px,7.5%,142px)] pt-[clamp(24px,5%,96px)] pb-[clamp(12px,2%,40px)]">
            <Media image={service.hero.image} fill={false} priority sizes="(min-width: 640px) 85vw, 100vw" className="mx-auto max-w-[1300px]" />
          </div>
        )}
      </section>

      {/* 2. Clients */}
      {clients.length > 1 && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <Label className="text-mute">{service.clientsLabel || "Clients"}</Label>
            <ul className="mt-[clamp(16px,1.4vw,28px)] flex max-w-[64ch] flex-wrap justify-center gap-x-[clamp(20px,2.4vw,48px)] gap-y-2">
              {clients.map((c) => (
                <li key={c} className="text-[length:clamp(22px,calc(0.9vw+18.6px),36px)] font-semibold tracking-[-0.02em] text-ink-2">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 3. One big statement */}
      {service.why?.heading && (
        <Block>
          <div className="px-gutter">
            {service.why.label && <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">{service.why.label}</Label>}
            <p className="max-w-[20ch] text-[length:clamp(34px,calc(2.6vw+24px),88px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              <MaskReveal>
                <AccentText text={service.why.heading} accent={service.why.accent} />
              </MaskReveal>
            </p>
          </div>
        </Block>
      )}

      {/* 4. Numbers, one per big card */}
      {service.stats?.items?.length ? (
        <Block>
          <div className="px-gutter">
            {service.stats.label && <Label className="mb-[clamp(20px,calc(1.3vw+15px),40px)]">{service.stats.label}</Label>}
            <ul className="grid gap-gap md:grid-cols-3">
              {service.stats.items.map((s) => (
                <li
                  key={s._key ?? s.value}
                  data-reveal
                  className="on-dark flex min-h-[clamp(240px,calc(9vw+200px),400px)] flex-col justify-end rounded-card bg-coal p-[clamp(24px,calc(1.9vw+17px),58px)] text-white"
                >
                  <span className="text-[length:clamp(64px,calc(4vw+48px),140px)] leading-[0.9] font-bold tracking-[-0.045em] tabular-nums">
                    {s.value}
                  </span>
                  <span className="mt-[clamp(12px,1vw,20px)] text-base text-white/70">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Block>
      ) : null}

      {/* 5. What we do, as big cards */}
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
                  image={o.image}
                  dots={cards.length}
                  activeDot={i}
                  label={service.shortName}
                  title={o.title}
                  footLeft={o.text}
                  imageSizes="(min-width: 1024px) 22vw, 56vw"
                />
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* 6. Work, as big cards */}
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

      {/* 7. How we work */}
      {steps && (
        <Block>
          <Process section={steps} />
        </Block>
      )}

      {/* 8. Questions */}
      {service.faqs.length > 0 && (
        <Block>
          <GiantHeading label="Questions" heading="Ask us anything." accent="anything" className="mb-[clamp(40px,calc(3.4vw+27px),100px)]" />
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

      {/* 9. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
