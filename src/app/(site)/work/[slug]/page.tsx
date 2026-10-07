import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { cn, giantClass } from "@/lib/utils";
import { CoverMedia } from "@/components/media/CoverMedia";
import { Media } from "@/components/ui/Media";
import { ArrowRight } from "@/components/ui/Icons";
import { Frame } from "@/components/ui/Frame";
import { Label, SectionHeading } from "@/components/ui/Headings";
import { Toolbar } from "@/components/ui/Toolbar";
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
  const mark = `${settings.siteTitle.charAt(0)}.`;

  return (
    <>
      {/* 1–2. Title, toolbar and framed cover, in the grey band (as the reference's website pages) */}
      <section data-band className="-mt-[var(--header-h)] bg-band pb-[clamp(40px,calc(2.3vw+31.4px),76px)] pt-[calc(var(--header-h)+clamp(24px,calc(2.6vw+14.2px),65px))]">
        <div className="flex items-start px-gutter">
          {project.year && (
            <dl className="flex w-[clamp(64px,calc(1.5vw+58px),87px)] flex-col items-center rounded-[6px] border border-ink/70 text-center">
              <dt className="w-full border-b border-ink/70 py-[clamp(3px,0.3vw,6px)] text-small">Year</dt>
              <dd className="py-[clamp(4px,0.4vw,8px)] text-[length:clamp(17px,calc(0.6vw+14.8px),26px)] font-medium tabular-nums">
                {project.year}
              </dd>
            </dl>
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
        </div>

        <div className="mt-[clamp(24px,calc(1.3vw+19px),48px)] px-gutter">
          <Toolbar
            label="Services"
            mark={mark}
            items={project.services.map((s) => ({ label: s.name, href: `/services/${s.slug}` }))}
            action={project.liveUrl ? { label: "Visit site", href: project.liveUrl } : null}
          />
        </div>

        <div className="mt-[clamp(32px,calc(2vw+25px),72px)] px-gutter">
          <Frame inset="lg" mediaClassName="aspect-[4/3] sm:aspect-video">
            <CoverMedia image={project.cover} video={project.coverVideo} priority sizes="(min-width: 640px) 75vw, 100vw" />
          </Frame>
        </div>
      </section>

      {/* 3. Summary */}
      <Block>
        <div className="px-gutter">
          <Label className="mb-[clamp(14px,calc(0.6vw+12px),24px)] text-small text-mute">Summary</Label>
          <p className="max-w-[36ch] text-[length:clamp(24px,calc(1.15vw+19.7px),46px)] leading-[1.25] tracking-[-0.01em] text-ink-2 text-pretty">
            {project.summary}
          </p>
        </div>
      </Block>

      {/* 4. Result (optional), set like the reference's score */}
      {hasResult && (
        <Block>
          <div className="px-gutter">
            <p className={cn(giantClass(project.result!.label!), "max-w-[16ch] font-semibold uppercase text-balance")}>
              {project.result!.label}
            </p>
            <p className="mt-[clamp(8px,0.8vw,16px)] flex items-center gap-[0.25em] pl-[clamp(0px,26vw,520px)] text-giant font-semibold tabular-nums">
              <ArrowRight className="size-[0.62em] shrink-0" strokeWidth={1.4} />
              {project.result!.number}
            </p>
          </div>
        </Block>
      )}

      {/* 5. Gallery: each image framed, full width or two side by side */}
      {project.gallery.length > 0 && (
        <Block>
          <SectionHeading label="Gallery" className="mb-[clamp(28px,calc(2vw+20px),64px)]" />
          <ul className="grid grid-cols-2 gap-[clamp(10px,calc(0.6vw+8px),20px)] px-gutter">
            {project.gallery.map((img, i) => {
              const half = img.size === "half";
              return (
                <li key={img._key} data-reveal className={half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
                  <Frame inset={half ? "sm" : "md"}>
                    <Media
                      image={img}
                      fill={false}
                      sizes={half ? "(min-width: 640px) 38vw, 80vw" : "76vw"}
                      priority={i === 0}
                    />
                  </Frame>
                </li>
              );
            })}
          </ul>
        </Block>
      )}

      {/* 6. Next project */}
      {next && (
        <Block>
          <div className="grid items-end gap-y-[clamp(28px,2.4vw,48px)] gap-x-gap px-gutter md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">Next project</Label>
              <p className="max-w-[13.5ch] text-h2 font-medium text-balance">{next.name}</p>
              <p className="mt-3 text-base text-ink-2">{[next.client, next.industry].filter(Boolean).join(" · ")}</p>
            </div>
            <Link href={`/work/${next.slug}`} className="group block" aria-label={`Next project: ${next.name}`}>
              <Frame inset="md" mediaClassName="aspect-video">
                <Media
                  image={next.cover}
                  sizes="(min-width: 768px) 50vw, 90vw"
                  className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
                />
              </Frame>
              <span className="mt-4 inline-flex items-center gap-2 text-base font-medium">
                <span className="link-underline">View project</span>
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
