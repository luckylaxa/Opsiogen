import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProcess, getProjects, getService, getServices, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { GROUP_LABELS } from "@/lib/utils";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { Process } from "@/components/sections/Process";
import { WorkGrid } from "@/components/work/WorkGrid";

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

/** Section title for the left column of a 4/8 split, or above a full-width block. */
function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-h2 font-medium text-balance ${className}`}>{children}</h2>;
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, projects, settings, process] = await Promise.all([
    getService(slug),
    getProjects(),
    getSettings(),
    getProcess(),
  ]);
  if (!service) notFound();
  const work = projects.filter((p) => p.services.some((s) => s.slug === service.slug));
  const offerings = service.offerings.length
    ? service.offerings
    : service.included.map((title) => ({ _key: title, title, text: null }));

  return (
    <>
      {/* 1. Hero */}
      <section data-band className="-mt-[var(--header-h)] bg-band pb-[clamp(72px,calc(5.24vw+52.3px),132px)] pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]">
        <GiantHeading as="h1" label={GROUP_LABELS[service.group]} labelStyle="pill" heading={service.name} text={service.tagline}>
          <p className="mt-[clamp(20px,calc(1.3vw+15px),40px)] max-w-[60ch] text-base text-ink-2 text-pretty">{service.description}</p>
          <ButtonLink
            href={`/contact?service=${encodeURIComponent(service.slug)}`}
            className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]"
          >
            {settings.headerButton.label}
          </ButtonLink>
          {service.note && <p className="mt-5 text-small text-mute">{service.note}</p>}
        </GiantHeading>
      </section>

      {/* 2. What we do: numbered offerings between hairlines */}
      {offerings.length > 0 && (
        <Block>
          <div className="grid gap-y-[clamp(32px,2.6vw,56px)] px-gutter lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-gap">
            <SectionTitle>What we do</SectionTitle>
            <ol className="grid gap-x-gap gap-y-[clamp(28px,2.4vw,52px)] sm:grid-cols-2">
              {offerings.map((o, i) => (
                <li key={o._key ?? o.title} data-reveal className="border-t border-ink pt-[clamp(14px,1vw,20px)]">
                  <span className="text-small text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-[clamp(14px,1.6vw,30px)] text-[length:clamp(22px,calc(0.84vw+18.8px),34px)] leading-[1.15] font-medium tracking-[-0.015em] text-balance">
                    {o.title}
                  </h3>
                  {o.text && <p className="mt-[clamp(8px,0.6vw,12px)] max-w-[36ch] text-base text-ink-2 text-pretty">{o.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </Block>
      )}

      {/* 3. Work for this service (hidden until there is some) */}
      {work.length > 0 && (
        <Block>
          <SectionTitle className="mb-[clamp(32px,calc(2.6vw+22px),80px)] px-gutter">Work</SectionTitle>
          <WorkGrid projects={work} pageSize={work.length} headingLevel="h3" />
        </Block>
      )}

      {/* 4. How we work: the steps from the Services page */}
      {process && (
        <Block>
          <Process section={process} />
        </Block>
      )}

      {/* 5. Questions */}
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

      {/* 6. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
