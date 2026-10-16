"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LinkItem } from "@/lib/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { CloseIcon } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";
import { useMenu } from "./MenuContext";
import type { MenuGroup } from "./NavMenu";
import { SiteSearch, type SearchItem } from "./SiteSearch";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The full-screen menu from the design system, opened from the floating menu
 * (and the header on phones): always dark, with oversized numbered page links
 * that rise in turn, and on wide screens the services, search and contact
 * beside them. Wipes down to open and up to close.
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
        const items = panel.current.querySelectorAll<HTMLElement>("a, button");
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
              return (
                <li key={item._key ?? item.href} className="border-t border-white/10">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group flex items-baseline gap-[clamp(14px,1.4vw,28px)] overflow-hidden py-[clamp(6px,0.8vw,14px)]"
                  >
                    <span className="w-[2ch] shrink-0 text-small tracking-[0.08em] text-white/45 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      data-menu-item
                      className="grad-hover text-[length:clamp(44px,calc(5.2vw+24px),124px)] leading-[0.95] font-semibold tracking-[-0.045em] group-aria-[current=page]:text-white/55"
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-10 lg:justify-end">
          <div data-menu-item className="theme-light relative z-10 text-ink">
            <SiteSearch items={searchItems} />
          </div>
          {groups.length > 0 && (
            <div data-menu-item className="hidden grid-cols-3 gap-x-6 sm:grid">
              {groups.map((g) => (
                <div key={g.group}>
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">{g.label}</p>
                  <ul className="flex flex-col gap-2">
                    {g.services.map((sv) => (
                      <li key={sv.href}>
                        <Link href={sv.href} className="link-accent text-small text-white/80">
                          {sv.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
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
