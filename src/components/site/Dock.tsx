"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LinkItem } from "@/lib/types";
import { Mark } from "./Mark";
import { MenuButton } from "./MenuContext";

/**
 * Opsiogen's floating menu: one dark bar with the design system's square
 * corners, the same height as the back-to-top square beside it. It holds the
 * symbol (home), the page you are on with a line that fills as you scroll,
 * the Menu button (opens the full-screen menu) and the main button. On Home
 * the page name follows the section in view. Rises in 0.25s after load (CSS,
 * so it never flashes).
 */
export function Dock({ menu, button }: { menu: LinkItem[]; button: LinkItem }) {
  const pathname = usePathname();
  const progress = useRef<HTMLSpanElement>(null);
  const [spyState, setSpyState] = useState<{ path: string; href: string | null }>({ path: "", href: null });
  const spy = spyState.path === pathname ? spyState.href : null;

  // Section in view (Home marks its sections with data-dock).
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-dock]"));
    if (!sections.length) return;
    const visible = new Map<HTMLElement, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target as HTMLElement, e.isIntersecting));
        const current = sections.find((s) => visible.get(s));
        setSpyState({ path: pathname, href: current?.dataset.dock ?? null });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  // Reading progress, written straight to the line so scrolling never re-renders.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const k = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${k})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const match = (href: string) => href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
  const current = menu.find((m) => (spy ? m.href === spy : match(m.href)));
  // Home counts as the first page.
  const index = current ? menu.indexOf(current) + 2 : 1;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[clamp(12px,calc(1.7vw+5.6px),38px)] z-40 flex justify-center px-3">
      <nav
        aria-label="Quick links"
        className="on-dark dock-in pointer-events-auto relative flex h-[var(--dock-size)] items-stretch gap-[var(--dock-pad)] overflow-hidden rounded-[8px] border border-white/10 bg-[rgb(10_9_13/0.88)] p-[var(--dock-pad)] text-white shadow-[0_18px_50px_-16px_rgb(0_0_0/0.6)] backdrop-blur-xl [--dock-pad:clamp(4px,0.32vw,6px)] [--dock-size:clamp(46px,calc(1.9vw+39px),75px)]"
      >
        <Link
          href="/"
          aria-label="Home"
          className="grid aspect-square h-full shrink-0 place-items-center rounded-[5px] bg-white/[0.06] transition-colors duration-300 hover:bg-white/[0.14]"
        >
          <Mark className="size-[58%]" />
        </Link>

        <p className="hidden min-w-[8.5rem] flex-col justify-center px-3 leading-tight sm:flex">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45 tabular-nums">
            {String(index).padStart(2, "0")} / {String(menu.length + 1).padStart(2, "0")}
          </span>
          <span className="text-[length:clamp(14px,calc(0.2vw+13px),17px)] font-medium">{current?.label ?? "Home"}</span>
        </p>

        <MenuButton className="group flex h-full items-center gap-2.5 rounded-[5px] border border-white/[0.12] px-[clamp(14px,1vw,20px)] text-[length:clamp(14px,calc(0.2vw+13px),17px)] transition-colors duration-300 hover:border-white/40">
          <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
            <span className="h-px w-full bg-current transition-transform duration-300 group-hover:translate-x-0.5" />
            <span className="h-px w-2/3 bg-current transition-[width] duration-300 group-hover:w-full" />
          </span>
          <span className="grad-hover">Menu</span>
        </MenuButton>

        <Link
          href={button.href}
          className="btn theme-light flex h-full items-center rounded-[5px] bg-[#f8f6f8] px-[clamp(16px,calc(0.6vw+13px),24px)] text-[length:clamp(14px,calc(0.2vw+13px),17px)] font-medium text-[#0a090d] transition-colors duration-300 hover:bg-white"
        >
          <span className="btn-label">{button.label}</span>
        </Link>

        <span
          ref={progress}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-white/60"
        />
      </nav>
    </div>
  );
}
