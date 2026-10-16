import { notFound } from "next/navigation";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { CallToAction } from "@/components/sections/CallToAction";
import { Block } from "@/components/sections/SectionRenderer";
import { ProjectDetail } from "@/components/work/ProjectDetail";
import { ProjectModal } from "@/components/work/ProjectModal";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * A project opened from a link inside the site: the case study in a
 * full-screen pop-up over the current page (see ProjectModal). Opening
 * /work/[slug] directly renders the full page in work/[slug] instead.
 */
export default async function ProjectPopup({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  if (!project) notFound();

  const index = Math.max(0, projects.findIndex((p) => p.slug === project.slug));
  const at = (i: number) => projects[(i + projects.length) % projects.length];
  const prev = at(index - 1);
  const next = at(index + 1);
  const more = [next, at(index + 2)].filter((p, i, all) => p.slug !== project.slug && all.findIndex((x) => x.slug === p.slug) === i);
  const titleId = `project-title-${project.slug}`;

  return (
    <ProjectModal
      slug={project.slug}
      name={project.name}
      index={index}
      total={projects.length}
      prevHref={`/work/${prev.slug}`}
      nextHref={`/work/${next.slug}`}
      titleId={titleId}
    >
      <ProjectDetail project={project} more={more} inModal titleId={titleId} />
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </ProjectModal>
  );
}
