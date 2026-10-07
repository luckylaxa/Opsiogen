"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { LinkItem, ServiceGroup } from "@/lib/types";
import { ArrowRight, ChevronDown } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export type MenuGroup = {
  group: ServiceGroup;
  label: string;
  services: { name: string; tagline: string; href: string }[];
};

/**
 * Main navigation. The Services item opens a drop-down panel listing every
 * service by group, like the reference's Explore menu. It opens on hover or
 * click, and closes on Escape, on leaving it, or after choosing a link.
 */
export function NavMenu({ menu, groups }: { menu: LinkItem[]; groups: MenuGroup[] }) {
  return (
    <nav aria-label="Main" className="ml-[clamp(40px,4.2vw,80px)] hidden lg:block">
      <ul className="flex items-center gap-[clamp(18px,1.3vw,25px)]">
        {menu.map((item) => (
          <li key={item._key ?? item.href}>
            {item.href === "/services" && groups.length > 0 ? (
              <ServicesItem item={item} groups={groups} />
            ) : (
              <Link href={item.href} className="link-fade text-base">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ServicesItem({ item, groups }: { item: LinkItem; groups: MenuGroup[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const hover = (next: boolean) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), next ? 80 : 160);
  };

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && hover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(false)}
      onBlur={(e) => !root.current?.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="link-fade inline-flex items-center gap-1 text-base"
      >
        {item.label}
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <div
        id={`${id}-panel`}
        hidden={!open}
        className="absolute left-[-24px] top-[calc(100%+18px)] z-50 w-[min(860px,calc(100vw-64px))] rounded-card bg-white p-[clamp(20px,1.6vw,32px)] shadow-[0_24px_60px_-12px_rgb(0_0_0/0.25),0_0_0_1px_rgb(0_0_0/0.05)] before:absolute before:inset-x-0 before:-top-5 before:h-5 before:content-['']"
      >
        <div className="grid grid-cols-3 gap-x-[clamp(20px,2vw,40px)]">
          {groups.map((g) => (
            <div key={g.group}>
              <p className="border-b border-ink/10 pb-3 text-small text-mute">{g.label}</p>
              <ul className="mt-2">
                {g.services.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group block rounded-[8px] px-2 py-2.5 -mx-2 hover:bg-band focus-visible:bg-band">
                      <span className="block text-base font-medium">{s.name}</span>
                      <span className="block text-small text-mute">{s.tagline}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <Link href={item.href} className="group inline-flex items-center gap-2 text-base font-medium">
            <ArrowRight className="size-[1.2em] transition-transform duration-300 group-hover:translate-x-1" />
            <span className="link-underline">All {item.label.toLowerCase()}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
