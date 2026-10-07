"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/Icons";
import { THEME_BAR, THEME_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const current = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/**
 * Switches between the light and dark theme and remembers the choice. The
 * icon is picked in CSS, so it is right from the first paint.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, current, () => "light" as Theme);
  const dark = theme === "dark";

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_BAR[theme]);
  }, [theme]);

  const toggle = () => {
    const next: Theme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("grid size-11 shrink-0 place-items-center rounded-[var(--radius-btn)] transition-colors duration-300", className)}
    >
      <MoonIcon className="size-[22px] dark:hidden" />
      <SunIcon className="hidden size-[22px] dark:block" />
    </button>
  );
}
