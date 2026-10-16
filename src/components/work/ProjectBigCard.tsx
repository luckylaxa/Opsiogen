import type { ProjectCard } from "@/lib/types";
import { BigCard } from "@/components/ui/BigCard";
import { initials } from "@/lib/utils";

/** A project as the big dark two-column card, with the View cursor. */
export function ProjectBigCard({ project, titleAs = "h3" }: { project: ProjectCard; titleAs?: "h2" | "h3" }) {
  return (
    <BigCard
      href={`/work/${project.slug}`}
      cursor="view"
      badge={initials(project.client)}
      image={project.cover}
      dots={project.services.length}
      label={project.industry}
      title={project.name}
      titleAs={titleAs}
      stat={project.year ? { label: "Year", value: String(project.year) } : null}
      footLeft={<span className="block truncate">{project.client}</span>}
      footRight={project.services.map((s) => s.shortName).join(" · ")}
    />
  );
}
