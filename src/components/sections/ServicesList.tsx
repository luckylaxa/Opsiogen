import Link from "next/link";
import type { ProjectCard, Service, ServicesListSection } from "@/lib/types";
import { getProjects, getServices } from "@/lib/data";
import { GiantHeading, SectionHeading } from "@/components/ui/Headings";
import { buttonClass } from "@/components/ui/Button";
import { BigCard } from "@/components/ui/BigCard";
import { ArrowRight } from "@/components/ui/Icons";
import { cn, GROUP_LABELS, initials } from "@/lib/utils";

const GROUPS = ["build", "grow", "create"] as const;

/**
 * Services in their three groups. `rows`: dotted-rule rows per group.
 * `directory`: a giant title, then every service as a big dark card, two per
 * row (Home). `groups`: the same cards under a heading per group, with
 * #build, #grow and #create anchors (the Services page).
 */
export async function ServicesList({
  section,
  variant = "rows",
  sticker,
}: {
  section: ServicesListSection;
  variant?: "rows" | "directory" | "groups";
  sticker?: boolean;
}) {
  if (variant === "directory") return <ServicesDirectory section={section} sticker={sticker} />;
  if (variant === "groups") return <ServicesGroups section={section} sticker={sticker} />;
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
                <span className={cn(buttonClass("outline", "md"), "group-hover:bg-ink group-hover:text-on-ink")}>View</span>
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

/** Services and, for each, the projects tagged with it. */
async function loadServices() {
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const workFor = (slug: string) => projects.filter((p) => p.services.some((s) => s.slug === slug));
  return { services, workFor };
}

function ListHeading({ section, sticker }: { section: ServicesListSection; sticker?: boolean }) {
  return section.heading ? (
    <GiantHeading
      label={section.label}
      heading={section.heading}
      text={section.text}
      sticker={sticker}
      className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
    />
  ) : (
    <SectionHeading label={section.label} text={section.text} className="mb-[clamp(40px,calc(3.4vw+27px),105px)]" />
  );
}

async function ServicesDirectory({ section, sticker }: { section: ServicesListSection; sticker?: boolean }) {
  const { services, workFor } = await loadServices();
  const ordered = GROUPS.flatMap((g) => services.filter((s) => s.group === g));
  return (
    <div data-dock="/services">
      <ListHeading section={section} sticker={sticker} />
      <ServiceCards services={ordered} workFor={workFor} />
    </div>
  );
}

async function ServicesGroups({ section, sticker }: { section: ServicesListSection; sticker?: boolean }) {
  const { services, workFor } = await loadServices();
  const titleLevel = section.heading ? "h3" : "h2";
  return (
    <div data-dock="/services">
      <ListHeading section={section} sticker={sticker} />
      <div className="flex flex-col gap-[clamp(64px,calc(4.2vw+48px),130px)]">
        {GROUPS.map((group) => {
          const items = services.filter((s) => s.group === group);
          if (!items.length) return null;
          const Heading = titleLevel;
          return (
            <section key={group} id={group} aria-labelledby={`${group}-title`} className="scroll-mt-8">
              <div className="mb-[clamp(28px,calc(2vw+20px),60px)] px-gutter">
                <Heading id={`${group}-title`} className="text-h2 font-medium">
                  {GROUP_LABELS[group]}
                </Heading>
              </div>
              <ServiceCards services={items} workFor={workFor} />
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Every service as a big dark card, two per row from desktop up. */
function ServiceCards({
  services,
  workFor,
  titleAs = "h3",
}: {
  services: Service[];
  workFor: (slug: string) => ProjectCard[];
  titleAs?: "h2" | "h3";
}) {
  return (
    <ul className="@container grid gap-gap px-gutter lg:grid-cols-2">
      {services.map((s) => {
        const work = workFor(s.slug);
        return (
          <li key={s.slug}>
            <BigCard
              href={`/services/${s.slug}`}
              badge={initials(s.shortName)}
              image={work[0]?.cover}
              dots={work.length}
              label={GROUP_LABELS[s.group]}
              title={s.name}
              titleAs={titleAs}
              stat={work.length ? { label: "Projects", value: String(work.length).padStart(2, "0") } : null}
              footLeft={s.tagline}
              footRight={
                <span className="inline-flex items-center gap-2">
                  View service
                  <ArrowRight className="size-[clamp(18px,1.15vw,22px)] transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
