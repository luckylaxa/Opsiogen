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
}: {
  section: ServicesListSection;
  variant?: "rows" | "directory" | "groups";
}) {
  if (variant === "directory") return <ServicesDirectory section={section} />;
  if (variant === "groups") return <ServicesGroups section={section} />;
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
                <span className={cn(buttonClass("outline", "md"), "group-hover:bg-ink group-hover:text-on-ink")}>
                  <span className="btn-label">View</span>
                </span>
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

function ListHeading({ section }: { section: ServicesListSection }) {
  return section.heading ? (
    <GiantHeading
      label={section.label}
      heading={section.heading}
      accent={section.accent}
      text={section.text}
      className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
    />
  ) : (
    <SectionHeading label={section.label} text={section.text} className="mb-[clamp(40px,calc(3.4vw+27px),105px)]" />
  );
}

async function ServicesDirectory({ section }: { section: ServicesListSection }) {
  const { services, workFor } = await loadServices();
  const ordered = GROUPS.flatMap((g) => services.filter((s) => s.group === g));
  return (
    <div data-dock="/services">
      <ListHeading section={section} />
      <ServiceCards services={ordered} workFor={workFor} />
    </div>
  );
}

async function ServicesGroups({ section }: { section: ServicesListSection }) {
  const { services, workFor } = await loadServices();
  const titleLevel = section.heading ? "h3" : "h2";
  return (
    <div data-dock="/services">
      <ListHeading section={section} />
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

/**
 * One project cover per service card, different from card to card where the
 * work allows: services with the fewest projects choose first.
 */
function pickCovers(services: Service[], workFor: (slug: string) => ProjectCard[]) {
  const picked = new Map<string, ProjectCard>();
  const used = new Set<string>();
  const byChoice = [...services].sort((a, b) => workFor(a.slug).length - workFor(b.slug).length);
  for (const s of byChoice) {
    const work = workFor(s.slug);
    const project = work.find((p) => !used.has(p.slug)) ?? work[0];
    if (!project) continue;
    picked.set(s.slug, project);
    used.add(project.slug);
  }
  return picked;
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
  const covers = pickCovers(services, workFor);
  return (
    <ul className="@container grid grid-cols-1 gap-gap px-gutter lg:grid-cols-2">
      {services.map((s) => {
        const work = workFor(s.slug);
        return (
          <li key={s.slug}>
            <BigCard
              href={`/services/${s.slug}`}
              badge={initials(s.shortName)}
              image={s.hero?.image ?? covers.get(s.slug)?.cover}
              label={GROUP_LABELS[s.group]}
              title={s.name}
              titleAs={titleAs}
              stat={work.length ? { label: "Projects", value: String(work.length).padStart(2, "0") } : null}
              footLeft={s.tagline}
              footRight={
                <span className="inline-flex items-center gap-2">
                  <span className="grad-hover">View service</span>
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
