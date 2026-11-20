import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { MenuIcon } from "@/components/ui/Icons";
import { HeaderShell } from "./HeaderShell";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuContext";
import { NavMenu, type MenuGroup } from "./NavMenu";
import { SiteSearch, type SearchItem } from "./SiteSearch";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Top bar from the reference: logo, menu (Services opens a full-screen list), the
 * search bar, the theme switch and the main button. Scrolls away with the page; the floating
 * dock stays.
 */
export function Header({
  settings,
  groups,
  searchItems,
}: {
  settings: SiteSettings;
  groups: MenuGroup[];
  searchItems: SearchItem[];
}) {
  return (
    <HeaderShell>
      <Link href="/" className="link-fade shrink-0" aria-label={`${settings.siteTitle} home`}>
        <Logo logo={settings.logo} name={settings.siteTitle} priority large />
      </Link>
      {/* The main button already goes to that page, so its link is left out of the bar (it stays in the footer). */}
      <NavMenu menu={settings.menu.filter((m) => m.href !== settings.headerButton.href)} groups={groups} />
      <SiteSearch
        items={searchItems}
        className="mr-[clamp(20px,2.1vw,40px)] hidden min-w-0 flex-1 lg:block"
      />
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <ThemeToggle className="hover:bg-ink/[0.07]" />
        <div className="hidden sm:block">
          <ButtonLink href={settings.headerButton.href}>{settings.headerButton.label}</ButtonLink>
        </div>
        <MenuButton className="-mr-2 flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-2 text-base lg:hidden">
          {/* Under 360px (small phones, zoomed display) the word would push the bar past the screen edge: icon only, still named "Menu". */}
          <span className="max-[360px]:sr-only">Menu</span>
          <MenuIcon className="size-6" />
        </MenuButton>
      </div>
    </HeaderShell>
  );
}
