"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CloseIcon } from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const noop = () => () => {};

/** Square icon button in the pop-up bar: 8px radius, like the site’s buttons. */
const BTN =
  "grid size-[clamp(44px,calc(0.6vw+40px),54px)] shrink-0 place-items-center rounded-[8px] border border-line text-ink transition-colors duration-300 hover:border-ink focus-visible:border-ink";

/**
 * A case study over the current page, full screen. It opens when a project
 * link is followed inside the site (the /work/[slug] route is intercepted)
 * and the address changes to the project, so it can be shared; opening that
 * address directly shows the full page instead.
 *
 * Close, Escape or Back return to the page underneath, where it was left.
 * Previous and next (also the arrow keys) replace the current entry, so Back
 * still closes the pop-up rather than stepping through projects.
 */
export function ProjectModal({
  slug,
  name,
  index,
  total,
  prevHref,
  nextHref,
  titleId,
  children,
}: {
  slug: string;
  name: string;
  index: number;
  total: number;
  prevHref: string;
  nextHref: string;
  titleId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const dialog = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const leaving = useRef(false);

  // Go back once, after the closing animation (or straight away with reduced motion).
  const back = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  }, [router]);
  const close = useCallback(() => {
    if (prefersReducedMotion()) return back();
    setClosing(true);
    window.setTimeout(back, 500); // in case the animation end never arrives
  }, [back]);

  const go = useCallback((href: string) => router.replace(href, { scroll: false }), [router]);

  // Lock the page underneath, hide it from keyboard and screen readers, and
  // put focus back where it was when the pop-up closes.
  useEffect(() => {
    const root = dialog.current;
    if (!root) return;
    const opener = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const hidden = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== root && !el.contains(root) && !el.inert && el.tagName !== "SCRIPT" && el.tagName !== "NEXT-ROUTE-ANNOUNCER",
    );
    hidden.forEach((el) => (el.inert = true));
    root.focus({ preventScroll: true });
    return () => {
      html.style.overflow = overflow;
      hidden.forEach((el) => (el.inert = false));
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [mounted]);

  // Start each project at the top.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    dialog.current?.focus({ preventScroll: true });
    window.dispatchEvent(new Event("cursor:refresh"));
  }, [slug]);

  // Escape closes, the arrow keys step through projects, Tab stays inside.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const target = e.target as HTMLElement | null;
        if (target?.closest("input, textarea, select, [contenteditable]")) return;
        e.preventDefault();
        go(e.key === "ArrowLeft" ? prevHref : nextHref);
      } else if (e.key === "Tab" && dialog.current) {
        const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
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
  }, [close, go, prevHref, nextHref]);

  if (!mounted) return null;
  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn("project-modal fixed inset-0 z-[55] bg-page text-ink outline-none", closing && "is-closing")}
      onAnimationEnd={(e) => {
        if (e.target !== e.currentTarget) return;
        if (closing) back();
        else window.dispatchEvent(new Event("cursor:refresh"));
      }}
    >
      <div ref={scroller} className="h-full overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 border-b border-line bg-page/85 backdrop-blur-xl">
          <div className="flex h-[var(--header-h)] items-center justify-between gap-4 px-gutter">
            <p className="flex min-w-0 items-baseline gap-3 text-base">
              <span className="shrink-0 tabular-nums">
                {pad(index + 1)}
                <span className="text-mute"> / {pad(total)}</span>
              </span>
              <span className="hidden truncate text-mute sm:inline">{name}</span>
            </p>
            <nav aria-label="Projects" className="flex items-center gap-2">
              <Link href={prevHref} replace scroll={false} className={BTN} aria-label="Previous project">
                <ArrowRight className="size-[42%] rotate-180" />
              </Link>
              <Link href={nextHref} replace scroll={false} className={BTN} aria-label="Next project">
                <ArrowRight className="size-[42%]" />
              </Link>
              <button type="button" onClick={close} className={cn(BTN, "ml-2 bg-ink text-page hover:border-ink")} aria-label="Close project">
                <CloseIcon className="size-[42%]" />
              </button>
            </nav>
          </div>
        </div>
        <div key={slug} className="project-swap pb-[clamp(64px,calc(4vw+48px),140px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
