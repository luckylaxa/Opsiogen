import type { ProjectCard } from "@/lib/types";
import { BigCard } from "@/components/ui/BigCard";
import { initials } from "@/lib/utils";

/**
 * A project as the big dark two-column card, with the View cursor. The link
 * opens the project pop-up, so the page underneath keeps its scroll position.
 * With `replace` it replaces the current history entry (used inside the
 * pop-up, so Back still closes it).
 */
export function ProjectBigCard({
  project,
  titleAs = "h3",
  replace = false,
}: {
  project: ProjectCard;
  titleAs?: "h2" | "h3" | "h4";
  replace?: boolean;
}) {
  const client = project.client && project.client !== project.name ? project.client : null;
  return (
    <BigCard
      href={`/work/${project.slug}`}
      replace={replace}
      scroll={false}
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
