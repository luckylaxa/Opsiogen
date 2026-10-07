import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cmsMetadata } from "@/components/CmsPage";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { ContactForm, ContactFormWithParams } from "@/components/contact/ContactForm";
import { Label } from "@/components/ui/Headings";
import { Badge } from "@/components/ui/Badge";
import { getPage, getServices, getSettings } from "@/lib/data";
import { CONTACT_FORM } from "@/content/seed-data";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("contact", "/contact");
}

/**
 * Contact, laid out like the reference's plan cards: the heading on the left,
 * then a charcoal card with the intro and contact details beside a white card
 * holding the form. Any further CMS sections follow below.
 */
export default async function ContactPage() {
  const [page, settings, services] = await Promise.all([getPage("contact"), getSettings(), getServices()]);
  if (!page) notFound();

  const heroIndex = page.sections.findIndex((s) => s._type === "hero");
  const hero = heroIndex >= 0 ? page.sections[heroIndex] : null;
  const rest = page.sections.filter((_, i) => i !== heroIndex);
  const heading = hero && hero._type === "hero" ? hero.heading : page.title;
  const intro = hero && hero._type === "hero" ? hero.text : null;

  const needs = [
    ...services.map((s) => ({ value: s.slug, label: s.name })),
    ...CONTACT_FORM.extraNeeds.map((n) => ({ value: n, label: n })),
  ];
  const details = [
    settings.email && { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.phone && { label: "Phone", value: settings.phone, href: `tel:${settings.phone.replace(/[^+\d]/g, "")}` },
    settings.location && { label: "Location", value: settings.location },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];
  const formProps = { needs, sources: CONTACT_FORM.sources };

  return (
    <>
      <section data-band className="px-gutter pt-[clamp(40px,calc(1.57vw+34px),64px)]">
        <Label className="mb-[clamp(16px,calc(1.24vw+11.4px),35px)]">{page.title}</Label>
        <h1 className="max-w-[13ch] text-display font-semibold text-balance">{heading}</h1>

        <div className="mt-[clamp(40px,calc(2.6vw+30px),96px)] grid gap-[clamp(12px,calc(0.5vw+10px),20px)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <aside className="on-dark flex flex-col rounded-card bg-coal p-[clamp(24px,calc(1.6vw+18px),56px)] text-white lg:min-h-full">
            {intro && <p className="max-w-[24ch] text-plan font-medium text-balance">{intro}</p>}
            {details.length > 0 && (
              <ul className="mt-[clamp(32px,calc(2vw+24px),64px)]">
                {details.map((d) => (
                  <li key={d.label} className="border-t border-white/12 py-[clamp(14px,calc(0.6vw+12px),24px)]">
                    <p className="text-small text-white/55">{d.label}</p>
                    {d.href ? (
                      <a href={d.href} className="link-underline mt-1 block break-words text-row">
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-row">{d.value}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto hidden self-end pt-12 lg:block">
              <Badge id="contact-badge" text={settings.footerLine} mark={`${settings.siteTitle.charAt(0)}.`} className="text-white/80" />
            </div>
          </aside>

          <div className="rounded-card bg-white p-[clamp(20px,calc(1.6vw+14px),56px)]">
            <Suspense fallback={<ContactForm {...formProps} />}>
              <ContactFormWithParams {...formProps} />
            </Suspense>
          </div>
        </div>
      </section>

      {rest.length > 0 && <SectionRenderer sections={rest} />}
    </>
  );
}
