"use client";

import Image from "next/image";
import { loaderFor } from "@/lib/sanityImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { LinkItem } from "@/lib/types";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ChevronDown, CloseIcon, ServiceIcon } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";
import { useMenu } from "./MenuContext";
import type { MenuGroup } from "./NavMenu";
import { SiteSearch, type SearchItem } from "./SiteSearch";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

/** How many projects the Work item lists before its "All work" link. */
const WORK_ROWS = 6;

/** One row in an opened menu item: a name, a grey line and an icon or thumbnail. */
type SubRow = { href: string; title: string; text: string; icon: React.ReactNode; project?: boolean };

/**
 * The full-screen menu from the design system, opened from the floating menu
 * (and the header on phones): white in the light theme and dark in the dark one,
 * with the header's logo, oversized numbered page links from the top that rise
 * in turn, and the search and contact beside them. Wipes down to open and up to close.
 *
 * Work and Services open in place: a link to the whole section, then a row
 * for each project or service. A list grows downward from its name, so
 * nothing above it moves.
 */
export function MenuOverlay({
  menu,
  button,
  wordmark,
  searchItems,
  groups,
  email,
  socialLinks,
}: {
  menu: LinkItem[];
  button: LinkItem;
  wordmark: React.ReactNode;
  searchItems: SearchItem[];
  groups: MenuGroup[];
  email?: string | null;
  socialLinks: LinkItem[];
}) {
  const { open, closeMenu } = useMenu();
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const id = useId();
  const [expanded, setExpanded] = useState<string[]>([]);
  // Thumbnails load once the menu has been opened, not with every page.
  const [primed, setPrimed] = useState(false);
  if (open && !primed) setPrimed(true);

  const toggle = (href: string) =>
    setExpanded((list) => (list.includes(href) ? list.filter((h) => h !== href) : [...list, href]));

  const subItems: Record<string, { all: string; rows: SubRow[] }> = {};
  const services = groups.flatMap((g) => g.services);
  if (services.length) {
    subItems["/services"] = {
      all: "All services",
      rows: services.map((s) => ({
        href: s.href,
        title: s.name,
        text: s.tagline,
        icon: <ServiceIcon slug={s.slug} className="size-[clamp(24px,calc(0.4vw+21px),30px)] text-ink/70" />,
      })),
    };
  }
  const work = searchItems.filter((it) => it.kind === "work").slice(0, WORK_ROWS);
  if (work.length) {
    subItems["/work"] = {
      all: "All work",
      rows: work.map((p) => ({
        href: p.href,
        title: p.title,
        // Client · industry, without the client when it is the project's name.
        text: p.subtitle
          .split(" · ")
          .filter((part) => part !== p.title)
          .join(" · "),
        project: true,
        icon: (
          <span className="relative block aspect-[4/3] h-[clamp(40px,calc(0.6vw+36px),50px)] overflow-hidden rounded-[6px] bg-night">
            {primed && p.image && <Image src={p.image.url} loader={loaderFor(p.image.url)} alt="" fill sizes="68px" className="object-cover" />}
          </span>
        ),
      })),
    };
  }

  // Close after navigating.
  useEffect(() => {
    if (lastPath.current !== pathname && open) closeMenu();
    lastPath.current = pathname;
  }, [pathname, open, closeMenu]);

  // The wipe and the staggered items are CSS (.site-menu in globals.css).
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (open) {
      document.documentElement.style.overflow = "hidden";
      el.querySelector<HTMLElement>("[data-menu-close]")?.focus();
      return;
    }
    document.documentElement.style.overflow = "";
    // Once the panel has wiped away, fold the lists back up.
    const reset = window.setTimeout(
      () => setExpanded([]),
      prefersReducedMotion() ? 0 : 450,
    );
    return () => window.clearTimeout(reset);
  }, [open]);

  // Escape to close and keep focus inside while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a, button")).filter((el) => !el.closest("[inert]"));
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  return (
    <div
      ref={panel}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-open={open || undefined}
      className="site-menu fixed inset-0 z-50 flex flex-col overflow-y-auto bg-surface px-gutter pb-[clamp(24px,2.4vw,44px)] text-ink dark:bg-page"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
        <Link href="/" className="link-fade" onClick={closeMenu} aria-label="Home">
          {wordmark}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hover:bg-ink/[0.07]" />
          <button
            type="button"
            data-menu-close
            onClick={closeMenu}
            className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-ink/25 text-ink transition-colors duration-300 hover:border-ink/60"
            aria-label="Close menu"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </div>

      {/* Phones and tablets: the names in a list under the logo, then search and contact.
          Wide screens: giant names from the top, search and contact beside them. */}
      <div className="mt-[clamp(8px,1.5vh,16px)] flex flex-1 flex-col gap-y-10 lg:mt-[clamp(32px,7vh,104px)] lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-[clamp(40px,5vw,110px)]">
        <nav aria-label="Menu" className="flex flex-col">
          <ul className="border-b border-ink/10">
            {menu.map((item, i) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const sub = subItems[item.href];
              const isOpen = expanded.includes(item.href);
              const panelId = `${id}-${i}`;
              const label = (
                <>
                  <span className="w-[2ch] shrink-0 text-small tracking-[0.08em] text-ink/45 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span data-menu-item style={{ "--i": i } as React.CSSProperties} className="flex flex-1 items-center gap-[clamp(10px,1vw,20px)]">
                    <span className="grad-hover text-[length:clamp(22px,calc(1.6vw+16px),32px)] leading-[1.1] font-medium tracking-[-0.02em] group-aria-[current=page]:text-ink/55 lg:text-[length:clamp(44px,calc(5.2vw+24px),124px)] lg:leading-[0.95] lg:font-semibold lg:tracking-[-0.045em]">
                      {item.label}
                    </span>
                    {sub && (
                      <ChevronDown
                        className={cn(
                          "ml-auto size-5 shrink-0 text-ink/60 transition-transform duration-500 ease-[var(--ease-out-soft)] motion-reduce:transition-none lg:ml-0 lg:size-[clamp(24px,calc(1.6vw+18px),52px)]",
                          isOpen && "-rotate-180",
                        )}
                      />
                    )}
                  </span>
                </>
              );
              const row =
                "group flex w-full items-baseline gap-[clamp(14px,1.4vw,28px)] overflow-hidden py-[clamp(13px,1.6vw,18px)] text-left lg:py-[clamp(6px,0.8vw,14px)]";
              return (
                <li key={item._key ?? item.href} className="border-t border-ink/10">
                  {sub ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-current={active ? "page" : undefined}
                        onClick={() => toggle(item.href)}
                        className={row}
                      >
                        {label}
                      </button>
                      <SubPanel
                        id={panelId}
                        open={isOpen}
                        allHref={item.href}
                        allLabel={sub.all}
                        rows={sub.rows}
                        onNavigate={closeMenu}
                      />
                    </>
                  ) : (
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={row}>
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Wide screens: stays in view while a list opens beside it. */}
        <div className="flex flex-col gap-10 lg:sticky lg:top-0 lg:self-start">
          <div data-menu-item style={{ "--i": menu.length } as React.CSSProperties} className="relative z-10">
            <SiteSearch items={searchItems} />
          </div>
          <div data-menu-item style={{ "--i": menu.length + 1 } as React.CSSProperties} className="flex flex-col gap-5">
            {email && (
              <a href={`mailto:${email}`} className="link-accent w-fit text-base text-ink/80">
                {email}
              </a>
            )}
            <SocialLinks items={socialLinks} />
            <Link href={button.href} className={buttonClass("dark", "lg", "w-fit")}>
              <span className="btn-label">{button.label}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * An opened menu item: a highlighted link to the whole section, then rows
 * split by hairlines. Height eases open; closed, it is inert so Tab skips it.
 */
function SubPanel({
  id,
  open,
  allHref,
  allLabel,
  rows,
  onNavigate,
}: {
  id: string;
  open: boolean;
  allHref: string;
  allLabel: string;
  rows: SubRow[];
  onNavigate: () => void;
}) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)] motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="flex gap-[clamp(14px,1.4vw,28px)] pt-[clamp(8px,1vw,16px)] pb-[clamp(20px,2vw,36px)]">
          {/* Lines the rows up under the item's name, past its number. */}
          <span aria-hidden="true" className="hidden w-[2ch] shrink-0 text-small sm:block" />
          <div className="min-w-0 flex-1">
            <Link
              href={allHref}
              onClick={onNavigate}
              className="group flex items-center justify-between gap-4 rounded-[var(--radius-btn)] bg-ink/[0.06] px-[clamp(14px,1.2vw,22px)] py-[clamp(12px,1vw,18px)] text-row font-medium transition-colors duration-300 hover:bg-ink/[0.1]"
            >
              <span className="grad-hover">{allLabel}</span>
              <ArrowUpRight className="size-[1.1em] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <ul className="mt-[clamp(6px,0.6vw,10px)] grid lg:grid-cols-2 lg:gap-x-gap">
              {rows.map((r) => (
                <li key={r.href} className="border-b border-ink/10 last:border-b-0 lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                  <Link
                    href={r.href}
                    scroll={r.project ? false : undefined}
                    onClick={onNavigate}
                    className="icon-grad group flex items-center justify-between gap-4 py-[clamp(14px,1.2vw,20px)]"
                  >
                    <span className="min-w-0">
                      <span className="block text-row font-medium">
                        <span className="grad-hover">{r.title}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-small text-ink/55">{r.text}</span>
                    </span>
                    <span className="flex shrink-0">{r.icon}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
