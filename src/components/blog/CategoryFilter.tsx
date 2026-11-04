"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Category chips for the blog. The posts are server-rendered; choosing a
 * category hides the others (by their data-category) inside `target`, so the
 * filter ships almost no JavaScript and every post is in the HTML.
 */
export function CategoryFilter({ categories, target }: { categories: string[]; target: string }) {
  const [active, setActive] = useState("");

  const choose = (category: string) => {
    setActive(category);
    document.querySelectorAll<HTMLElement>(`#${target} [data-category]`).forEach((el) => {
      el.hidden = Boolean(category) && el.dataset.category !== category;
    });
  };

  return (
    <div role="group" aria-label="Filter posts by category" className="flex flex-wrap gap-2">
      {["", ...categories].map((c) => (
        <button
          key={c || "all"}
          type="button"
          aria-pressed={active === c}
          onClick={() => choose(c)}
          className={cn(
            "rounded-[var(--radius-btn)] border px-[1em] py-[0.5em] text-base transition-colors duration-300",
            active === c ? "border-ink bg-ink text-on-ink" : "border-line text-ink hover:border-ink/60",
          )}
        >
          {c || "All"}
        </button>
      ))}
    </div>
  );
}
