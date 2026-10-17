import Link from "next/link";
import type { ProcessSection, ProjectCard, Service, SiteSettings } from "@/lib/types";
import type { SampleAssets } from "@/content/service-sample";
import { cn } from "@/lib/utils";
import { AccentText, Label } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Media } from "@/components/ui/Media";
import { CodeIcon, LayersIcon, SparkIcon, TrendIcon } from "@/components/ui/Icons";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";

type Props = {
  service: Service;
  settings: SiteSettings;
  /** Projects tagged with this service. */
  work: ProjectCard[];
  /** Every client, for the scrolling names. */
  clients: string[];
  /** How we work from the Services page, used when the service has no steps of its own. */
  process: ProcessSection | null;
  assets: SampleAssets;
};

const pad = (n: number) => String(n).padStart(2, "0");
const sentences = (text: string) => text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text];
const ICONS = [TrendIcon, LayersIcon, CodeIcon, SparkIcon];

/** Section heading: a small label over a large line with one word in the brand gradient. */
function Heading({
  label,
  heading,
  accent,
  center,
  className,
  as: Tag = "h2",
}: {
  label?: string | null;
  heading: string;
  accent?: string | null;
  center?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(center && "mx-auto text-center", className)}>
      {label && <Label className="text-mute">{label}</Label>}
      <Tag
        className={cn(
          "mt-[clamp(12px,1vw,20px)] text-[length:clamp(34px,calc(2.2vw+24px),72px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance",
          center && "mx-auto max-w-[22ch]",
        )}
      >
        <AccentText text={heading} accent={accent} />
      </Tag>
    </div>
  );
}

/**
 * Sample service page in the reference's order, in the Opsiogen design
 * system and mostly open layouts rather than boxes: a dark hero banner with
 * the service picture and a strip of its services, scrolling client names,
 * why it matters, results from the case studies, the services as big cards
 * (text on top, picture behind), why teams choose us, how we work, a picture
 * banner, related work, questions in two columns and the call to action.
 * Every link goes straight where it says: no extra clicks.
 */
export function ServiceSamplePage({ service, settings, work, clients, process, assets }: Props) {
  const contact = `/contact?service=${encodeURIComponent(service.slug)}`;
  const intro = sentences(service.description);
  const offerings = service.offerings.map((o, i) => ({ ...o, picture: assets.cards[i] ?? o.image ?? null }));
  const steps = service.steps?.items?.length
    ? { label: service.steps.label, heading: service.steps.heading || "How we work", accent: service.steps.accent, items: service.steps.items }
    : process
      ? { label: process.label, heading: process.heading || "How we work", accent: process.accent, items: process.steps }
      : null;

  // Results from this service's case studies: one per project, a percentage or a multiple first.
  const metrics = work
    .map((p) => {
      const s = (p.stats ?? []).find((x) => /[%xX]$/.test(x.value)) ?? null;
      return s ? { value: s.value, label: s.label, project: p.name } : null;
    })
    .filter((m): m is { value: string; label: string; project: string } => Boolean(m))
    .slice(0, 3);
  const numbers = metrics.length
    ? metrics
    : (service.stats?.items ?? []).slice(0, 3).map((s) => ({ value: s.value, label: s.label, project: null }));

  const faqs = service.faqs.map((f, i) => ({ key: f._key ?? String(i), title: f.question, content: <p>{f.answer}</p> }));
  const half = Math.ceil(faqs.length / 2);
  const related = work.slice(0, 3);

  return (
    <>
      {/* 1. Hero banner under a see-through header (data-hero-dark turns the header light on dark):
             the photo at the top on phones and across the right half from desktop up, then the
             label, line, short intro and buttons; the services as a strip at the bottom. */}
      <section data-hero-dark className="on-dark relative -mt-[var(--header-h)] overflow-hidden bg-night text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_8%_100%,rgb(106_0_240/0.3),transparent_70%)]"
        />
        <div className="relative h-[clamp(400px,112vw,640px)] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[54%]">
          <Media image={assets.heroPhoto} priority sizes="(min-width: 1024px) 54vw, 100vw" className="object-[50%_40%]" />
          {/* Shades: under the header, into the text below (phones) or to the left (desktop) */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/60 to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-night to-transparent lg:hidden" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-night via-night/70 to-transparent lg:block" />
        </div>
        <div className="relative -mt-[clamp(48px,12vw,96px)] px-gutter lg:mt-0 lg:flex lg:min-h-[clamp(600px,50vw,860px)] lg:items-center lg:pt-[var(--header-h)]">
          <div className="lg:max-w-[48%]">
            <p className="text-small font-medium tracking-[0.16em] text-white/80 uppercase">{service.shortName}</p>
            <h1 className="mt-[clamp(14px,1.2vw,24px)] text-[length:clamp(40px,calc(3.1vw+26px),92px)] leading-[1.04] font-medium tracking-[-0.035em] text-balance">
              <AccentText text={service.tagline} />
            </h1>
            <p className="mt-[clamp(18px,1.4vw,28px)] max-w-[44ch] text-lead text-white/80 text-pretty">{intro[0]}</p>
            <div className="mt-[clamp(24px,2vw,40px)] grid gap-3 sm:flex sm:flex-wrap">
              <ButtonLink href={contact} variant="light" size="lg">
                {settings.headerButton.label}
              </ButtonLink>
              <ButtonLink href="#work" variant="outline-light" size="lg">
                See our work
              </ButtonLink>
            </div>
          </div>
        </div>
        {offerings.length > 0 && (
          <nav aria-label={`${service.shortName} services`} className="relative mt-[clamp(32px,3vw,64px)] pb-[clamp(24px,2.4vw,48px)]">
            <ul className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-gutter">
              {offerings.map((o, i) => (
                <li key={o._key ?? i} className="shrink-0 snap-start">
                  <a
                    href={`#offer-${i + 1}`}
                    className="flex items-center gap-3 rounded-[10px] border border-white/12 bg-white/[0.06] p-2 pr-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.12]"
                  >
                    {o.picture && (
                      <span className="relative size-[clamp(44px,3.4vw,60px)] shrink-0 overflow-hidden rounded-[6px] bg-black/40">
                        <Media image={o.picture} sizes="60px" />
                      </span>
                    )}
                    <span className="text-base font-medium whitespace-nowrap">{o.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>

      {/* 2. Client names, scrolling */}
      {clients.length > 2 && (
        <section className="pt-[clamp(48px,4.6vw,96px)]">
          <p className="px-gutter text-center text-small tracking-[0.14em] text-mute uppercase">
            Trusted by teams at {clients.length}+ companies
          </p>
          <div className="marquee mt-[clamp(20px,2vw,36px)] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="marquee-track flex w-max">
              {[0, 1].map((copy) =>
                clients.map((c) => (
                  <li
                    key={`${copy}-${c}`}
                    aria-hidden={copy === 1 || undefined}
                    className="px-[clamp(20px,2.4vw,48px)] text-[length:clamp(22px,calc(0.9vw+18.6px),36px)] font-semibold tracking-[-0.02em] whitespace-nowrap text-ink-2"
                  >
                    {c}
                  </li>
                )),
              )}
            </ul>
          </div>
        </section>
      )}

      {/* 3. Why it matters: text beside a picture */}
      {service.why?.heading && (
        <Block>
          <div className="grid items-center gap-[clamp(32px,4vw,96px)] px-gutter lg:grid-cols-2">
            <div>
              <Heading label={service.why.label} heading={service.why.heading} accent={service.why.accent} />
              {service.statement && <p className="mt-[clamp(20px,1.6vw,32px)] max-w-[44ch] text-lead text-pretty">{service.statement}</p>}
              {intro.length > 1 && <p className="mt-4 max-w-[52ch] text-base text-ink-2 text-pretty">{intro.slice(1).join(" ")}</p>}
            </div>
            <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-card bg-night">
              <Media image={assets.why} sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </div>
        </Block>
      )}

      {/* 4. Results, in one row between rules */}
      {numbers.length > 0 && (
        <Block>
          <div className="px-gutter">
            <Heading label="Results that matter" heading="Design that moves the numbers." accent="numbers" center />
            <dl className="mt-[clamp(32px,3vw,64px)] grid border-y border-line sm:grid-cols-3">
              {numbers.map((m, i) => (
                <div
                  key={`${m.value}-${i}`}
                  data-reveal
                  className={cn(
                    "flex items-start gap-5 py-[clamp(24px,2.4vw,48px)] sm:px-[clamp(16px,2vw,40px)]",
                    i > 0 && "border-t border-line sm:border-t-0 sm:border-l",
                  )}
                >
                  <dd className="text-[length:clamp(52px,calc(3.2vw+30px),112px)] leading-[0.9] font-bold tracking-[-0.045em] tabular-nums">
                    {m.value}
                  </dd>
                  <dt className="max-w-[18ch] pt-1 text-base text-ink-2">
                    {m.label}
                    {m.project && <span className="mt-1 block text-small text-mute">{m.project}</span>}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </Block>
      )}

      {/* 5. What we do: big cards, text on top, picture behind */}
      {offerings.length > 0 && (
        <Block>
          <div className="grid items-end gap-6 px-gutter lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Heading label={service.offer?.label || "What we do"} heading={service.offer?.heading || "What we do."} accent={service.offer?.accent} />
            <p className="max-w-[40ch] text-lead text-ink-2 text-pretty lg:justify-self-end">
              Pick one, or combine them. One team takes care of it all.
            </p>
          </div>
          <ul className="mt-[clamp(32px,3vw,64px)] grid gap-gap px-gutter md:grid-cols-2 lg:auto-rows-[clamp(300px,24vw,460px)] lg:grid-cols-3">
            {offerings.map((o, i) => {
              const wide = offerings.length === 6 && (i === 0 || i === 5);
              const tall = offerings.length === 6 && i === 1;
              return (
                <li
                  key={o._key ?? i}
                  id={`offer-${i + 1}`}
                  className={cn("scroll-mt-[calc(var(--header-h)+16px)]", wide && "lg:col-span-2", tall && "lg:row-span-2")}
                >
                  <article
                    data-reveal
                    className="on-dark group relative aspect-[4/5] h-full overflow-hidden rounded-card bg-night text-white md:aspect-square lg:aspect-auto"
                  >
                    {o.picture && (
                      <Media
                        image={o.picture}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className={cn(
                          "transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]",
                          wide && assets.wide[i] && "lg:hidden",
                        )}
                      />
                    )}
                    {wide && assets.wide[i] && (
                      <Media
                        image={assets.wide[i]}
                        sizes="66vw"
                        className="hidden transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04] lg:block"
                      />
                    )}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-transparent" />
                    <div className="relative p-[clamp(20px,2.2vw,44px)]">
                      <h3 className="text-[length:clamp(22px,calc(0.9vw+18px),36px)] leading-[1.1] font-semibold tracking-[-0.02em]">{o.title}</h3>
                      {o.text && <p className="mt-2 max-w-[36ch] text-base text-white/80">{o.text}</p>}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Block>
      )}

      {/* 6. Why teams choose us: a dark band, four points */}
      {service.benefits.length > 0 && (
        <section className="on-dark relative mt-section overflow-hidden bg-night py-section text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(106_0_240/0.28),transparent_70%)]"
          />
          <div className="relative px-gutter">
            <Heading label="Built for you" heading="Why teams choose Opsiogen." accent="Opsiogen" center />
            <ul className="mt-[clamp(40px,4vw,80px)] grid gap-x-gap gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((b, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li key={b._key ?? b.title} data-reveal className="border-t border-white/15 pt-[clamp(20px,1.6vw,32px)]">
                    <span className="grid size-[clamp(44px,3vw,56px)] place-items-center rounded-[8px] border border-white/15 bg-white/[0.06]">
                      <Icon className="size-[46%]" />
                    </span>
                    <h3 className="mt-[clamp(20px,1.6vw,32px)] text-[length:clamp(20px,calc(0.5vw+18px),28px)] font-semibold tracking-[-0.015em]">
                      {b.title}
                    </h3>
                    {b.text && <p className="mt-2 max-w-[34ch] text-base text-white/70">{b.text}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 7. How we work: the intro stays put while the steps run down a line */}
      {steps && steps.items.length > 0 && (
        <Block>
          <div className="grid gap-[clamp(40px,4vw,96px)] px-gutter lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="self-start lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <Heading label={steps.label || "How we work"} heading={steps.heading} accent={steps.accent} />
              <p className="mt-[clamp(20px,1.6vw,32px)] max-w-[40ch] text-lead text-ink-2">
                One team from the first call to launch, with a clear plan at every step.
              </p>
              <ButtonLink href={contact} className="mt-[clamp(24px,2vw,40px)]">
                {settings.headerButton.label}
              </ButtonLink>
            </div>
            <ol>
              {steps.items.map((s, i) => (
                <li key={s._key ?? i} data-reveal className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-[clamp(16px,1.6vw,32px)] pb-[clamp(28px,2.6vw,48px)] last:pb-0">
                  {i < steps.items.length - 1 && (
                    <span aria-hidden="true" className="absolute top-[clamp(40px,2.6vw,52px)] bottom-0 left-[calc(clamp(40px,2.6vw,52px)/2)] w-px bg-line" />
                  )}
                  <span className="relative grid size-[clamp(40px,2.6vw,52px)] place-items-center rounded-full border border-line bg-page text-small font-semibold tabular-nums">
                    {pad(i + 1)}
                  </span>
                  <div className="pt-[clamp(6px,0.5vw,12px)]">
                    <h3 className="text-[length:clamp(20px,calc(0.5vw+18px),28px)] font-semibold tracking-[-0.015em]">{s.title}</h3>
                    {s.text && <p className="mt-2 max-w-[52ch] text-base text-ink-2">{s.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Block>
      )}

      {/* 8. Picture banner with one line and a button */}
      <Block>
        <div className="px-gutter">
          {/* Phones: the picture, then the text. From desktop up: the text over the picture's quiet left side. */}
          <div className="on-dark relative flex flex-col overflow-hidden rounded-card bg-night text-white lg:min-h-[clamp(480px,42vw,680px)] lg:justify-center">
            <div className="relative aspect-[4/3] lg:absolute lg:inset-0 lg:aspect-auto">
              <Media image={assets.banner} sizes="100vw" className="object-[78%_50%] lg:object-center" />
              <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-black/70 via-black/20 to-transparent lg:block" />
            </div>
            <div className="relative max-w-[720px] p-[clamp(24px,3.4vw,72px)] pt-2 lg:pt-[clamp(24px,3.4vw,72px)]">
              <h2 className="text-[length:clamp(34px,calc(2.2vw+24px),72px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance">
                <AccentText text="Put this team behind your next launch." accent="launch" />
              </h2>
              <p className="mt-4 max-w-[40ch] text-lead text-white/80">Tell us what you’re building and we’ll plan it with you.</p>
              <ButtonLink href={contact} variant="light" className="mt-[clamp(24px,2vw,40px)]">
                {settings.headerButton.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Block>

      {/* 9. Related work: one click opens the case study */}
      {related.length > 0 && (
        <Block>
          <div id="work" className="scroll-mt-[calc(var(--header-h)+16px)] px-gutter">
            <Heading
              label={service.related?.label || "Selected work"}
              heading={service.related?.heading || "Our work."}
              accent={service.related?.accent}
              center
            />
            <ul className="mt-[clamp(32px,3vw,64px)] grid gap-x-gap gap-y-10 md:grid-cols-3">
              {related.map((p) => (
                <li key={p._id} data-reveal>
                  <Link href={`/work/${p.slug}`} scroll={false} data-cursor="view" className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-card bg-night">
                      <Media
                        image={p.cardImage ?? p.cover}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                      />
                    </span>
                    {p.industry && <span className="mt-4 block text-small text-mute">{p.industry}</span>}
                    <span className="mt-1 block text-[length:clamp(20px,calc(0.5vw+18px),28px)] font-semibold tracking-[-0.015em]">
                      <span className="grad-hover">{p.name}</span>
                    </span>
                    {p.summary && <span className="mt-2 line-clamp-2 block text-base text-ink-2">{p.summary}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-[clamp(32px,3vw,56px)] flex justify-center">
              <ButtonLink href="/work" variant="outline">
                See all work
              </ButtonLink>
            </div>
          </div>
        </Block>
      )}

      {/* 10. Questions in two columns */}
      {faqs.length > 0 && (
        <Block>
          <div className="px-gutter">
            <Heading heading="Frequently asked questions." accent="questions" center />
            <div className="mt-[clamp(32px,3vw,64px)] grid gap-x-[clamp(24px,3vw,64px)] lg:grid-cols-2">
              <Accordion items={faqs.slice(0, half)} name="service-faq" numbered={false} openFirst={false} className="border-b-0 lg:border-b" />
              <Accordion items={faqs.slice(half)} name="service-faq" numbered={false} openFirst={false} />
            </div>
          </div>
        </Block>
      )}

      {/* 11. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
