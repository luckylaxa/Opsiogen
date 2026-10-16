import Link from "next/link";
import type { LinkItem, ServiceRef, SiteSettings } from "@/lib/types";
import { GROUP_LABELS } from "@/lib/utils";
import { Logo } from "./Logo";

const GROUPS = ["build", "grow", "create"] as const;
const linkClass = "link-accent text-base font-medium";

/**
 * Quiet editorial footer from the design system and the reference: the full
 * logo and line, link columns (the menu, then every service by group), a
 * dotted rule, then the legal line and “Connect:” with the social links
 * from Site settings.
 */
export function Footer({ settings, services }: { settings: SiteSettings; services: ServiceRef[] }) {
  const year = 2026;
  const contact: LinkItem[] = [
    settings.email && { label: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { label: settings.phone, href: `tel:${settings.phone.replace(/[^+\d]/g, "")}` },
  ].filter(Boolean) as LinkItem[];
  const groups = GROUPS.map((g) => ({ group: g, items: services.filter((s) => s.group === g) })).filter((g) => g.items.length);

  return (
    <footer className="px-gutter pb-[clamp(96px,calc(4.6vw+79px),150px)] pt-section">
      <div className="flex flex-col gap-[clamp(14px,1vw,20px)]">
        <Link href="/" className="w-fit transition-opacity hover:opacity-70" aria-label={`${settings.siteTitle} home`}>
          <Logo logo={settings.logo} name={settings.siteTitle} />
        </Link>
        <p className="text-base text-ink-2">{settings.footerLine}</p>
      </div>

      <nav
        aria-label="Footer"
        className="mt-[clamp(40px,calc(2.7vw+30px),82px)] grid grid-cols-2 gap-x-gap gap-y-[clamp(32px,2.6vw,48px)] md:grid-cols-4"
      >
        <Column title="Menu" items={settings.menu} />
        {groups.map(({ group, items }) => (
          <Column
            key={group}
            title={GROUP_LABELS[group]}
            items={items.map((s) => ({ label: s.name, href: `/services/${s.slug}` }))}
          />
        ))}
        {contact.length > 0 && (
          <Column title="Contact" items={contact} external className="col-span-2 md:col-span-1" />
        )}
      </nav>

      <div className="rule-dotted mt-[clamp(40px,calc(2.8vw+29.5px),83px)]" />

      <div className="mt-[clamp(24px,calc(2.29vw+15.4px),60px)] flex flex-col gap-5 text-base text-ink-2 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-[0.6em] gap-y-2">
          <span>© {year} {settings.siteTitle}</span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="link-accent">
            Privacy Policy
          </Link>
        </p>
        {settings.socialLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-[clamp(16px,1.6vw,30px)] gap-y-2">
            <span className="font-semibold text-ink">Connect:</span>
            <ul className="contents">
              {settings.socialLinks.map((s) => (
                <li key={s._key ?? s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-accent">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}

function Column({
  title,
  items,
  external,
  className,
}: {
  title: string;
  items: LinkItem[];
  external?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-[clamp(14px,1.1vw,20px)] text-small uppercase tracking-[0.18em] text-mute">{title}</p>
      <ul className="flex flex-col gap-[clamp(12px,0.9vw,18px)]">
        {items.map((item) => (
          <li key={item._key ?? item.href}>
            {external ? (
              <a href={item.href} className={`${linkClass} break-all`}>
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
