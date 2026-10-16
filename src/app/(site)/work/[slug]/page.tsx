import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { GiantHeading } from "@/components/ui/Headings";
import { cn } from "@/lib/utils";
import { CoverMedia } from "@/components/media/CoverMedia";
import { Media } from "@/components/ui/Media";
import { ExternalLink } from "@/components/ui/Icons";
import { Block } from "@/components/sections/SectionRenderer";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProjectBigCard } from "@/components/work/ProjectBigCard";

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

/** The site’s host name for a link label, e.g. surgohealth.com. */
function displayUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** One story row in the design system's 4/8 split, under a dotted rule. */
function StoryRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-reveal>
      <div className="rule-dotted" />
      <div className="grid gap-4 py-[clamp(32px,2.9vw,56px)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-gap">
        <h2 className="text-base">{title}</h2>
        <div className="max-w-[30ch] text-[length:clamp(22px,calc(0.84vw+18.8px),36px)] leading-[1.25] tracking-[-0.015em] text-pretty">
          {children}
        </div>
      </div>
    </div>
  );
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, projects, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const hasResult = Boolean(project.result?.number && project.result?.label);

  type Fact = { label: string; value: React.ReactNode };
  const facts = ([
    { label: "Client", value: project.client || project.name },
    project.industry ? { label: "Industry", value: project.industry } : null,
    project.services.length
      ? {
          label: "Services",
          value: (
            <ul className="flex flex-col gap-1">
              {project.services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="link-underline">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    project.year ? { label: "Year", value: project.year } : null,
    project.liveUrl
      ? {
          label: "Website",
          value: (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2">
              <span className="link-underline">{displayUrl(project.liveUrl)}</span>
              <ExternalLink className="size-[1.1em] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ),
        }
      : null,
  ] as (Fact | null)[]).filter((f): f is Fact => Boolean(f));

  return (
    <>
      {/* 1. Title and cover, in the grey band */}
      <section data-band className="-mt-[var(--header-h)] bg-band pb-[clamp(40px,calc(2.3vw+31.4px),76px)] pt-[calc(var(--header-h)+clamp(40px,calc(1.57vw+34px),64px))]">
        <GiantHeading
          as="h1"
          labelStyle="pill"
          label={project.industry || project.services.map((s) => s.shortName).join(" · ") || null}
          heading={project.name}
        />
        <div className="mx-edge mt-[clamp(48px,calc(2.88vw+37.2px),92px)] overflow-hidden rounded-card bg-night px-[clamp(12px,7.5%,142px)] py-[clamp(12px,7.5%,142px)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-night sm:aspect-video">
            <CoverMedia image={project.cover} video={project.coverVideo} priority sizes="(min-width: 640px) 85vw, 100vw" />
          </div>
        </div>
      </section>

      {/* 2. Facts, then the story in a 4/8 split */}
      <Block>
        <div className="px-gutter">
          <dl className="grid grid-cols-2 gap-x-gap gap-y-[clamp(24px,2vw,40px)] lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="min-w-0 border-t border-ink pt-[clamp(12px,0.9vw,18px)]">
                <dt className="text-small text-mute">{f.label}</dt>
                <dd className="mt-2 text-row [overflow-wrap:anywhere]">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-[clamp(48px,calc(2.6vw+38px),96px)]">
            <StoryRow title="Overview">
              <p>{project.summary}</p>
            </StoryRow>
            {project.story.map((block, i) => (
              <StoryRow key={block._key ?? i} title={block.title}>
                <p>{block.text}</p>
              </StoryRow>
            ))}
            <div className="rule-dotted" />
          </div>
        </div>
      </Block>

      {/* 3. Result (optional) */}
      {hasResult && (
        <Block>
          <div className="flex flex-col items-center px-gutter text-center">
            <p className="text-gradient text-giant font-bold tabular-nums">{project.result!.number}</p>
            <p className="mt-[clamp(16px,calc(1.24vw+11.4px),35px)] max-w-[30ch] text-lead">{project.result!.label}</p>
          </div>
        </Block>
      )}

      {/* 4. Gallery */}
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

      {/* 5. Next project */}
      {next && (
        <Block>
          <div className="px-gutter">
            <h2 className="mb-[clamp(24px,calc(1.7vw+17.6px),50px)] text-h2 font-medium">Next project</h2>
            <ul className="@container grid grid-cols-1 gap-gap lg:grid-cols-2">
              <li>
                <ProjectBigCard project={next} titleAs="h3" />
              </li>
            </ul>
          </div>
        </Block>
      )}

      {/* 6. Call to action */}
      <Block>
        <CallToAction cta={settings.cta} />
      </Block>
    </>
  );
}
