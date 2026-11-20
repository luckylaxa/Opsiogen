"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProjectCard, ServiceRef } from "@/lib/types";
import { ProjectBigCard } from "./ProjectBigCard";
import { buttonClass } from "@/components/ui/Button";
import { Check, ChevronDown, SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type Props = {
  projects: ProjectCard[];
  services: ServiceRef[];
  pageSize: number;
  /** The page title, rendered between the filter bar and the results. */
  children: React.ReactNode;
  /** Shown between the title and the results (the featured project), hidden while filtering. */
  feature?: React.ReactNode;
  /** The project shown big in `feature`: left out of the list below it until a filter or search is on. */
  featured?: string;
};

const ALL = "";

/**
 * The Work page laid out like the reference's directory: a filter bar
 * (service, industry, year and a search box), the giant title, the featured
 * project, a results line, then every other project as a big dark card, two
 * per row, and Load more. While a filter or search is on, the title and the
 * featured card step aside so the results (every match, the featured project
 * too) come straight after the filter bar.
 */
export function Directory({ projects, services, pageSize, children, feature, featured }: Props) {
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

  // Unfiltered, the featured project is already the big card above, so the list doesn't repeat it.
  const listed = useMemo(
    () => (filtering || !featured ? filtered : filtered.filter((p) => p.slug !== featured)),
    [filtered, filtering, featured],
  );
  const shown = listed.slice(0, visible);
  const count = filtering ? filtered.length : projects.length;

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
          <Select
            label="Service"
            value={service}
            onChange={(v) => update(() => setService(v))}
            options={services.map((s) => ({ value: s.slug, label: s.shortName }))}
          />
          {industries.length > 0 && (
            <Select
              label="Industry"
              value={industry}
              onChange={(v) => update(() => setIndustry(v))}
              options={industries.map((i) => ({ value: i, label: i }))}
            />
          )}
          {years.length > 0 && (
            <Select
              label="Year"
              value={year}
              onChange={(v) => update(() => setYear(v))}
              options={years.map((y) => ({ value: String(y), label: String(y) }))}
            />
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

      {/* While filtering, the title steps aside (kept for screen readers) so the results sit right under the filters. */}
      <div className={filtering ? "sr-only" : undefined}>{children}</div>

      {!filtering && feature}

      <div
        className={cn(
          "mb-[clamp(20px,1.6vw,32px)] flex items-center justify-between gap-4 px-gutter text-base",
          filtering && "mt-[clamp(24px,2vw,40px)]",
        )}
      >
        <p role="status" aria-live="polite">
          <span className="font-semibold tabular-nums">{count}</span>{" "}
          <span className="text-ink-2">{count === 1 ? "project" : "projects"}</span>
        </p>
        {filtering && (
          <button type="button" onClick={clear} className="link-underline">
            Show all work
          </button>
        )}
      </div>

      {shown.length > 0 ? (
        <ul className="@container grid grid-cols-1 gap-gap px-gutter lg:grid-cols-2">
          {shown.map((p) => (
            <li key={p._id}>
              <ProjectBigCard project={p} titleAs="h2" />
            </li>
          ))}
        </ul>
      ) : (
        (
          <p className="px-gutter py-16 text-center text-lead text-ink-2">
            No projects match.{" "}
            <button type="button" onClick={clear} className="link-underline text-ink">
              Show all work
            </button>
          </p>
        )
      )}

      {listed.length > visible && (
        <div className="mt-[clamp(48px,calc(3.14vw+36.2px),96px)] flex justify-center">
          <button type="button" onClick={() => setVisible((v) => v + pageSize)} className={buttonClass("outline", "md")}>
            <span className="btn-label">Load more</span>
          </button>
        </div>
      )}
    </div>
  );
}

function unique(values: (string | null | undefined)[]) {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

/**
 * A filter dropdown drawn in the site's own style (the browser's own list looked out of place, Lucky 20 Nov): a button
 * that opens a list. Keyboard: arrows, Home, End, a letter to jump, Enter or Space to choose, Escape to close.
 * Choosing the first item (the filter's name) clears the filter.
 */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const items = useMemo(() => [{ value: ALL, label }, ...options], [label, options]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const current = items.find((o) => o.value === value);
  const selectedIndex = Math.max(0, items.findIndex((o) => o.value === value));

  const show = (index = selectedIndex) => {
    setActive(index);
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  };
  const choose = (index: number) => {
    onChange(items[index].value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = items.length - 1;
    const move = (to: number) => {
      e.preventDefault();
      setActive(Math.min(last, Math.max(0, to)));
    };
    if (e.key === "ArrowDown") move(active + 1);
    else if (e.key === "ArrowUp") move(active - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(last);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const from = items.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
      const next = from >= 0 ? from : items.findIndex((o) => o.label.toLowerCase().startsWith(k));
      if (next >= 0) move(next);
    }
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={value ? `${label}: ${current?.label}` : label}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            show();
          }
        }}
        className={cn(
          "flex h-[clamp(38px,calc(0.5vw+36px),46px)] max-w-[60vw] items-center gap-2 rounded-[6px] border pr-3 pl-[clamp(12px,0.9vw,16px)] text-base whitespace-nowrap transition-colors",
          value ? "border-ink bg-ink text-on-ink" : "border-ink/10 bg-surface text-ink hover:border-ink/40",
        )}
      >
        <span className="truncate">{value ? current?.label : label}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
          className="absolute top-[calc(100%+6px)] left-0 z-30 max-h-[min(360px,60vh)] min-w-full w-max max-w-[min(320px,90vw)] overflow-y-auto overscroll-contain rounded-[8px] border border-ink/10 bg-surface p-1 shadow-[0_16px_40px_rgb(0_0_0/0.35)] outline-none"
        >
          {items.map((o, i) => {
            const selected = i === selectedIndex;
            return (
              <li
                key={o.value || "all"}
                id={`${id}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                onPointerMove={() => active !== i && setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-[6px] px-3 py-2 text-base",
                  i === active && "bg-ink/[0.07]",
                  i === 0 && "text-ink-2",
                )}
              >
                {o.label}
                {selected && <Check className="size-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
