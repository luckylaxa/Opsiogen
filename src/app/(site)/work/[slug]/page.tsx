import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { cn, giantClass } from "@/lib/utils";
import { CoverMedia } from "@/components/media/CoverMedia";
import { Media } from "@/components/ui/Media";
import { ArrowRight, ExternalLink } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";

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
    description: project.summary,
    seo: project.seo,
    image: project.cover,
    path: `/work/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const meta = [project.client, project.industry].filter(Boolean).join(" · ");
  const hasResult = Boolean(project.result?.number && project.result?.label);

  return (
    <>
      {/* 1–2. Title and cover, in the grey band */}
      <section data-band className="-mt-[var(--header-h)] bg-band pb-[clamp(40px,calc(2.3vw+31.4px),76px)] pt-[calc(var(--header-h)+clamp(24px,calc(2.6vw+14.2px),65px))]">
        <div className="flex items-start justify-between px-gutter">
          {project.year ? (
            <dl className="flex w-[clamp(64px,calc(1.5vw+58px),87px)] flex-col items-center rounded-[6px] border border-ink/70 text-center">
              <dt className="w-full border-b border-ink/70 py-[clamp(3px,0.3vw,6px)] text-small">Year</dt>
              <dd className="py-[clamp(4px,0.4vw,8px)] text-[length:clamp(17px,calc(0.6vw+14.8px),26px)] font-medium tabular-nums">
                {project.year}
              </dd>
            </dl>
          ) : (
            <span />
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-base font-medium"
            >
              <span className="link-underline">Visit site</span>
              <ExternalLink className="size-[1.3em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
        </div>

        <div className="mt-[clamp(28px,calc(4.5vw+11px),112px)] flex flex-col items-center px-gutter text-center">
          {meta && <p className="text-base text-ink">{meta}</p>}
          <h1
            className={cn(
              giantClass(project.name),
              "mt-[clamp(20px,calc(2.29vw+11.4px),55px)] w-full font-semibold uppercase text-balance",
            )}
          >
            {project.name}
          </h1>
          {project.services.length > 0 && (
            <ul className="mt-[clamp(20px,calc(1.64vw+13.8px),45px)] flex flex-wrap justify-center gap-x-[0.9em] gap-y-2 text-title font-medium">
              {project.services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="link-underline">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mx-edge mt-[clamp(48px,calc(2.88vw+37.2px),92px)] overflow-hidden rounded-card bg-night px-[clamp(12px,7.5%,142px)] py-[clamp(12px,7.5%,142px)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-[#1d2226] sm:aspect-video">
            <CoverMedia image={project.cover} video={project.coverVideo} priority sizes="(min-width: 640px) 85vw, 100vw" />
          </div>
        </div>
      </section>

      {/* 3. Summary */}
      <Block>
        <p className="max-w-[30ch] px-gutter text-h2 font-medium text-balance">{project.summary}</p>
      </Block>

      {/* 4. Result (optional) */}
      {hasResult && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <p className="text-giant font-semibold tabular-nums">{project.result!.number}</p>
            <p className="mt-[clamp(16px,calc(1.24vw+11.4px),35px)] max-w-[30ch] text-lead">{project.result!.label}</p>
          </div>
        </Block>
      )}

      {/* 5. Gallery */}
      {project.gallery.length > 0 && (
        <Block>
          <ul className="grid grid-cols-2 gap-gap px-gutter">
            {project.gallery.map((img, i) => (
              <li
                key={img._key}
                data-reveal
                className={cn("overflow-hidden rounded-card bg-band", img.size === "half" ? "col-span-2 sm:col-span-1" : "col-span-2")}
              >
                <Media
                  image={img}
                  fill={false}
                  sizes={img.size === "half" ? "(min-width: 640px) 48vw, 100vw" : "96vw"}
                  priority={i === 0}
                />
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* 6. Next project */}
      {next && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <p className="text-base">Next project</p>
            <Link
              href={`/work/${next.slug}`}
              className="group mt-[clamp(20px,calc(2.29vw+11.4px),55px)] inline-flex max-w-full flex-col items-center"
            >
              <span className={cn(giantClass(next.name), "font-semibold uppercase text-balance transition-opacity duration-300 group-hover:opacity-60")}>
                {next.name}
              </span>
              <span className={cn(buttonClass("outline", "md"), "mt-[clamp(24px,calc(1.7vw+17.6px),50px)] group-hover:bg-ink group-hover:text-white")}>
                View project
                <ArrowRight className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </Block>
      )}

      {/* 7. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
