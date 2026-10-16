import type { ProjectCard } from "@/lib/types";
import { BigCard } from "@/components/ui/BigCard";
import { initials } from "@/lib/utils";

/** A project as the big dark two-column card, with the View cursor. */
export function ProjectBigCard({ project, titleAs = "h3" }: { project: ProjectCard; titleAs?: "h2" | "h3" }) {
  const client = project.client && project.client !== project.name ? project.client : null;
  return (
    <BigCard
      href={`/work/${project.slug}`}
      cursor="view"
      badge={initials(project.client || project.name)}
      image={project.cardImage ?? project.cover}
      label={[client, project.industry].filter(Boolean).join(" · ") || null}
      title={project.name}
      titleAs={titleAs}
      stat={project.year ? { label: "Year", value: String(project.year) } : null}
      footLeft={project.services.map((s) => s.shortName).join(" · ")}
      footRight={<span className="grad-hover underline underline-offset-[0.28em]">View project</span>}
    />
  );
}
