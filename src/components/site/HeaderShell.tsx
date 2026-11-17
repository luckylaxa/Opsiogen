/**
 * The header bar itself. On Home it lies over the hero picture; the clear look there
 * comes from the stylesheet (`body:has(.hero-picture) .site-header` in globals.css),
 * so it holds on the first paint in both themes.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="site-header relative z-30 flex h-[var(--header-h)] items-center px-gutter">{children}</header>
  );
}
