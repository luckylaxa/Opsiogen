import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProjectDetail } from "@/components/work/ProjectDetail";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.name,
    description: project.tagline ? `${project.tagline} ${project.summary}` : project.summary,
    seo: project.seo,
    image: project.cardImage ?? project.cover,
    path: `/work/${project.slug}`,
  });
}

/**
 * A case study as its own page, for shared links and refreshes. Links inside
 * the site open the same case study in the full-screen pop-up instead
 * (app/(site)/@modal/(.)work/[slug]).
 */
export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  if (!project) notFound();

  const index = Math.max(0, projects.findIndex((p) => p.slug === project.slug));
  const more = [1, 2]
    .map((n) => projects[(index + n) % projects.length])
    .filter((p, i, all) => p.slug !== project.slug && all.findIndex((x) => x.slug === p.slug) === i);

  return (
    <>
      <ProjectDetail project={project} more={more} />
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
