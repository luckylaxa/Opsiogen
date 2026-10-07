import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { MenuIcon } from "@/components/ui/Icons";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuContext";
import { NavMenu, type MenuGroup } from "./NavMenu";
import { SiteSearch, type SearchItem } from "./SiteSearch";

/**
 * Top bar from the reference: logo, menu (Services opens a drop-down), the
 * search bar and the main button. Scrolls away with the page; the floating
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
    <header className="relative z-30 flex h-[var(--header-h)] items-center px-gutter">
      <Link href="/" className="link-fade shrink-0" aria-label={`${settings.siteTitle} home`}>
        <Logo logo={settings.logo} name={settings.siteTitle} />
      </Link>
      <NavMenu menu={settings.menu} groups={groups} />
      <SiteSearch
        items={searchItems}
        className="mx-[clamp(20px,2.1vw,40px)] hidden flex-1 lg:block"
      />
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <div className="hidden sm:block">
          <ButtonLink href={settings.headerButton.href}>{settings.headerButton.label}</ButtonLink>
        </div>
        <MenuButton className="-mr-2 flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-2 text-base lg:hidden">
          <span>Menu</span>
          <MenuIcon className="size-6" />
        </MenuButton>
      </div>
    </header>
  );
}
