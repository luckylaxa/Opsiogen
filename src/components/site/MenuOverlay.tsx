"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { LinkItem } from "@/lib/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
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
 * (and the header on phones): always dark, with oversized numbered page links
 * that rise in turn, and the search and contact beside them. Wipes down to
 * open and up to close.
 *
 * Work and Services open in place, one at a time: a link to the whole
 * section, then a row for each project or service.
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
  const [expanded, setExpanded] = useState<string | null>(null);

  const subItems: Record<string, { all: string; rows: SubRow[] }> = {};
  const services = groups.flatMap((g) => g.services);
  if (services.length) {
    subItems["/services"] = {
      all: "All services",
      rows: services.map((s) => ({
        href: s.href,
        title: s.name,
        text: s.tagline,
        icon: <ServiceIcon slug={s.slug} className="size-[clamp(24px,calc(0.4vw+21px),30px)] text-white/70" />,
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
            {p.image && <Image src={p.image.url} alt="" fill sizes="68px" className="object-cover" />}
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

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    if (open) {
      document.documentElement.style.overflow = "hidden";
      gsap.set(el, { visibility: "visible" });
      const tl = gsap.timeline();
      tl.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.6, ease: "power3.inOut" },
      ).fromTo(
        el.querySelectorAll("[data-menu-item]"),
        { y: reduce ? 0 : 40, opacity: 0 },
        { y: 0, opacity: 1, duration: reduce ? 0 : 0.5, ease: "power3.out", stagger: reduce ? 0 : 0.06 },
        reduce ? 0 : "-=0.25",
      );
      el.querySelector<HTMLElement>("[data-menu-close]")?.focus();
      return () => {
        tl.kill();
      };
    }
    document.documentElement.style.overflow = "";
    if (getComputedStyle(el).visibility === "hidden") return;
    const tl = gsap.to(el, {
      clipPath: "inset(0 0 100% 0)",
      duration: reduce ? 0 : 0.45,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(el, { visibility: "hidden" });
        setExpanded(null);
      },
    });
    return () => {
      tl.kill();
    };
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
      className="on-dark invisible fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0a090d] px-gutter pb-[clamp(24px,2.4vw,44px)] text-white"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className="flex h-[clamp(64px,4.6vw,88px)] shrink-0 items-center justify-between">
        <Link href="/" className="link-fade" onClick={closeMenu} aria-label="Home">
          {wordmark}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-white hover:bg-white/10" />
          <button
            type="button"
            data-menu-close
            onClick={closeMenu}
            className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/25 text-white transition-colors duration-300 hover:border-white/60"
            aria-label="Close menu"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </div>

      <div className="mt-[clamp(24px,4vh,64px)] grid flex-1 gap-y-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-[clamp(40px,5vw,110px)]">
        <nav aria-label="Menu" className="flex flex-col justify-end">
          <ul className="border-b border-white/10">
            {menu.map((item, i) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const sub = subItems[item.href];
              const isOpen = expanded === item.href;
              const panelId = `${id}-${i}`;
              const label = (
                <>
                  <span className="w-[2ch] shrink-0 text-small tracking-[0.08em] text-white/45 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span data-menu-item className="flex items-center gap-[clamp(10px,1vw,20px)]">
                    <span className="grad-hover text-[length:clamp(44px,calc(5.2vw+24px),124px)] leading-[0.95] font-semibold tracking-[-0.045em] group-aria-[current=page]:text-white/55">
                      {item.label}
                    </span>
                    {sub && (
                      <ChevronDown
                        className={cn(
                          "size-[clamp(24px,calc(1.6vw+18px),52px)] shrink-0 text-white/60 transition-transform duration-500 ease-[var(--ease-out-soft)] motion-reduce:transition-none",
                          isOpen && "-rotate-180",
                        )}
                      />
                    )}
                  </span>
                </>
              );
              const row = "group flex w-full items-baseline gap-[clamp(14px,1.4vw,28px)] overflow-hidden py-[clamp(6px,0.8vw,14px)] text-left";
              return (
                <li key={item._key ?? item.href} className="border-t border-white/10">
                  {sub ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setExpanded(isOpen ? null : item.href)}
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

        <div className="flex flex-col gap-10 lg:justify-end">
          <div data-menu-item className="theme-light relative z-10 text-ink">
            <SiteSearch items={searchItems} />
          </div>
          <div data-menu-item className="flex flex-col gap-5">
            {email && (
              <a href={`mailto:${email}`} className="link-accent w-fit text-base text-white/80">
                {email}
              </a>
            )}
            <SocialLinks items={socialLinks} onDark />
            <Link href={button.href} className={buttonClass("light", "lg", "w-fit")}>
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
              className="group flex items-center justify-between gap-4 rounded-[var(--radius-btn)] bg-white/[0.08] px-[clamp(14px,1.2vw,22px)] py-[clamp(12px,1vw,18px)] text-row font-medium transition-colors duration-300 hover:bg-white/[0.13]"
            >
              <span className="grad-hover">{allLabel}</span>
              <ArrowUpRight className="size-[1.1em] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <ul className="mt-[clamp(6px,0.6vw,10px)] grid lg:grid-cols-2 lg:gap-x-gap">
              {rows.map((r) => (
                <li key={r.href} className="border-b border-white/10 last:border-b-0 lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
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
                      <span className="mt-0.5 block truncate text-small text-white/55">{r.text}</span>
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
