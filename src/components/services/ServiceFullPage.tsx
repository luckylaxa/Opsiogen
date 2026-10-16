import Link from "next/link";
import type { Faq, Offering, ProcessSection, ProjectCard, Service, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AccentText, MaskReveal } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Media } from "@/components/ui/Media";
import { DS_ICONS, type DsIconName } from "@/components/ui/ds-icons";
import { ArrowUpRight } from "@/components/ui/Icons";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";

type Props = {
  service: Service;
  settings: SiteSettings;
  work: ProjectCard[];
  /** How we work from the Services page, used when the service has no process of its own. */
  process: ProcessSection | null;
};

const contactHref = (slug: string) => `/contact?service=${encodeURIComponent(slug)}`;

/** Small uppercase label above a heading, from the design system. */
function Eyebrow({ children, onDark, className }: { children: React.ReactNode; onDark?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "text-[length:clamp(11px,calc(0.13vw+10.5px),13px)] font-medium uppercase tracking-[0.18em]",
        onDark ? "text-white/55" : "text-mute",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Section heading with one word in the brand gradient. */
function Title({
  label,
  heading,
  accent,
  center,
  onDark,
  as: Tag = "h2",
  className,
}: {
  label?: string | null;
  heading: string;
  accent?: string | null;
  center?: boolean;
  onDark?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn(center && "flex flex-col items-center text-center", className)}>
      {label && (
        <Eyebrow onDark={onDark} className="mb-[clamp(14px,1.1vw,22px)]">
          {label}
        </Eyebrow>
      )}
      <Tag className={cn("text-h2 font-medium text-balance", center ? "max-w-[22ch]" : "max-w-[18ch]")}>
        <MaskReveal>
          <AccentText text={heading} accent={accent} />
        </MaskReveal>
      </Tag>
    </div>
  );
}

/** Paragraphs separated by a blank line. */
function Paragraphs({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={cn("text-base text-ink-2 text-pretty", i > 0 && "mt-4", className)}>
            {p}
          </p>
        ))}
    </>
  );
}

function DsIcon({ name, className }: { name?: string | null; className?: string }) {
  const body = DS_ICONS[(name as DsIconName) ?? "globe"] ?? DS_ICONS.globe;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}

/**
 * A service page laid out like the reference's service pages, in the design
 * system: hero with an image and a strip of what we do, the clients, why it
 * matters, numbers, a feature, what we do as image tiles, then a dark run of
 * uses, process, banner and recent work, the questions and the call to action.
 */
export function ServiceFullPage({ service, settings, work, process }: Props) {
  const hero = service.hero!;
  const clients = [...new Set(work.map((p) => p.client || p.name))];
  const tiles = service.offerings.filter((o) => o.image?.url);
  const steps = service.steps?.items?.length
    ? service.steps
    : process
      ? { label: process.label, heading: process.heading, accent: process.accent, text: null, items: process.steps }
      : null;
  const related = work.slice(0, 3);
  const cta = settings.headerButton.label;

  return (
    <>
      {/* 1. Hero: text and image, with a strip of what we do */}
      <section data-band className="-mt-[var(--header-h)] overflow-hidden bg-band pt-[calc(var(--header-h)+clamp(32px,calc(2.6vw+22px),72px))]">
        <div className="grid items-center gap-y-10 px-gutter lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-gap">
          <div>
            <Eyebrow>{service.name}</Eyebrow>
            <h1 className="mt-[clamp(16px,1.3vw,26px)] max-w-[15ch] text-[length:clamp(40px,calc(2.6vw+30px),84px)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
              <MaskReveal>
                <AccentText text={hero.heading} accent={hero.accent} />
              </MaskReveal>
            </h1>
            {hero.text && <p className="mt-[clamp(18px,1.4vw,28px)] max-w-[46ch] text-lead text-ink-2 text-pretty">{hero.text}</p>}
            <div className="mt-[clamp(24px,1.9vw,40px)] flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink href={contactHref(service.slug)}>{cta}</ButtonLink>
              {service.note && <p className="text-small text-mute">{service.note}</p>}
            </div>
          </div>
          {hero.image?.url && (
            <div className="-mr-[var(--spacing-gutter)] lg:-ml-[4%]">
              <Media image={hero.image} fill={false} priority sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
          )}
        </div>
        {tiles.length > 0 && <OfferStrip tiles={tiles} />}
      </section>

      {/* 2. Clients */}
      {clients.length > 1 && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <Eyebrow>{service.clientsLabel || "Clients"}</Eyebrow>
            <ul className="mt-[clamp(18px,1.6vw,32px)] flex max-w-[70ch] flex-wrap justify-center gap-x-[clamp(22px,2.6vw,52px)] gap-y-3">
              {clients.map((c) => (
                <li key={c} className="text-[length:clamp(20px,calc(0.7vw+17px),32px)] font-semibold tracking-[-0.02em] text-ink-2">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 3. Why it matters */}
      {service.why?.heading && (
        <Block>
          <div className="grid items-center gap-y-10 px-gutter lg:grid-cols-2 lg:gap-x-[clamp(40px,5vw,110px)]">
            <div>
              <Title label={service.why.label} heading={service.why.heading} accent={service.why.accent} />
              {(service.why.lead || service.statement) && (
                <p className="mt-[clamp(20px,1.6vw,32px)] max-w-[40ch] text-lead text-pretty">{service.why.lead || service.statement}</p>
              )}
              <div className="mt-5 max-w-[56ch]">
                <Paragraphs text={service.why.text} />
              </div>
            </div>
            {service.why.image?.url && (
              <div data-reveal className="relative aspect-[12/11] overflow-hidden rounded-card bg-band">
                <Media image={service.why.image} sizes="(min-width: 1024px) 46vw, 100vw" />
              </div>
            )}
          </div>
        </Block>
      )}

      {/* 4. Numbers */}
      {service.stats?.heading && service.stats.items.length > 0 && (
        <Block>
          <div className="px-gutter">
            <Title center label={service.stats.label} heading={service.stats.heading} accent={service.stats.accent} />
            <ul className="mt-[clamp(36px,3.4vw,72px)] grid gap-gap md:grid-cols-3">
              {service.stats.items.map((s) => (
                <li key={s._key ?? s.value} data-reveal className="flex items-end gap-5 border-b border-line pb-[clamp(18px,1.6vw,30px)]">
                  <span className="shrink-0 text-[length:clamp(52px,calc(3.4vw+38px),112px)] leading-[0.9] font-semibold tracking-[-0.045em] tabular-nums">
                    {s.value}
                  </span>
                  <span className="max-w-[18ch] pb-[0.35em] text-small text-ink-2">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 5. Feature: image, then the story and a button */}
      {service.feature?.heading && (
        <Block>
          <div className="grid items-center gap-y-10 px-gutter lg:grid-cols-2 lg:gap-x-[clamp(40px,5vw,110px)]">
            {service.feature.image?.url && (
              <div data-reveal className="relative aspect-square overflow-hidden rounded-card bg-night">
                <Media image={service.feature.image} sizes="(min-width: 1024px) 46vw, 100vw" />
              </div>
            )}
            <div>
              {service.feature.label && (
                <div className="mb-[clamp(18px,1.4vw,28px)] border-b border-line pb-3">
                  <Eyebrow>{service.feature.label}</Eyebrow>
                </div>
              )}
              <Title heading={service.feature.heading} accent={service.feature.accent} />
              {service.feature.lead && <p className="mt-[clamp(20px,1.6vw,32px)] max-w-[42ch] text-lead text-pretty">{service.feature.lead}</p>}
              <div className="mt-5 max-w-[56ch]">
                <Paragraphs text={service.feature.text} />
              </div>
              <ButtonLink href={contactHref(service.slug)} className="mt-[clamp(24px,1.9vw,40px)]">
                {cta}
              </ButtonLink>
            </div>
          </div>
        </Block>
      )}

      {/* 6. What we do, as image tiles */}
      {tiles.length > 0 && (
        <Block>
          <div className="px-gutter">
            {service.offer?.heading && (
              <div className="mb-[clamp(36px,3.4vw,72px)] flex flex-col items-center text-center">
                <Title center label={service.offer.label} heading={service.offer.heading} accent={service.offer.accent} />
                {service.offer.text && <p className="mt-5 max-w-[56ch] text-base text-ink-2 text-pretty">{service.offer.text}</p>}
              </div>
            )}
            <OfferTiles tiles={tiles} />
          </div>
        </Block>
      )}

      {/* 7–10. The dark run: uses, process, banner and recent work */}
      {(service.uses?.heading || steps || service.banner?.heading || related.length > 0) && (
        <section className="on-dark mt-section bg-coal py-section text-white">
          {service.uses?.heading && service.uses.items.length > 0 && (
            <div className="px-gutter">
              <Title center onDark label={service.uses.label} heading={service.uses.heading} accent={service.uses.accent} />
              <ul className="mt-[clamp(40px,3.8vw,80px)] grid gap-x-gap gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {service.uses.items.map((u) => (
                  <li key={u._key ?? u.title} data-reveal>
                    <span className="grid size-[clamp(40px,2.6vw,48px)] place-items-center rounded-btn border border-white/15 bg-white/[0.04]">
                      <DsIcon name={u.icon} className="size-[clamp(18px,1.2vw,22px)]" />
                    </span>
                    <h3 className="mt-[clamp(18px,1.4vw,28px)] text-title font-medium">{u.title}</h3>
                    {u.text && <p className="mt-2 max-w-[30ch] text-base text-white/65">{u.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {steps && steps.items.length > 0 && (
            <div className={cn("grid gap-y-12 px-gutter lg:grid-cols-2 lg:gap-x-[clamp(40px,5vw,110px)]", service.uses?.heading && "mt-section")}>
              <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
                <Title onDark label={steps.label} heading={steps.heading} accent={steps.accent} />
                {steps.text && <p className="mt-5 max-w-[44ch] text-base text-white/70">{steps.text}</p>}
                <ButtonLink href={contactHref(service.slug)} variant="light" className="mt-[clamp(24px,1.9vw,40px)]">
                  {cta}
                </ButtonLink>
              </div>
              <ol className="relative">
                <span aria-hidden="true" className="absolute top-5 bottom-5 left-[19px] w-px bg-white/15" />
                {steps.items.map((s, i) => (
                  <li key={s._key ?? s.title} data-reveal className="relative flex gap-[clamp(18px,1.6vw,32px)] pb-[clamp(32px,2.6vw,56px)] last:pb-0">
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-coal text-small tabular-nums">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="text-title font-medium">{s.title}</h3>
                      {s.text && <p className="mt-2 max-w-[46ch] text-base text-white/65">{s.text}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {service.banner?.heading && (
            <div className="mt-section px-gutter">
              <div data-reveal className="relative isolate flex min-h-[clamp(360px,calc(14vw+300px),560px)] items-center overflow-hidden rounded-card bg-night">
                {service.banner.image?.url && <Media image={service.banner.image} sizes="100vw" className="-z-10" />}
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[rgba(10,9,13,0.84)] md:bg-[linear-gradient(90deg,rgba(10,9,13,0.95)_0%,rgba(10,9,13,0.86)_45%,rgba(10,9,13,0.2)_100%)]" />
                <div className="max-w-[640px] p-[clamp(28px,3.4vw,72px)]">
                  <h2 className="text-cta font-semibold text-balance">
                    <AccentText text={service.banner.heading} accent={service.banner.accent} />
                  </h2>
                  {service.banner.text && <p className="mt-4 max-w-[44ch] text-base text-white/75">{service.banner.text}</p>}
                  <ButtonLink href={contactHref(service.slug)} variant="light" className="mt-[clamp(24px,1.9vw,40px)]">
                    {cta}
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-section px-gutter">
              <div className="mb-[clamp(32px,3vw,64px)] flex flex-wrap items-end justify-between gap-6">
                <Title
                  onDark
                  label={service.related?.label || "Our work"}
                  heading={service.related?.heading || "Recent work"}
                  accent={service.related?.accent}
                />
                <Link href="/work" className="link-underline inline-flex items-center gap-2 text-base">
                  View all work
                  <ArrowUpRight className="size-[1.1em]" />
                </Link>
              </div>
              <ul className="grid gap-x-gap gap-y-10 md:grid-cols-3">
                {related.map((p) => (
                  <li key={p._id} data-reveal>
                    <Link href={`/work/${p.slug}`} data-cursor="view" className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-night">
                        <Media
                          image={p.cover}
                          sizes="(min-width: 768px) 31vw, 100vw"
                          className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                        />
                      </div>
                      <p className="mt-4 text-small text-white/55">
                        {[p.industry, p.services.map((s) => s.shortName).join(" · ")].filter(Boolean).join(" · ")}
                      </p>
                      <h3 className="mt-2 text-title font-medium">{p.name}</h3>
                      {p.summary && <p className="mt-2 line-clamp-2 text-base text-white/65">{p.summary}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 11. Questions, in two columns */}
      {service.faqs.length > 0 && <Questions faqs={service.faqs} />}

      {/* 12. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}

/** The slow-moving strip of what we do along the foot of the hero. */
function OfferStrip({ tiles }: { tiles: Offering[] }) {
  const chips = (hidden: boolean) =>
    tiles.map((t) => (
      <li key={`${hidden ? "b" : "a"}-${t._key ?? t.title}`} aria-hidden={hidden || undefined} className="shrink-0 pr-3">
        <span className="flex items-center gap-3 rounded-btn border border-line bg-surface py-2 pr-5 pl-2">
          <span className="relative size-[clamp(40px,2.6vw,52px)] shrink-0 overflow-hidden rounded-[6px] bg-night">
            <Media image={t.image!} sizes="52px" className="object-bottom" />
          </span>
          <span className="text-base font-medium whitespace-nowrap">{t.title}</span>
        </span>
      </li>
    ));
  return (
    <div className="marquee mt-[clamp(40px,3.4vw,80px)] pb-[clamp(28px,2.4vw,48px)]">
      <ul className="marquee__track flex w-max">
        {chips(false)}
        {chips(true)}
      </ul>
    </div>
  );
}

/** What we do as image tiles: two narrow and one wide per row, the wide one switching sides. */
function OfferTiles({ tiles }: { tiles: Offering[] }) {
  return (
    <ul className="grid grid-flow-dense gap-gap sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => {
        const dark = Boolean(t.dark);
        return (
          <li
            key={t._key ?? t.title}
            data-reveal
            className={cn(
              "relative isolate aspect-[4/5] overflow-hidden rounded-card",
              t.wide ? "sm:col-span-2 sm:aspect-[1650/1300]" : "lg:aspect-[820/1300]",
              dark ? "on-dark bg-coal text-white" : "theme-light bg-band text-ink",
            )}
          >
            <Media
              image={t.image!}
              sizes={t.wide ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
              className={cn("-z-10", t.wide ? "object-[80%_100%] sm:object-bottom" : "object-bottom")}
            />
            <div className="p-[clamp(20px,1.7vw,34px)]">
              <h3 className="text-title font-semibold">{t.title}</h3>
              {t.text && <p className={cn("mt-2 max-w-[34ch] text-base", dark ? "text-white/70" : "text-ink-2")}>{t.text}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Questions({ faqs }: { faqs: Faq[] }) {
  const half = Math.ceil(faqs.length / 2);
  const cols = [faqs.slice(0, half), faqs.slice(half)].filter((c) => c.length);
  return (
    <Block>
      <div className="px-gutter">
        <Title center heading="Frequently asked questions" accent="questions" />
        <div className="mt-[clamp(36px,3.4vw,72px)] grid gap-x-[clamp(24px,3vw,64px)] md:grid-cols-2">
          {cols.map((col, c) => (
            <Accordion
              key={c}
              name="questions"
              numbered={false}
              openFirst={false}
              className={cn(c > 0 && "-mt-px md:mt-0")}
              items={col.map((f, i) => ({ key: f._key ?? `${c}-${i}`, title: f.question, content: f.answer }))}
            />
          ))}
        </div>
      </div>
    </Block>
  );
}
