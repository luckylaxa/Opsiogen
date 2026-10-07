import type { ProjectCard, Service } from "./types";
import type { SearchItem } from "@/components/site/SiteSearch";
import type { MenuGroup } from "@/components/site/NavMenu";
import { GROUP_LABELS } from "./utils";

/** Everything the header search can find: projects first, then services. */
export function buildSearchItems(projects: ProjectCard[], services: Service[]): SearchItem[] {
  return [
    ...projects.map((p) => ({
      kind: "work" as const,
      title: p.name,
      subtitle: [p.client, p.industry].filter(Boolean).join(" · "),
      href: `/work/${p.slug}`,
      keywords: [p.year, ...p.services.flatMap((s) => [s.name, s.shortName])].filter(Boolean).join(" "),
      image: { url: p.cover.url, alt: p.cover.alt },
    })),
    ...services.map((s) => ({
      kind: "service" as const,
      title: s.name,
      subtitle: s.tagline,
      href: `/services/${s.slug}`,
      keywords: [s.shortName, GROUP_LABELS[s.group], ...s.included].join(" "),
      mark: GROUP_LABELS[s.group].charAt(0),
    })),
  ];
}

/** Services grouped for the header drop-down. */
export function buildMenuGroups(services: Service[]): MenuGroup[] {
  return (Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[])
    .map((group) => ({
      group,
      label: GROUP_LABELS[group],
      services: services
        .filter((s) => s.group === group)
        .map((s) => ({ name: s.name, tagline: s.tagline, href: `/services/${s.slug}` })),
    }))
    .filter((g) => g.services.length > 0);
}
