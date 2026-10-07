import { notFound } from "next/navigation";
import { cmsMetadata } from "@/components/CmsPage";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { GiantHeading } from "@/components/ui/Headings";
import { Directory } from "@/components/work/Directory";
import { getPage, getProjects, getServices } from "@/lib/data";
import type { HeroSection, ProjectGridSection } from "@/lib/types";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("work", "/work");
}

/**
 * Work, laid out like the reference's directory page. The title and intro
 * come from the page's hero section, the page size from its project grid;
 * any other sections (such as the call to action) follow below.
 */
export default async function WorkPage() {
  const [page, projects, services] = await Promise.all([getPage("work"), getProjects(), getServices()]);
  if (!page) notFound();

  const hero = page.sections.find((s): s is HeroSection => s._type === "hero");
  const grid = page.sections.find((s): s is ProjectGridSection => s._type === "projectGrid");
  const rest = page.sections.filter((s) => s !== hero && s !== grid);
  const pageSize = grid?.limit && grid.limit > 0 ? grid.limit : 12;

  return (
    <>
      <Directory
        projects={projects}
        services={services.map(({ name, slug, shortName, group }) => ({ name, slug, shortName, group }))}
        pageSize={pageSize}
      >
        <GiantHeading
          as="h1"
          label={hero?.label}
          heading={hero?.heading ?? page.title}
          text={hero?.text}
          sticker
          className="pb-[clamp(48px,calc(3.4vw+35px),110px)] pt-[clamp(48px,calc(3.4vw+35px),110px)]"
        />
      </Directory>
      {rest.length > 0 && (
        <div className="mt-section">
          <SectionRenderer sections={rest} layout={{ stickers: true, cta: "dual" }} />
        </div>
      )}
    </>
  );
}
