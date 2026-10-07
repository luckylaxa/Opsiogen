"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export type SearchItem = {
  kind: "work" | "service";
  title: string;
  subtitle: string;
  href: string;
  /** Extra words to match on (client, industry, services, group…). */
  keywords: string;
  image?: { url: string; alt: string } | null;
  mark?: string;
};

const SUGGESTED = 4;

/**
 * Header search from the reference ("Search by inspiration"), searching
 * Opsiogen's projects and services as you type. Arrow keys move through the
 * results, Enter opens one, Escape closes. Press “/” anywhere to jump in.
 */
export function SiteSearch({
  items,
  placeholder = "Search work and services",
  className,
  autoFocus,
}: {
  items: SearchItem[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...items.filter((i) => i.kind === "work").slice(0, SUGGESTED),
        ...items.filter((i) => i.kind === "service").slice(0, SUGGESTED),
      ];
    }
    const words = q.split(/\s+/);
    return items
      .map((item) => {
        const title = item.title.toLowerCase();
        const hay = `${title} ${item.subtitle} ${item.keywords}`.toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2;
        return { item, score };
      })
      .filter((r): r is { item: SearchItem; score: number } => r !== null)
      .sort((a, b) => a.score - b.score)
      .map((r) => r.item);
  }, [items, query]);

  const groups = (["work", "service"] as const)
    .map((kind) => ({ kind, list: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.list.length > 0);
  const flat = groups.flatMap((g) => g.list);

  // “/” focuses the search unless the visitor is typing somewhere else.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const el = input.current;
      if (!el || !el.checkVisibility({ visibilityProperty: true })) return;
      e.preventDefault();
      el.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close when clicking or tabbing outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const go = (item?: SearchItem) => {
    if (!item) return;
    setOpen(false);
    setQuery("");
    input.current?.blur();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else {
        setOpen(false);
        input.current?.blur();
      }
    }
  };

  const listId = `${id}-results`;
  const optionId = (i: number) => `${id}-option-${i}`;
  let index = -1;

  return (
    <div ref={root} className={cn("relative", className)} onBlur={(e) => !root.current?.contains(e.relatedTarget) && setOpen(false)}>
      <div className="flex h-[clamp(42px,calc(0.65vw+39.5px),52px)] items-center gap-3 rounded-[var(--radius-btn)] bg-field px-[clamp(12px,0.9vw,18px)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        <SearchIcon className="size-[1.15em] shrink-0 text-ink-2" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-label="Search work and services"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && flat.length ? optionId(active) : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-2 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd aria-hidden="true" className="hidden rounded-[4px] border border-ink/20 px-1.5 text-small leading-5 text-mute xl:block">
          /
        </kbd>
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,560px)] min-w-[min(440px,calc(100vw-32px))] overflow-y-auto rounded-card bg-surface p-2 dark:ring-1 dark:ring-white/10 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.05)]"
        >
          {groups.length === 0 && (
            <div className="px-3 py-6 text-base text-ink-2" role="status">
              No matches for “{query.trim()}”.{" "}
              <Link href="/work" className="link-underline text-ink" onClick={() => setOpen(false)}>
                View all work
              </Link>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.kind} role="group" aria-label={group.kind === "work" ? "Work" : "Services"} className="py-1">
              <p className="px-3 pb-1 pt-2 text-small text-mute">{group.kind === "work" ? "Work" : "Services"}</p>
              {group.list.map((item) => {
                index += 1;
                const i = index;
                const on = i === active;
                return (
                  <Link
                    key={item.href}
                    id={optionId(i)}
                    role="option"
                    aria-selected={on}
                    tabIndex={-1}
                    href={item.href}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn("flex items-center gap-3 rounded-[8px] px-3 py-2", on && "bg-band")}
                  >
                    {item.image ? (
                      <span aria-hidden="true" className="relative h-[38px] w-[50px] shrink-0 overflow-hidden rounded-[4px] bg-night">
                        <Image src={item.image.url} alt="" fill sizes="50px" className="object-cover" />
                      </span>
                    ) : (
                      <span aria-hidden="true" className="grid h-[38px] w-[50px] shrink-0 place-items-center rounded-[4px] bg-coal text-small font-semibold text-white">
                        {item.mark}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium">{item.title}</span>
                      <span className="block truncate text-small text-mute">{item.subtitle}</span>
                    </span>
                    <ArrowRight className={cn("size-4 shrink-0 transition-opacity", on ? "opacity-100" : "opacity-0")} />
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
