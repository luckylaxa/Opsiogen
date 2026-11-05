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
 * Main navigation. Services opens a mega menu below the header listing every
 * service by group (see ServicesItem).
 */
export function NavMenu({ menu, groups, button }: { menu: LinkItem[]; groups: MenuGroup[]; button: LinkItem }) {
  return (
    <nav aria-label="Main" className="mr-[clamp(20px,2.1vw,40px)] ml-[clamp(40px,4.2vw,80px)] hidden shrink-0 lg:block">
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
 * The Services item: hovering it (or a click or Enter) opens the services
 * mega menu, full width and the full height left below the header, which
 * stays visible above it. It wipes down and the groups rise in turn, like the
 * main menu (.site-menu in globals.css), and everything fits on one screen.
 * Moving the pointer back to the rest of the header, the close button,
 * Escape or choosing a link closes it.
 */
function ServicesItem({ item, groups, button }: { item: LinkItem; groups: MenuGroup[]; button: LinkItem }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // The panel is added to the page on the first open, then kept so it can animate closed.
  const [primed, setPrimed] = useState(false);
  // Where the panel starts: the bottom of the header when it opened.
  const [top, setTop] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const viaKeyboard = useRef(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const show = () => {
    const header = trigger.current?.closest("header");
    setTop(Math.max(0, Math.round(header?.getBoundingClientRect().bottom ?? 0)));
    setPrimed(true);
    setOpen(true);
  };
  const close = (returnFocus = true) => {
    clearTimeout(timer.current);
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };
  // Hover intent: a short pause before opening, a little longer before closing.
  const hover = (next: boolean) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => (next ? show() : setOpen(false)), next ? 120 : 200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    root.dataset.megaOpen = "";
    if (viaKeyboard.current) panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      delete root.dataset.megaOpen;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const total = groups.reduce((n, g) => n + g.services.length, 0);
  // Running numbers across the groups: where each group's count starts.
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.services.length, 0));

  return (
    // The panel is portalled to <body>, but pointer events still bubble through
    // this wrapper, so hovering the panel counts as hovering Services.
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && hover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(false)}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onKeyDown={(e) => {
          viaKeyboard.current = e.key === "Enter" || e.key === " ";
        }}
        onClick={() => {
          clearTimeout(timer.current);
          if (open) close(false);
          else show();
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
            role="region"
            aria-label={item.label}
            data-open={open || undefined}
            style={{ top }}
            className="site-menu on-dark fixed inset-x-0 bottom-0 z-[55] flex flex-col overflow-y-auto overscroll-contain bg-[#0a090d] px-gutter pt-[clamp(16px,3.4vh,56px)] pb-[clamp(16px,3.2vh,48px)] text-white"
          >
            <div data-menu-item style={{ "--i": 0 } as React.CSSProperties} className="flex items-start justify-between gap-6">
              <p className="text-[length:clamp(32px,min(5vw,7.4vh),112px)] leading-[0.92] font-bold tracking-[-0.045em] uppercase">
                <AccentText text={`Our ${item.label}`} />
              </p>
              <div className="flex items-center gap-4">
                <span className="hidden text-small uppercase tracking-[0.18em] text-white/45 tabular-nums md:inline">
                  {String(total).padStart(2, "0")} {item.label.toLowerCase()}
                </span>
                <button
                  type="button"
                  onClick={() => close()}
                  aria-label={`Close ${item.label.toLowerCase()}`}
                  className="grid size-11 place-items-center rounded-[var(--radius-btn)] border border-white/25 text-white transition-colors duration-300 hover:border-white/60"
                >
                  <CloseIcon className="size-5" />
                </button>
              </div>
            </div>

            <div className="mt-[clamp(16px,3.6vh,64px)] grid grid-cols-3 gap-x-gap">
              {groups.map((g, gi) => (
                <section key={g.group} data-menu-item style={{ "--i": gi + 1 } as React.CSSProperties}>
                  <h2 className="flex items-baseline justify-between pb-[clamp(8px,1.4vh,16px)] text-small uppercase tracking-[0.18em] text-white/55">
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
                            className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-[clamp(12px,1.1vw,22px)] py-[clamp(8px,1.7vh,24px)]"
                          >
                            <span className="grid size-[clamp(32px,min(2.6vw,4.6vh),50px)] place-items-center rounded-[10px] border border-white/15 text-white/80 transition-colors duration-300 group-hover:border-white/40 group-hover:text-white">
                              <ServiceIcon slug={s.slug} className="size-[46%]" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex items-baseline gap-3">
                                <span className="text-small tabular-nums text-white/35">{String(index).padStart(2, "0")}</span>
                                <span className="grad-hover text-[length:clamp(17px,min(1.55vw,2.7vh),29px)] leading-[1.15] font-medium tracking-[-0.015em] text-balance group-aria-[current=page]:text-white/55">
                                  {s.name}
                                </span>
                              </span>
                              <span className="mt-1 block text-[length:clamp(13px,min(1vw,1.8vh),17px)] leading-[1.4] text-white/60 text-pretty">
                                {s.tagline}
                              </span>
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
              className="mt-auto flex flex-wrap items-center justify-between gap-5 pt-[clamp(16px,3.2vh,56px)]"
            >
              <Link href={item.href} onClick={() => close(false)} className="group inline-flex items-center gap-2 text-base font-medium">
                <span className="grad-hover underline underline-offset-[0.28em]">All {item.label.toLowerCase()}</span>
                <ArrowRight className="size-[1.1em] transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href={button.href} onClick={() => close(false)} className={buttonClass("light", "md")}>
                <span className="btn-label">{button.label}</span>
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
