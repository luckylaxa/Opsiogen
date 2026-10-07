"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LinkItem } from "@/lib/types";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { CloseIcon } from "@/components/ui/Icons";
import { buttonClass } from "@/components/ui/Button";
import { useMenu } from "./MenuContext";
import { SiteSearch, type SearchItem } from "./SiteSearch";
import { ThemeToggle } from "./ThemeToggle";

/** Full-screen menu for small screens. Opened from the header or the dock. */
export function MenuOverlay({
  menu,
  button,
  wordmark,
  searchItems,
}: {
  menu: LinkItem[];
  button: LinkItem;
  wordmark: React.ReactNode;
  searchItems: SearchItem[];
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
      className="on-dark invisible fixed inset-0 z-50 flex flex-col bg-coal px-gutter pb-10 text-white"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className="flex h-[clamp(64px,4.6vw,88px)] items-center justify-between">
        <Link href="/" className="text-[26px] font-semibold tracking-[-0.02em]" onClick={closeMenu}>
          {wordmark}
        </Link>
        <div className="-mr-2 flex items-center gap-1">
          <ThemeToggle className="text-white hover:bg-white/10" />
          <button
            type="button"
            data-menu-close
            onClick={closeMenu}
            className="grid size-11 place-items-center rounded-[var(--radius-btn)] text-white"
            aria-label="Close menu"
          >
            <CloseIcon className="size-7" />
          </button>
        </div>
      </div>
      <div data-menu-item className="theme-light relative z-10 text-ink">
        <SiteSearch items={searchItems} />
      </div>
      <nav aria-label="Menu" className="mt-[6vh] flex flex-1 flex-col">
        <ul className="flex flex-col gap-1">
          {menu.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item._key ?? item.href} data-menu-item>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="block py-1 text-[clamp(44px,12vw,96px)] font-semibold uppercase leading-[1.02] tracking-[-0.015em] transition-opacity hover:opacity-60 aria-[current=page]:opacity-50"
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div data-menu-item className="mt-auto pt-10">
          <Link href={button.href} className={buttonClass("light", "lg")}>
            {button.label}
          </Link>
        </div>
      </nav>
    </div>
  );
}
