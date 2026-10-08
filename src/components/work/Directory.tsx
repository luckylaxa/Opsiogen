"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectCard, ServiceRef } from "@/lib/types";
import { BigCard } from "@/components/ui/BigCard";
import { Media } from "@/components/ui/Media";
import { buttonClass } from "@/components/ui/Button";
import { ChevronDown, SearchIcon } from "@/components/ui/Icons";
import { cn, initials } from "@/lib/utils";

type Props = {
  projects: ProjectCard[];
  services: ServiceRef[];
  pageSize: number;
  /** The page title, rendered between the filter bar and the results. */
  children: React.ReactNode;
};

const ALL = "";

/**
 * The Work page laid out like the reference's directory: a filter bar
 * (service, industry, year and a search box), the giant title, a results
 * line, two featured dark cards and a three-column grid of project cards
 * with their details, then Load more.
 */
export function Directory({ projects, services, pageSize, children }: Props) {
  const [service, setService] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(pageSize);

  const industries = useMemo(() => unique(projects.map((p) => p.industry)), [projects]);
  const years = useMemo(() => unique(projects.map((p) => p.year)).sort().reverse(), [projects]);
  const filtering = Boolean(service || industry || year || query.trim());

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return projects.filter((p) => {
      if (service && !p.services.some((s) => s.slug === service)) return false;
      if (industry && p.industry !== industry) return false;
      if (year && p.year !== year) return false;
      if (!words.length) return true;
      const hay = [p.name, p.client, p.industry, p.year, ...p.services.flatMap((s) => [s.name, s.shortName])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [projects, service, industry, year, query]);

  // Two featured cards up top until the visitor narrows the list.
  // The grid still lists every project, featured ones included.
  const featured = filtering || filtered.length < 4 ? [] : filtered.slice(0, 2);
  const rest = filtered;
  const shown = rest.slice(0, visible);

  const update = (fn: () => void) => {
    fn();
    setVisible(pageSize);
  };
  const clear = () =>
    update(() => {
      setService(ALL);
      setIndustry(ALL);
      setYear(ALL);
      setQuery("");
    });

  return (
    <div data-dock="/work">
      <div className="px-gutter pt-[clamp(8px,0.6vw,12px)]">
        <div
          role="search"
          aria-label="Filter work"
          className="flex flex-wrap items-center gap-2 rounded-[8px] bg-band p-[clamp(6px,0.45vw,8px)] lg:flex-nowrap"
        >
          <Select label="Service" value={service} onChange={(v) => update(() => setService(v))}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.shortName}
              </option>
            ))}
          </Select>
          {industries.length > 0 && (
            <Select label="Industry" value={industry} onChange={(v) => update(() => setIndustry(v))}>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          )}
          {years.length > 0 && (
            <Select label="Year" value={year} onChange={(v) => update(() => setYear(v))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          )}
          <label className="flex h-[clamp(38px,calc(0.5vw+36px),46px)] min-w-[200px] flex-1 basis-full items-center gap-2 rounded-[6px] px-3 focus-within:bg-surface lg:basis-auto">
            <SearchIcon className="size-[1.1em] shrink-0 text-ink-2" />
            <span className="sr-only">Search work</span>
            <input
              type="search"
              value={query}
              onChange={(e) => update(() => setQuery(e.target.value))}
              placeholder="Search by name, client or industry"
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-2 [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          {filtering && (
            <button type="button" onClick={clear} className="h-[clamp(38px,calc(0.5vw+36px),46px)] shrink-0 rounded-[6px] px-4 text-base font-medium underline-offset-4 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      {children}

      <div className="mb-[clamp(20px,1.6vw,32px)] flex items-center justify-between gap-4 px-gutter text-base">
        <p role="status" aria-live="polite">
          <span className="font-semibold tabular-nums">{filtered.length}</span>{" "}
          <span className="text-ink-2">{filtered.length === 1 ? "project" : "projects"}</span>
        </p>
        {filtering && (
          <button type="button" onClick={clear} className="link-underline">
            Show all work
          </button>
        )}
      </div>

      {featured.length > 0 && (
        <ul className="@container mb-gap hidden gap-gap px-gutter md:grid lg:grid-cols-2">
          {featured.map((p) => (
            <li key={p._id}>
              <FeaturedCard project={p} />
            </li>
          ))}
        </ul>
      )}

      {shown.length > 0 ? (
        <ul className="grid gap-gap px-gutter sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p._id}>
              <DirectoryCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        featured.length === 0 && (
          <p className="px-gutter py-16 text-center text-lead text-ink-2">
            No projects match.{" "}
            <button type="button" onClick={clear} className="link-underline text-ink">
              Show all work
            </button>
          </p>
        )
      )}

      {rest.length > visible && (
        <div className="mt-[clamp(48px,calc(3.14vw+36.2px),96px)] flex justify-center">
          <button type="button" onClick={() => setVisible((v) => v + pageSize)} className={buttonClass("outline", "md")}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function unique(values: (string | null | undefined)[]) {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-[clamp(38px,calc(0.5vw+36px),46px)] cursor-pointer appearance-none rounded-[6px] border pl-[clamp(12px,0.9vw,16px)] pr-9 text-base transition-colors",
          value ? "border-ink bg-ink text-on-ink" : "border-ink/10 bg-surface text-ink hover:border-ink/40",
        )}
      >
        <option value={ALL}>{label}</option>
        {children}
      </select>
      <ChevronDown
        className={cn("pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2", value ? "text-on-ink" : "text-ink")}
      />
    </label>
  );
}

/** Dark card from the reference directory's featured row. */
function FeaturedCard({ project }: { project: ProjectCard }) {
  return (
    <BigCard
      href={`/work/${project.slug}`}
      badge={initials(project.client)}
      image={project.cover}
      dots={project.services.length}
      label={project.industry}
      title={project.name}
      titleAs="h2"
      stat={project.year ? { label: "Year", value: String(project.year) } : null}
      footLeft={<span className="block truncate">{project.client}</span>}
      footRight={project.services.map((s) => s.shortName).join(" · ")}
    />
  );
}

/**
 * Directory card: image, then the name and a small table of details, spaced
 * like the reference (about 574 × 913 on a 1903px screen).
 */
function DirectoryCard({ project }: { project: ProjectCard }) {
  const rows: [string, React.ReactNode][] = [
    ["Client", project.client],
    ...(project.industry ? ([["Industry", project.industry]] as [string, React.ReactNode][]) : []),
  ];
  return (
    <article data-reveal className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface">
      <div className="relative aspect-[4/3] overflow-hidden bg-night">
        <Media
          image={project.cover}
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
          className="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col px-[clamp(18px,2.2vw,42px)] pb-[clamp(22px,4.2vw,80px)] pt-[clamp(18px,3.05vw,58px)]">
        <h2 className="flex items-center gap-[clamp(10px,0.8vw,14px)] text-title font-medium">
          <span
            aria-hidden="true"
            className="grid size-[clamp(30px,calc(0.6vw+26px),40px)] shrink-0 place-items-center rounded-full bg-coal text-[length:clamp(10px,0.6vw,12px)] font-semibold text-white"
          >
            {initials(project.client)}
          </span>
          <Link
            href={`/work/${project.slug}`}
            className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
          >
            {project.name}
          </Link>
          {project.year && <span className="self-start text-[length:clamp(9px,0.5vw,10px)] uppercase tracking-[0.04em] text-mute">{project.year}</span>}
        </h2>
        <dl className="mt-[clamp(20px,5vw,95px)] grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)] gap-x-4 gap-y-[clamp(14px,3.63vw,69px)] text-small">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-medium">{k}</dt>
              <dd className="truncate text-mute">{v}</dd>
            </div>
          ))}
          {project.services.length > 0 && (
            <div className="contents">
              <dt className="self-center font-medium">Services</dt>
              <dd>
                <ul className="flex w-fit flex-wrap overflow-hidden rounded-[4px] border border-ink/15">
                  {project.services.map((s) => (
                    <li key={s.slug} className="border-r border-ink/15 px-2 py-1 text-center text-[length:clamp(10px,0.6vw,12px)] last:border-r-0">
                      {s.shortName}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
