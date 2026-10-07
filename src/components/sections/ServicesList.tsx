import Link from "next/link";
import type { ProjectCard, Service, ServiceGroup as Group, ServicesListSection } from "@/lib/types";
import { getProjects, getServices } from "@/lib/data";
import { GiantHeading, SectionHeading } from "@/components/ui/Headings";
import { buttonClass } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { ArrowRight } from "@/components/ui/Icons";
import { cn, GROUP_LABELS, initials } from "@/lib/utils";

const GROUPS = ["build", "grow", "create"] as const;

/**
 * Services in their three groups. `rows`: dotted-rule rows per group.
 * `directory`: the reference's creators block, with a giant title, a dark
 * card per group and every service in a table with a View button.
 */
export async function ServicesList({
  section,
  variant = "rows",
  sticker,
}: {
  section: ServicesListSection;
  variant?: "rows" | "directory";
  sticker?: boolean;
}) {
  if (variant === "directory") return <ServicesDirectory section={section} sticker={sticker} />;
  const services = await getServices();
  return (
    <div data-dock="/services">
      <SectionHeading
        label={section.label}
        heading={section.heading}
        text={section.text}
        className="mb-[clamp(40px,calc(3.4vw+27px),105px)]"
      />
      <div className="flex flex-col gap-[clamp(48px,calc(2.6vw+38px),90px)] px-gutter">
        {GROUPS.map((group) => {
          const items = services.filter((s) => s.group === group);
          if (!items.length) return null;
          return <ServiceGroup key={group} title={GROUP_LABELS[group]} items={items} level={section.heading ? "h3" : "h2"} />;
        })}
      </div>
    </div>
  );
}

function ServiceGroup({ title, items, level: Heading }: { title: string; items: Service[]; level: "h2" | "h3" }) {
  return (
    <section id={items[0]?.group} aria-label={title} className="scroll-mt-8">
      <Heading className="px-[clamp(0px,1.84vw,35px)] pb-[clamp(16px,calc(1.18vw+11.6px),40px)] text-base text-ink-2">{title}</Heading>
      <div className="rule-dotted" />
      <ul>
        {items.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 px-[clamp(0px,1.84vw,35px)] py-[clamp(20px,calc(1.24vw+15.4px),44px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto]"
            >
              <span className="text-row font-medium">{s.name}</span>
              <span className="col-start-1 row-start-2 text-row text-ink-2 md:col-start-auto md:row-start-auto">{s.tagline}</span>
              <span aria-hidden="true" className="hidden md:block">
                <span className={cn(buttonClass("outline", "md"), "group-hover:bg-ink group-hover:text-white")}>View</span>
              </span>
              <ArrowRight className="col-start-2 row-span-2 row-start-1 size-6 transition-transform duration-300 group-hover:translate-x-1 md:hidden" />
            </Link>
            <div className="rule-dotted" />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ServicesDirectory({ section, sticker }: { section: ServicesListSection; sticker?: boolean }) {
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const workFor = (slugs: string[]) => projects.filter((p) => p.services.some((s) => slugs.includes(s.slug)));
  const groups = GROUPS.map((group) => {
    const items = services.filter((s) => s.group === group);
    return { group, items, work: workFor(items.map((s) => s.slug)) };
  }).filter((g) => g.items.length > 0);

  return (
    <div data-dock="/services">
      {section.heading ? (
        <GiantHeading
          label={section.label}
          heading={section.heading}
          text={section.text}
          sticker={sticker}
          className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
        />
      ) : (
        <SectionHeading label={section.label} text={section.text} className="mb-[clamp(40px,calc(3.4vw+27px),105px)]" />
      )}

      <ul className="grid gap-[clamp(12px,calc(0.6vw+10px),25px)] px-gutter lg:grid-cols-3">
        {groups.map((g) => (
          <li key={g.group}>
            <GroupCard group={g.group} items={g.items} work={g.work} />
          </li>
        ))}
      </ul>

      <ServiceCards services={services} workFor={(slug) => workFor([slug])} />
    </div>
  );
}

/** Dark profile card from the reference's creators block, one per group. */
function GroupCard({ group, items, work }: { group: Group; items: Service[]; work: ProjectCard[] }) {
  const title = GROUP_LABELS[group];
  const cover = work[0]?.cover;
  const dots = Math.min(Math.max(work.length, 1), 5);
  return (
    <Link
      href={`/services#${group}`}
      data-reveal
      className="on-dark group relative flex h-full min-h-[clamp(400px,calc(13vw+240px),640px)] flex-col overflow-hidden rounded-card bg-coal p-[clamp(24px,calc(1.7vw+16px),57px)] text-white"
    >
      <span
        aria-hidden="true"
        className="absolute left-[clamp(24px,calc(1.7vw+16px),57px)] top-[clamp(24px,calc(1.7vw+16px),57px)] grid size-[clamp(40px,calc(1.2vw+33px),64px)] place-items-center rounded-full bg-black/45 text-[length:clamp(15px,calc(0.4vw+13px),22px)] font-semibold"
      >
        {title.charAt(0)}
      </span>
      {cover && (
        <div className="mx-auto w-[58%]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-night">
            <Media
              image={cover}
              sizes="(min-width: 1024px) 18vw, 60vw"
              className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          </div>
          <div aria-hidden="true" className="mt-[clamp(14px,1.2vw,22px)] flex justify-end gap-[clamp(6px,0.6vw,12px)]">
            {Array.from({ length: dots }, (_, i) => (
              <span key={i} className={cn("size-[6px] rounded-full", i === 0 ? "bg-white" : "bg-white/25")} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-10">
        <p className="text-base text-white/80">Services</p>
        <div className="mt-[clamp(6px,0.6vw,12px)] flex items-end justify-between gap-6">
          <h3 className="text-[length:clamp(32px,calc(1.3vw+26px),52px)] leading-[1.05] font-semibold tracking-[-0.015em]">{title}</h3>
          <p className="flex min-w-[clamp(60px,4vw,77px)] flex-col items-center rounded-[6px] border border-white/30 px-3 py-[clamp(6px,0.5vw,10px)] text-center">
            <span className="text-small text-white/80">Total</span>
            <span className="text-[length:clamp(18px,calc(0.6vw+15px),28px)] leading-tight font-medium tabular-nums">
              {String(items.length).padStart(2, "0")}
            </span>
          </p>
        </div>
        <div className="mt-[clamp(28px,3vw,56px)] flex items-end justify-between gap-6 text-base">
          <p className="min-w-0 text-white/80">{items.map((s) => s.shortName).join(" · ")}</p>
          <p className="shrink-0 tabular-nums">
            {work.length} {work.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Every service as a card, like the reference's product cards: an image from
 * the service's latest project, the group, the name and tagline, then a View
 * link. A swipeable row on phones, a grid from tablet up.
 */
function ServiceCards({ services, workFor }: { services: Service[]; workFor: (slug: string) => ProjectCard[] }) {
  return (
    <ul className="mt-[clamp(12px,calc(0.6vw+10px),25px)] flex snap-x snap-mandatory scroll-px-gutter gap-[clamp(12px,calc(0.6vw+10px),25px)] overflow-x-auto px-gutter pb-1 [scrollbar-width:none] sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4">
      {services.map((s) => {
        const work = workFor(s.slug);
        return (
          <li key={s.slug} className="w-[82%] shrink-0 snap-start sm:w-auto">
            <ServiceCard service={s} work={work} />
          </li>
        );
      })}
    </ul>
  );
}

function ServiceCard({ service, work }: { service: Service; work: ProjectCard[] }) {
  const cover = work[0]?.cover;
  const pad = "px-[clamp(18px,calc(0.9vw+14px),36px)]";
  return (
    <Link href={`/services/${service.slug}`} data-reveal className="group flex h-full flex-col overflow-hidden rounded-card bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-coal">
        {cover ? (
          <Media
            image={cover}
            sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 82vw"
            className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center text-[length:clamp(36px,3vw,56px)] font-semibold tracking-[-0.03em] text-white/85">
            {initials(service.shortName)}
          </span>
        )}
      </div>
      <div className={cn(pad, "pb-[clamp(18px,1.4vw,28px)] pt-[clamp(18px,1.6vw,32px)]")}>
        <p className="text-base text-mute">{GROUP_LABELS[service.group]}</p>
        <h3 className="mt-1 text-title font-medium text-balance">{service.name}</h3>
      </div>
      <div className={cn(pad, "mt-auto flex items-end justify-between gap-4 border-t border-ink/10 py-[clamp(16px,1.4vw,28px)]")}>
        <p className="text-base text-ink-2">{service.tagline}</p>
        {work.length > 0 && (
          <p className="shrink-0 text-small text-mute tabular-nums">
            {work.length} {work.length === 1 ? "project" : "projects"}
          </p>
        )}
      </div>
      <div className={cn(pad, "flex items-center justify-between border-t border-ink/10 py-[clamp(16px,1.3vw,26px)]")}>
        <span className="text-base font-medium">View service</span>
        <ArrowRight className="size-[clamp(20px,1.3vw,26px)] transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
