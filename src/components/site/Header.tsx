import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { MenuIcon } from "@/components/ui/Icons";
import { Logo } from "./Logo";
import { MenuButton } from "./MenuContext";

/** Top bar. Scrolls away with the page; the floating dock stays. */
export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="relative z-30 flex h-[var(--header-h)] items-center px-gutter">
      <Link href="/" className="link-fade shrink-0" aria-label={`${settings.siteTitle} home`}>
        <Logo logo={settings.logo} name={settings.siteTitle} />
      </Link>
      <nav aria-label="Main" className="ml-[clamp(40px,4.2vw,80px)] hidden lg:block">
        <ul className="flex items-center gap-[clamp(18px,1.3vw,25px)]">
          {settings.menu.map((item) => (
            <li key={item._key ?? item.href}>
              <Link href={item.href} className="link-fade text-base">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-2">
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
