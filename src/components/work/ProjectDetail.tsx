import Link from "next/link";
import type { GalleryItem, Img, Project, ProjectCard, ProjectStat } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GiantHeading, Label } from "@/components/ui/Headings";
import { CoverMedia } from "@/components/media/CoverMedia";
import { Media } from "@/components/ui/Media";
import { ExternalLink } from "@/components/ui/Icons";
import { ProjectBigCard } from "@/components/work/ProjectBigCard";

/** The site’s host name for a link label, e.g. surgohealth.com. */
function displayUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The work images: the gallery, or for projects without one, the card
 * mockup and the cover. The first is the big image under the name.
 */
function workImages(project: Project): GalleryItem[] {
  if (project.gallery.length) return project.gallery;
  return [project.cardImage, project.cover]
    .filter((img, i, all): img is Img => Boolean(img?.url) && all.findIndex((x) => x?.url === img?.url) === i)
    .map((img, i) => ({ ...img, _key: `fallback${i}`, size: "full" as const }));
}

/** Half-width images sit in pairs; one without a partner goes full width. */
function pairHalves(items: GalleryItem[]): GalleryItem[] {
  const out = [...items];
  for (let i = 0; i < out.length; i++) {
    if (out[i].size !== "half") continue;
    if (out[i + 1]?.size === "half") i++;
    else out[i] = { ...out[i], size: "full" };
  }
  return out;
}

/** Results as big numbers on dark cards. */
function Stats({ stats }: { stats: ProjectStat[] }) {
  const cols = stats.length >= 4 ? "xl:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : "";
  return (
    <div className="px-gutter">
      <Label className="mb-[clamp(20px,calc(1.3vw+15px),40px)]">Results</Label>
      <ul className={cn("grid grid-cols-2 gap-gap", cols)}>
        {stats.map((s) => (
          <li
            key={s._key ?? s.label}
            data-reveal
            className={cn(
              "on-dark flex min-h-[clamp(150px,calc(8vw+120px),320px)] flex-col justify-end rounded-card bg-coal p-[clamp(18px,calc(1.9vw+11px),48px)] text-white",
              stats.length === 1 && "col-span-2 md:col-span-1",
            )}
          >
            <span className="text-[length:clamp(40px,calc(3.4vw+28px),112px)] leading-[0.9] font-bold tracking-[-0.045em] tabular-nums">
              {s.value}
            </span>
            <span className="mt-[clamp(10px,1vw,20px)] text-base text-white/70">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A case study in the design system: the name in giant type with its line,
 * one big work image, a few facts beside a short summary, results, then the
 * rest of the work as big image cards and the next two projects.
 *
 * Shared by the full page and the full-screen pop-up. In the pop-up the
 * project cards replace the current entry, so Back still closes it.
 */
export function ProjectDetail({
  project,
  more = [],
  inModal = false,
  titleId,
}: {
  project: Project;
  /** The projects after this one, shown as big cards at the end. */
  more?: ProjectCard[];
  inModal?: boolean;
  /** Id on the name, for the pop-up’s aria-labelledby. */
  titleId?: string;
}) {
  const [hero, ...others] = workImages(project);
  const rest = pairHalves(others);
  const stats: ProjectStat[] = project.stats.length
    ? project.stats
    : project.result?.number && project.result.label
      ? [{ value: project.result.number, label: project.result.label }]
      : [];

  type Fact = { label: string; value: React.ReactNode };
  const client = project.client && project.client !== project.name ? project.client : null;
  const facts = (
    [
      client ? { label: "Client", value: client } : null,
      project.location ? { label: "Location", value: project.location } : null,
      project.year ? { label: "Year", value: project.year } : null,
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
    ] as (Fact | null)[]
  ).filter((f): f is Fact => Boolean(f));

  return (
    <article>
      {/* 1. Name, line and the first work image */}
      <header
        className={cn(
          "pb-[clamp(40px,calc(2.3vw+31.4px),76px)]",
          inModal ? "pt-[clamp(32px,calc(2vw+24px),64px)]" : "pt-[clamp(40px,calc(1.57vw+34px),64px)]",
        )}
      >
        <div id={titleId}>
          <GiantHeading
            as={inModal ? "h2" : "h1"}
            labelStyle="pill"
            label={project.industry || project.services.map((s) => s.shortName).join(" · ") || null}
            heading={project.name}
            text={project.tagline}
          />
        </div>
        {hero && (
          <figure className="mx-edge mt-[clamp(40px,calc(2.88vw+29.2px),92px)] overflow-hidden rounded-card bg-night">
            <div className="relative aspect-square sm:aspect-video">
              <CoverMedia
                image={hero}
                video={project.coverVideo}
                priority
                sizes="(min-width: 1440px) 1440px, 100vw"
              />
            </div>
            {hero.caption && <figcaption className="sr-only">{hero.caption}</figcaption>}
          </figure>
        )}
      </header>

      {/* 2. A few facts beside the summary */}
      <section className="px-gutter">
        <div className="rule-dotted" />
        <div className="grid gap-[clamp(32px,2.6vw,48px)] py-[clamp(32px,2.9vw,56px)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-gap">
          <dl className="grid grid-cols-2 content-start gap-x-gap gap-y-[clamp(20px,1.6vw,32px)]">
            {facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="text-small text-mute">{f.label}</dt>
                <dd className="mt-2 text-row [overflow-wrap:break-word]">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="max-w-[32ch] text-[length:clamp(22px,calc(0.84vw+18.8px),36px)] leading-[1.25] tracking-[-0.015em] text-pretty">
            {project.summary}
          </p>
        </div>
        <div className="rule-dotted" />
      </section>

      {/* 3. Results */}
      {stats.length > 0 && (
        <section className="mt-section">
          <Stats stats={stats} />
        </section>
      )}

      {/* 4. The rest of the work, as big image cards almost edge to edge:
             one per row on phones, two per row from tablets up (wide images
             across the full width). */}
      {rest.length > 0 && (
        <section className="mt-section">
          <h3 className="sr-only">More from {project.name}</h3>
          <ul className="grid grid-cols-2 gap-edge px-edge">
            {rest.map((img) => (
              <li key={img._key} data-reveal className={img.size === "half" ? "col-span-2 md:col-span-1" : "col-span-2"}>
                <figure className="relative overflow-hidden rounded-card bg-night">
                  <Media
                    image={img}
                    fill={false}
                    sizes={img.size === "half" ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
                  />
                  {img.caption && (
                    <figcaption className="on-dark absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[clamp(16px,2.4vw,46px)] pt-16 pb-[clamp(16px,2.4vw,40px)] text-base text-white">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Next projects */}
      {more.length > 0 && (
        <section className="mt-section px-gutter">
          <h3 className="mb-[clamp(24px,calc(1.7vw+17.6px),50px)] text-h2 font-medium">Next projects</h3>
          <ul className="@container grid grid-cols-1 gap-gap lg:grid-cols-2">
            {more.map((p) => (
              <li key={p._id}>
                <ProjectBigCard project={p} titleAs="h4" replace={inModal} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
