import Link from "next/link";
import type { LinkItem, SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

const linkClass = "link-fade text-base font-medium";

/** Footer from the reference: logo and line, link columns, dotted rule, bottom row. */
export function Footer({ settings }: { settings: SiteSettings }) {
  const year = 2026;
  const contact: LinkItem[] = [
    settings.email && { label: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { label: settings.phone, href: `tel:${settings.phone.replace(/[^+\d]/g, "")}` },
  ].filter(Boolean) as LinkItem[];
  const columns = chunk(settings.menu, 2);

  return (
    <footer className="px-gutter pb-[clamp(96px,calc(4.6vw+79px),150px)] pt-section">
      <div className="flex flex-col gap-[clamp(12px,0.8vw,16px)]">
        <Link href="/" className="link-fade w-fit" aria-label={`${settings.siteTitle} home`}>
          <Logo logo={settings.logo} name={settings.siteTitle} />
        </Link>
        <p className="text-base text-ink-2">{settings.footerLine}</p>
      </div>

      <nav
        aria-label="Footer"
        className="mt-[clamp(40px,calc(2.7vw+30px),82px)] grid grid-cols-2 gap-x-gap gap-y-[clamp(20px,calc(0.72vw+17.3px),31px)] md:grid-cols-4"
      >
        {columns.map((col, i) => (
          <ul key={i} className="flex flex-col gap-[clamp(14px,calc(0.95vw+10.4px),29px)]">
            {col.map((item) => (
              <li key={item._key ?? item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ))}
        {contact.length > 0 && (
          <ul className="col-span-2 flex flex-col gap-[clamp(14px,calc(0.95vw+10.4px),29px)] md:col-span-1">
            {contact.map((c) => (
              <li key={c.href}>
                <a href={c.href} className={`${linkClass} break-all`}>
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="rule-dotted mt-[clamp(40px,calc(2.8vw+29.5px),83px)]" />

      <div className="mt-[clamp(24px,calc(2.29vw+15.4px),60px)] flex flex-col gap-5 text-base text-ink-2 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-[0.6em] gap-y-2">
          <span>© {year} {settings.siteTitle}</span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="link-fade">
            Privacy Policy
          </Link>
        </p>
        {settings.socialLinks.length > 0 && (
          <ul className="flex flex-wrap items-center gap-x-[clamp(16px,1.6vw,30px)] gap-y-2">
            <li className="font-medium text-ink">Connect:</li>
            {settings.socialLinks.map((s) => (
              <li key={s._key ?? s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-fade">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
