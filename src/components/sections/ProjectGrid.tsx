import type { ProjectGridSection } from "@/lib/types";
import { getProjects, getServices } from "@/lib/data";
import { GiantHeading } from "@/components/ui/Headings";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { WorkGrid } from "@/components/work/WorkGrid";

/** “Latest work” on Home and the filterable grid on Work. */
export async function ProjectGrid({ section, sticker }: { section: ProjectGridSection; sticker?: boolean }) {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const limit = section.limit && section.limit > 0 ? section.limit : 6;
  const filters = section.showFilters
    ? services.map(({ name, slug, shortName, group }) => ({ name, slug, shortName, group }))
    : undefined;
  const hasHeading = Boolean(section.heading);

  return (
    <div data-dock="/work">
      {hasHeading && (
        <GiantHeading
          label={section.label}
          heading={section.heading!}
          text={section.text}
          sticker={sticker}
          className="mb-[clamp(48px,calc(3.4vw+35.2px),100px)]"
        />
      )}
      <WorkGrid projects={projects} filters={filters} pageSize={limit} headingLevel={hasHeading ? "h3" : "h2"} />
      {section.link?.href && section.link.label && (
        <ArrowLink href={section.link.href} className="mt-[clamp(48px,calc(3.6vw+34.5px),110px)]">
          {section.link.label}
        </ArrowLink>
      )}
    </div>
  );
}
