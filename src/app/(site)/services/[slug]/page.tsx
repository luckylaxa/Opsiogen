import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getComparison, getProcess, getProjects, getService, getServices, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { cn, GROUP_LABELS } from "@/lib/utils";
import { GiantHeading, Label } from "@/components/ui/Headings";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { ArrowRight } from "@/components/ui/Icons";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { Comparison } from "@/components/sections/Comparison";
import { FeaturedProject } from "@/components/sections/FeaturedProject";
import { Process } from "@/components/sections/Process";
import { WorkGrid } from "@/components/work/WorkGrid";
import { ServiceFullPage } from "@/components/services/ServiceFullPage";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([getService(slug), getSettings()]);
  if (!service) return {};
  return buildMetadata({
    title: service.name,
    description: `${service.tagline} ${service.description}`,
    seo: service.seo,
    image: settings.seo.image,
    path: `/services/${service.slug}`,
  });
}

const pad = (n: number) => String(n).padStart(2, "0");

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-h2 font-medium text-balance", className)}>{children}</h2>;
}

/**
 * A service page, in the order of the reference's service pages: hero with
 * the lead project, the clients, why it matters, what we offer, the work,
 * how we work, how Opsiogen compares, questions, related services and the
 * call to action. Sections without content are left out.
 */
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, services, projects, settings, process, comparison] = await Promise.all([
    getService(slug),
    getServices(),
    getProjects(),
    getSettings(),
    getProcess(),
    getComparison(),
  ]);
  if (!service) notFound();

  const work = projects.filter((p) => p.services.some((s) => s.slug === service.slug));
  if (service.hero?.heading) {
    return <ServiceFullPage service={service} settings={settings} work={work} process={process} />;
  }
  const clients = [...new Set(work.map((p) => p.client || p.name))];
  const offerings = service.offerings.length
    ? service.offerings
    : service.included.map((title) => ({ _key: title, title, text: null }));
  const related = services.filter((s) => s.group === service.group && s.slug !== service.slug);

  return (
    <>
      {/* 1. Hero, with the lead project in the dark frame */}
      <section
        data-band
        className={cn(
          "-mt-[var(--header-h)] bg-band pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]",
          work.length ? "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]" : "pb-[clamp(72px,calc(5.24vw+52.3px),132px)]",
        )}
      >
        <GiantHeading as="h1" label={GROUP_LABELS[service.group]} labelStyle="pill" heading={service.name} text={service.tagline}>
          <p className="mt-[clamp(20px,calc(1.3vw+15px),40px)] max-w-[60ch] text-base text-ink-2 text-pretty">{service.description}</p>
          <div className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)] flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/contact?service=${encodeURIComponent(service.slug)}`}>{settings.headerButton.label}</ButtonLink>
            {work.length > 0 && (
              <Link href="#work" className={buttonClass("outline", "md")}>
                See the work
              </Link>
            )}
          </div>
          {service.note && <p className="mt-5 text-small text-mute">{service.note}</p>}
        </GiantHeading>
        {work[0] && (
          <div className="mt-[clamp(48px,calc(2.88vw+37.2px),92px)]">
            <FeaturedProject project={work[0]} />
          </div>
        )}
      </section>

      {/* 2. Clients for this service */}
      {clients.length > 1 && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <Label className="text-mute">Clients</Label>
            <ul className="mt-[clamp(16px,1.4vw,28px)] flex max-w-[60ch] flex-wrap justify-center gap-x-[clamp(20px,2.2vw,44px)] gap-y-2">
              {clients.map((c) => (
                <li key={c} className="text-[length:clamp(22px,calc(0.9vw+18.6px),36px)] font-semibold tracking-[-0.02em] text-ink-2">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 3. Why it matters, and the benefits */}
      {(service.statement || service.benefits.length > 0) && (
        <Block>
          <div className="px-gutter">
            {service.statement && (
              <div className="grid gap-y-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-gap">
                <SectionTitle>Why it matters</SectionTitle>
                <p className="max-w-[28ch] text-[length:clamp(26px,calc(1.3vw+21px),48px)] leading-[1.15] font-medium tracking-[-0.02em] text-balance">
                  {service.statement}
                </p>
              </div>
            )}
            {service.benefits.length > 0 && (
              <ul className={cn("grid gap-gap md:grid-cols-2 lg:grid-cols-4", service.statement && "mt-[clamp(40px,calc(2.6vw+30px),88px)]")}>
                {service.benefits.map((b, i) => (
                  <li
                    key={b._key ?? b.title}
                    data-reveal
                    className="on-dark flex min-h-[clamp(220px,calc(6vw+190px),320px)] flex-col rounded-card bg-coal p-[clamp(24px,calc(1.3vw+19px),44px)] text-white"
                  >
                    <span className="text-base text-white/55 tabular-nums">{pad(i + 1)}</span>
                    <h3 className="mt-auto pt-10 text-[length:clamp(24px,calc(0.84vw+20.8px),36px)] leading-[1.1] font-semibold tracking-[-0.015em] text-balance">
                      {b.title}
                    </h3>
                    {b.text && <p className="mt-3 text-base text-white/75 text-pretty">{b.text}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Block>
      )}

      {/* 4. What we do: one tile per offering */}
      {offerings.length > 0 && (
        <Block>
          <div className="px-gutter">
            <SectionTitle className="mb-[clamp(32px,calc(2.6vw+22px),80px)]">What we do</SectionTitle>
            <ol className="grid gap-gap sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((o, i) => (
                <li
                  key={o._key ?? o.title}
                  data-reveal
                  className="flex min-h-[clamp(200px,calc(5vw+180px),280px)] flex-col rounded-card border border-line bg-surface p-[clamp(24px,calc(1.3vw+19px),40px)]"
                >
                  <span className="text-small text-mute tabular-nums">{pad(i + 1)}</span>
                  <h3 className="mt-auto pt-8 text-[length:clamp(22px,calc(0.84vw+18.8px),32px)] leading-[1.15] font-medium tracking-[-0.015em] text-balance">
                    {o.title}
                  </h3>
                  {o.text && <p className="mt-3 text-base text-ink-2 text-pretty">{o.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </Block>
      )}

      {/* 5. Work for this service */}
      {work.length > 0 && (
        <Block>
          <div id="work" className="scroll-mt-8">
            <SectionTitle className="mb-[clamp(32px,calc(2.6vw+22px),80px)] px-gutter">Work</SectionTitle>
            <WorkGrid projects={work} pageSize={work.length} headingLevel="h3" />
          </div>
        </Block>
      )}

      {/* 6. How we work: the steps from the Services page */}
      {process && (
        <Block>
          <Process section={process} />
        </Block>
      )}

      {/* 7. How Opsiogen compares, from the Services page */}
      {comparison && (
        <Block>
          <Comparison section={comparison} />
        </Block>
      )}

      {/* 8. Questions */}
      {service.faqs.length > 0 && (
        <Block>
          <div className="grid gap-y-[clamp(28px,2.4vw,48px)] px-gutter lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-gap">
            <SectionTitle>Questions</SectionTitle>
            <Accordion
              name="questions"
              numbered={false}
              items={service.faqs.map((f, i) => ({ key: f._key ?? String(i), title: f.question, content: f.answer }))}
            />
          </div>
        </Block>
      )}

      {/* 9. More services in the same group */}
      {related.length > 0 && (
        <Block>
          <div className="px-gutter">
            <SectionTitle className="mb-[clamp(24px,calc(2vw+16px),60px)]">More from {GROUP_LABELS[service.group]}</SectionTitle>
            <ul>
              <li aria-hidden="true" className="rule-dotted" />
              {related.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 px-[clamp(0px,1.84vw,35px)] py-[clamp(20px,calc(1.24vw+15.4px),44px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto]"
                  >
                    <span className="text-row font-medium">{s.name}</span>
                    <span className="col-start-1 row-start-2 text-row text-ink-2 md:col-start-auto md:row-start-auto">{s.tagline}</span>
                    <ArrowRight className="col-start-2 row-span-2 row-start-1 size-6 transition-transform duration-300 group-hover:translate-x-1 md:col-start-auto md:row-span-1 md:row-start-auto" />
                  </Link>
                  <div className="rule-dotted" />
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 10. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
