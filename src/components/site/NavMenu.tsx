"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LinkItem, ServiceGroup } from "@/lib/types";
import { ArrowRight, ChevronDown, CloseIcon, ServiceIcon } from "@/components/ui/Icons";
import { AccentText } from "@/components/ui/Headings";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type MenuGroup = {
  group: ServiceGroup;
  label: string;
  services: { name: string; slug: string; tagline: string; href: string }[];
};

/**
 * Main navigation. Services opens a full-screen overlay listing every service
 * by group (see ServicesItem).
 */
export function NavMenu({ menu, groups, button }: { menu: LinkItem[]; groups: MenuGroup[]; button: LinkItem }) {
  return (
    <nav aria-label="Main" className="ml-[clamp(40px,4.2vw,80px)] hidden lg:block">
      <ul className="flex items-center gap-[clamp(18px,1.3vw,25px)]">
        {menu.map((item) => (
          <li key={item._key ?? item.href}>
            {item.href === "/services" && groups.length > 0 ? (
              <ServicesItem item={item} groups={groups} button={button} />
            ) : (
              <Link href={item.href} className="link-accent text-base">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The Services item: a click opens the services full screen, in the style of
 * the main menu (it wipes down and the groups rise in turn; .site-menu in
 * globals.css). Each service is a large row with its icon, name and line.
 * Closes with the close button, Escape, or by choosing a link; focus stays
 * inside while it is open and returns to the Services button after.
 */
function ServicesItem({ item, groups, button }: { item: LinkItem; groups: MenuGroup[]; button: LinkItem }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // The overlay is added to the page on the first open, then kept so it can animate closed.
  const [primed, setPrimed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a, button"));
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
    return () => {
      root.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const total = groups.reduce((n, g) => n + g.services.length, 0);
  // Running numbers across the groups: where each group's count starts.
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.services.length, 0));

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-haspopup="dialog"
        onClick={() => {
          setPrimed(true);
          setOpen((o) => !o);
        }}
        className="link-accent inline-flex items-center gap-1 text-base"
      >
        {item.label}
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      {primed &&
        createPortal(
          <div
            ref={panel}
            id={`${id}-panel`}
            role="dialog"
            aria-modal="true"
            aria-label={item.label}
            data-open={open || undefined}
            className="site-menu on-dark fixed inset-0 z-[55] flex flex-col overflow-y-auto overscroll-contain bg-[#0a090d] px-gutter pb-[clamp(28px,2.6vw,52px)] text-white"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between">
              <p className="text-small uppercase tracking-[0.18em] text-white/55">
                {item.label} <span className="tabular-nums text-white/35">· {String(total).padStart(2, "0")}</span>
              </p>
              <button
                type="button"
                data-close
                onClick={() => close()}
                aria-label={`Close ${item.label.toLowerCase()}`}
                className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/25 text-white transition-colors duration-300 hover:border-white/60"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <p
              data-menu-item
              style={{ "--i": 0 } as React.CSSProperties}
              className="mt-[clamp(20px,3vw,64px)] text-[length:clamp(40px,calc(4.4vw+20px),120px)] leading-[0.92] font-bold tracking-[-0.045em] uppercase"
            >
              <AccentText text={`Our ${item.label}`} />
            </p>

            <div className="mt-[clamp(32px,4vw,88px)] grid gap-x-gap gap-y-12 lg:grid-cols-3">
              {groups.map((g, gi) => (
                <section key={g.group} data-menu-item style={{ "--i": gi + 1 } as React.CSSProperties}>
                  <h2 className="flex items-baseline justify-between pb-4 text-small uppercase tracking-[0.18em] text-white/55">
                    {g.label}
                    <span className="tabular-nums text-white/35">{String(g.services.length).padStart(2, "0")}</span>
                  </h2>
                  <ul className="border-b border-white/10">
                    {g.services.map((s, si) => {
                      const index = starts[gi] + si + 1;
                      return (
                        <li key={s.href} className="border-t border-white/10">
                          <Link
                            href={s.href}
                            onClick={() => close(false)}
                            aria-current={pathname === s.href ? "page" : undefined}
                            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-[clamp(14px,1.2vw,24px)] py-[clamp(16px,1.4vw,26px)]"
                          >
                            <span className="grid size-[clamp(40px,2.6vw,52px)] place-items-center rounded-[10px] border border-white/15 text-white/80 transition-colors duration-300 group-hover:border-white/40 group-hover:text-white">
                              <ServiceIcon slug={s.slug} className="size-[46%]" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-baseline gap-3">
                                <span className="text-small tabular-nums text-white/35">{String(index).padStart(2, "0")}</span>
                                <span className="grad-hover text-[length:clamp(20px,calc(0.8vw+16px),30px)] leading-[1.15] font-medium tracking-[-0.015em] text-balance group-aria-[current=page]:text-white/55">
                                  {s.name}
                                </span>
                              </span>
                              <span className="mt-1.5 block text-base text-white/60 text-pretty">{s.tagline}</span>
                            </span>
                            <ArrowRight className="mt-1 size-5 text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <div
              data-menu-item
              style={{ "--i": groups.length + 1 } as React.CSSProperties}
              className="mt-auto flex flex-wrap items-center justify-between gap-5 pt-[clamp(40px,3.4vw,72px)]"
            >
              <Link href={item.href} onClick={() => close(false)} className="group inline-flex items-center gap-2 text-base font-medium">
                <span className="grad-hover underline underline-offset-[0.28em]">All {item.label.toLowerCase()}</span>
                <ArrowRight className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href={button.href} onClick={() => close(false)} className={buttonClass("light", "lg")}>
                <span className="btn-label">{button.label}</span>
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
