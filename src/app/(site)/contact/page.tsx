import { Suspense } from "react";
import { CmsPage, cmsMetadata } from "@/components/CmsPage";
import { ContactForm, ContactFormWithParams } from "@/components/contact/ContactForm";
import { getServices, getSettings } from "@/lib/data";
import { CONTACT_FORM } from "@/content/seed-data";

export const revalidate = 60;

export function generateMetadata() {
  return cmsMetadata("contact", "/contact");
}

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
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
    <CmsPage
      slug="contact"
      after={
        <section aria-label="Enquiry form" className="mt-stack px-gutter">
          <div className={details.length ? "grid gap-y-14 gap-x-gap lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]" : "mx-auto max-w-[1100px]"}>
            {details.length > 0 && (
              <ul className="self-start">
                <li aria-hidden="true" className="rule-dotted" />
                {details.map((d) => (
                  <li key={d.label}>
                    <div className="py-[clamp(18px,calc(0.9vw+14.6px),32px)]">
                      <p className="text-small text-mute">{d.label}</p>
                      {d.href ? (
                        <a href={d.href} className="link-underline mt-1 block break-words text-row">
                          {d.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-row">{d.value}</p>
                      )}
                    </div>
                    <div className="rule-dotted" />
                  </li>
                ))}
              </ul>
            )}
            <Suspense fallback={<ContactForm {...formProps} />}>
              <ContactFormWithParams {...formProps} />
            </Suspense>
          </div>
        </section>
      }
    />
  );
}
