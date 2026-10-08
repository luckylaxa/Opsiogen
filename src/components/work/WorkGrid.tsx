"use client";

import { useMemo, useState } from "react";
import type { ProjectCard as Card, ServiceRef } from "@/lib/types";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";

type Props = {
  projects: Card[];
  /** Service filter chips (All + each service by short name). Omit to hide filters. */
  filters?: ServiceRef[];
  pageSize: number;
  headingLevel?: "h2" | "h3";
};

export function WorkGrid({ projects, filters, pageSize, headingLevel }: Props) {
  const [active, setActive] = useState<string>("all");
  const [visible, setVisible] = useState(pageSize);

  const filtered = useMemo(
    () => (active === "all" ? projects : projects.filter((p) => p.services.some((s) => s.slug === active))),
    [active, projects],
  );
  const shown = filters ? filtered.slice(0, visible) : filtered.slice(0, pageSize);

  const choose = (slug: string) => {
    setActive(slug);
    setVisible(pageSize);
  };

  return (
    <div className="px-gutter">
      {filters && (
        <div role="group" aria-label="Filter projects by service" className="mb-[clamp(32px,calc(2.3vw+23.4px),70px)] flex flex-wrap gap-[clamp(6px,0.42vw,8px)]">
          {[{ slug: "all", shortName: "All" }, ...filters].map((f) => {
            const on = active === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                aria-pressed={on}
                onClick={() => choose(f.slug)}
                className={cn(
                  "h-[clamp(38px,calc(0.72vw+35.3px),49px)] rounded-[7px] border px-[clamp(14px,calc(0.33vw+12.8px),19px)] text-base transition-[background-color,border-color,color] duration-300",
                  on ? "border-ink bg-ink text-on-ink" : "border-ink/15 bg-transparent text-ink hover:border-ink/60",
                )}
              >
                {f.shortName}
              </button>
            );
          })}
        </div>
      )}

      {shown.length > 0 ? (
        <ul className="grid grid-cols-1 gap-x-gap gap-y-[clamp(32px,2.47vw,47px)] sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <li key={project._id}>
              <ProjectCard project={project} headingLevel={headingLevel} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-lead text-ink-2" role="status">
          No projects yet.
        </p>
      )}

      {filters && filtered.length > visible && (
        <div className="mt-[clamp(48px,calc(3.14vw+36.2px),96px)] flex justify-center">
          <button type="button" onClick={() => setVisible((v) => v + pageSize)} className={buttonClass("outline", "md")}>
            Load more
          </button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {filters ? `${Math.min(visible, filtered.length)} of ${filtered.length} projects shown` : ""}
      </p>
    </div>
  );
}
