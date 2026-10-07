import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjects, getService, getServices, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { GROUP_LABELS } from "@/lib/utils";
import { GiantHeading, Label } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
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

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, projects, settings] = await Promise.all([getService(slug), getProjects(), getSettings()]);
  if (!service) notFound();
  const work = projects.filter((p) => p.services.some((s) => s.slug === service.slug));

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

      {/* 2. What's included */}
      {service.included.length > 0 && (
        <Block>
          <div className="px-gutter">
            <Label className="mb-[clamp(20px,calc(1.3vw+15px),40px)]">What’s included</Label>
            <ul className="flex flex-wrap gap-[clamp(8px,0.52vw,10px)]">
              {service.included.map((item) => (
                <li
                  key={item}
                  className="rounded-[7px] border border-ink/20 px-[clamp(14px,calc(0.6vw+11.8px),23px)] py-[clamp(8px,calc(0.33vw+6.8px),13px)] text-row"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 3. Work for this service (hidden until there is some) */}
      {work.length > 0 && (
        <Block>
          <div className="mb-[clamp(32px,calc(2.6vw+22px),80px)] px-gutter">
            <Label>Work</Label>
          </div>
          <WorkGrid projects={work} pageSize={work.length} headingLevel="h2" />
        </Block>
      )}

      {/* 4. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
