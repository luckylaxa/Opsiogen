import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjects, getService, getServices, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { GROUP_LABELS } from "@/lib/utils";
import { GiantHeading, Label, SectionHeading } from "@/components/ui/Headings";
import { Toolbar } from "@/components/ui/Toolbar";
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
  const mark = `${settings.siteTitle.charAt(0)}.`;
  const start = { label: settings.headerButton.label, href: `/contact?service=${encodeURIComponent(service.slug)}` };
  const group = GROUP_LABELS[service.group];

  return (
    <>
      {/* 1. Hero: title, then the service card as in the reference's member sections */}
      <section data-band className="pt-[clamp(40px,calc(1.57vw+34px),64px)]">
        <GiantHeading as="h1" label={group} labelStyle="pill" heading={service.name} />
        <div className="mt-[clamp(28px,calc(1.6vw+22px),56px)] px-gutter">
          <Toolbar
            label="On this page"
            mark={mark}
            items={[
              { label: "Overview", href: "#overview" },
              ...(service.included.length ? [{ label: "What’s included", href: "#included" }] : []),
              ...(work.length ? [{ label: "Work", href: "#work" }] : []),
            ]}
            action={start}
          />
        </div>

        <div id="overview" className="mt-[clamp(48px,calc(2.88vw+37.2px),92px)] scroll-mt-6 px-gutter">
          <div className="on-dark relative grid overflow-hidden rounded-card bg-coal text-white md:grid-cols-2">
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-[42%] bg-[#2a2b2e] md:block" />
            <ServiceVisual mark={mark} group={group} name={service.shortName} />
            <div className="relative flex flex-col justify-center p-[clamp(28px,calc(2.6vw+18px),80px)] md:pl-[clamp(12px,2vw,40px)]">
              <p className="max-w-[18ch] text-cta font-semibold text-balance">{service.tagline}</p>
              <p className="mt-[clamp(18px,calc(0.9vw+14px),32px)] max-w-[52ch] text-base text-white/65 text-pretty">
                {service.description}
              </p>
              <ButtonLink href={start.href} variant="outline-light" className="mt-[clamp(28px,calc(1.4vw+22px),52px)] w-fit">
                {start.label}
              </ButtonLink>
            </div>
          </div>
          {service.note && (
            <div className="mt-[clamp(12px,calc(0.5vw+10px),20px)] flex flex-col gap-5 rounded-card bg-sand px-[clamp(20px,calc(1.6vw+14px),48px)] py-[clamp(20px,calc(1vw+16px),36px)] sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-ink">{service.note}</p>
              <ButtonLink href={start.href} className="w-fit shrink-0">
                {start.label}
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {/* 2. What's included, as the reference's feature grid */}
      {service.included.length > 0 && (
        <Block>
          <div id="included" className="grid scroll-mt-6 gap-y-[clamp(32px,2.6vw,56px)] gap-x-gap px-gutter lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <div>
              <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">What’s included</Label>
              <p className="max-w-[14ch] text-h2 font-medium text-balance">{service.name}</p>
            </div>
            <ul className="grid gap-x-gap gap-y-[clamp(28px,calc(1.6vw+22px),56px)] sm:grid-cols-2 xl:grid-cols-3">
              {service.included.map((item, i) => (
                <li key={item} data-reveal className="border-t border-ink/15 pt-[clamp(16px,calc(0.6vw+14px),26px)]">
                  <span className="grid size-[clamp(36px,calc(0.6vw+33px),46px)] place-items-center rounded-[7px] bg-coal text-small font-medium text-white tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-[clamp(16px,calc(0.6vw+14px),26px)] text-title font-medium text-balance">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </Block>
      )}

      {/* 3. Work for this service (hidden until there is some) */}
      {work.length > 0 && (
        <Block>
          <div id="work" className="scroll-mt-6">
            <SectionHeading label="Work" className="mb-[clamp(32px,calc(2.6vw+22px),80px)]" />
            <WorkGrid projects={work} pageSize={work.length} headingLevel="h2" />
          </div>
        </Block>
      )}

      {/* 4. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}

/** The product-box visual from the reference's member cards, built from the mark. */
function ServiceVisual({ mark, group, name }: { mark: string; group: string; name: string }) {
  return (
    <div aria-hidden="true" className="relative min-h-[clamp(260px,30vw,520px)] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#2a2b2e] md:hidden" />
      <div className="absolute left-1/2 top-[52%] w-[min(62%,380px)] -translate-x-1/2 -translate-y-1/2">
        <div className="relative aspect-[5/4] rounded-[10px] border border-white/10 bg-[linear-gradient(160deg,#2c2c2c_0%,#161616_70%)] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.7)]">
          <span className="absolute left-[7%] top-[8%] text-[length:clamp(9px,0.6vw,12px)] uppercase tracking-[0.12em] text-white/45">{group}</span>
          <span className="absolute right-[7%] top-[8%] text-[length:clamp(9px,0.6vw,12px)] uppercase tracking-[0.12em] text-white/45">{name}</span>
          <span className="absolute inset-0 grid place-items-center text-[length:clamp(44px,5vw,96px)] font-semibold tracking-[-0.05em] text-white/90">
            {mark}
          </span>
          <span className="absolute bottom-[8%] left-[7%] h-px w-[30%] bg-white/15" />
        </div>
      </div>
    </div>
  );
}
