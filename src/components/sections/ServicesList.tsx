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
  sticker?: string;
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

async function ServicesDirectory({ section, sticker }: { section: ServicesListSection; sticker?: string }) {
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

      <ServiceTable services={services} countFor={(slug) => workFor([slug]).length} />
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

/** The reference's directory table: one row per service with a View button. */
function ServiceTable({ services, countFor }: { services: Service[]; countFor: (slug: string) => number }) {
  const cols = "md:grid-cols-[minmax(0,4.2fr)_minmax(0,1.6fr)_minmax(0,4.6fr)_minmax(0,1.1fr)_auto]";
  return (
    <div className="mt-[clamp(40px,calc(2.4vw+30px),90px)] px-gutter">
      <div aria-hidden="true" className={cn("hidden gap-x-6 px-[clamp(0px,1.8vw,35px)] pb-[clamp(16px,1.6vw,40px)] text-base text-mute md:grid", cols)}>
        <span>Service</span>
        <span>Group</span>
        <span>In short</span>
        <span>Work</span>
        <span className="w-[clamp(72px,4.7vw,90px)]" />
      </div>
      <div className="rule-dotted" />
      <ul>
        {services.map((s) => {
          const count = countFor(s.slug);
          return (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className={cn(
                  "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1 px-[clamp(0px,1.8vw,35px)] py-[clamp(18px,calc(1.6vw+12px),44px)]",
                  cols,
                )}
              >
                <span className="flex min-w-0 items-center gap-[clamp(10px,0.8vw,16px)]">
                  <span
                    aria-hidden="true"
                    className="grid size-[clamp(34px,calc(0.4vw+32px),42px)] shrink-0 place-items-center rounded-full bg-coal text-[length:clamp(11px,0.7vw,13px)] font-semibold text-white"
                  >
                    {initials(s.shortName)}
                  </span>
                  <span className="truncate text-row font-medium underline decoration-ink/30 decoration-1 underline-offset-[0.25em] transition-[text-decoration-color] group-hover:decoration-ink">
                    {s.name}
                  </span>
                </span>
                <span className="col-start-1 text-base text-ink-2 md:col-start-auto md:text-row">{GROUP_LABELS[s.group]}</span>
                <span className="col-start-1 text-base text-ink-2 md:col-start-auto">{s.tagline}</span>
                <span className="hidden text-row tabular-nums md:block">{count}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    buttonClass("outline", "md"),
                    "col-start-2 row-span-3 row-start-1 w-[clamp(72px,4.7vw,90px)] border-ink/25 px-0 group-hover:border-ink group-hover:bg-ink group-hover:text-white md:col-start-auto md:row-span-1 md:row-start-auto",
                  )}
                >
                  View
                </span>
              </Link>
              <div className="rule-dotted" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
