"use client";

import Link from "next/link";
import { Mark } from "./Mark";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LinkItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MenuButton } from "./MenuContext";

/**
 * Floating bottom dock from the reference: logo tile, page links and a light
 * call-to-action tile. The current page (or, on Home, the section in view) is
 * outlined. Slides up 0.25s after load (CSS, so it never flashes).
 */
export function Dock({ menu, button }: { menu: LinkItem[]; button: LinkItem }) {
  const pathname = usePathname();
  const [spyState, setSpyState] = useState<{ path: string; href: string | null }>({ path: "", href: null });
  const spy = spyState.path === pathname ? spyState.href : null;

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

  const isActive = (href: string) =>
    spy ? spy === href : href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[clamp(12px,calc(1.7vw+5.6px),38px)] z-40 flex justify-center px-3">
      <nav
        aria-label="Quick links"
        className="dock-in pointer-events-auto flex items-stretch gap-[clamp(5px,0.42vw,8px)] rounded-[clamp(10px,0.63vw,12px)] bg-dock p-[clamp(5px,0.37vw,7px)] text-[length:clamp(14px,calc(0.196vw+13.26px),17px)] shadow-[0_10px_40px_-12px_rgb(0_0_0/0.35)] backdrop-blur-md"
      >
        <Link
          href="/"
          aria-label="Home"
          className="grid aspect-square w-[clamp(46px,calc(1.9vw+39px),75px)] place-items-center rounded-[clamp(7px,0.42vw,8px)] bg-coal text-[clamp(18px,calc(0.6vw+15.8px),27px)] font-semibold tracking-[-0.03em] text-white transition-colors duration-300 hover:bg-black"
        >
          <Mark className="size-[62%]" />
        </Link>
        <ul className="hidden items-center gap-[clamp(5px,0.42vw,8px)] rounded-[clamp(7px,0.42vw,8px)] bg-white/[0.13] p-[clamp(5px,0.42vw,8px)] md:flex">
          {menu.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item._key ?? item.href} className="h-full">
                <Link
                  href={item.href}
                  aria-current={active && !spy ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-[clamp(36px,calc(1.57vw+30.1px),60px)] items-center rounded-[7px] border px-[clamp(12px,0.84vw,16px)] text-[#e6e6e6] transition-[border-color,color,background-color] duration-300",
                    active ? "border-white/70 text-white" : "border-white/[0.07] hover:border-white/35 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <MenuButton className="flex items-center rounded-[7px] border border-white/[0.12] px-4 text-[#e6e6e6] transition-colors hover:border-white/40 md:hidden">
          Menu
        </MenuButton>
        <Link
          href={button.href}
          className="theme-light flex items-center rounded-[clamp(7px,0.42vw,8px)] bg-band px-[clamp(14px,calc(0.6vw+11.8px),23px)] font-medium text-ink transition-colors duration-300 hover:bg-white"
        >
          {button.label}
        </Link>
      </nav>
    </div>
  );
}
