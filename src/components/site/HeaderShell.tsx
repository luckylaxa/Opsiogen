"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The header bar itself. On Home it lies over the hero picture, so there it is
 * clear and takes the dark theme's colours in both themes (light logo and text).
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const overPicture = usePathname() === "/";
  return (
    <header
      data-theme={overPicture ? "dark" : undefined}
      // The search field turns see-through over the picture.
      style={overPicture ? ({ "--color-search": "rgb(10 9 13 / 0.45)" } as React.CSSProperties) : undefined}
      className={cn("site-header relative z-30 flex h-[var(--header-h)] items-center px-gutter", overPicture && "text-ink")}
    >
      {children}
    </header>
  );
}
