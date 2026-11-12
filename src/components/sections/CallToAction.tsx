import type { HeroSection, Img, LinkItem, SiteSettings } from "@/lib/types";
import { getPage, getSettings } from "@/lib/data";
import { CTA_IMAGES } from "@/content/section-images";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

/**
 * Shared call to action, edited once in Site settings.
 * - single: a flat dark card, the heading beside a photo.
 * - dual: the reference's two closing cards side by side. The first carries
 *   the call to action; the second leads to Services, using the Services
 *   page's own heading. Each sits on a photo that fades to dark behind the text.
 */
export async function CallToAction({ cta, variant = "single" }: { cta: SiteSettings["cta"]; variant?: "single" | "dual" }) {
  if (variant === "dual") return <DualCallToAction cta={cta} />;
  const image = CTA_IMAGES[0];
  return (
    <div className="px-gutter">
      <div
        data-reveal
        className="on-dark grid overflow-hidden rounded-card bg-coal text-white md:min-h-[clamp(340px,calc(20.2vw+264px),650px)] md:grid-cols-2"
      >
        <div className="flex flex-col p-[clamp(28px,calc(3.2vw+16px),77px)]">
          <h2 className="max-w-[15ch] text-cta font-semibold text-balance">{cta.heading}</h2>
          {cta.button.href && cta.button.label && (
            <ButtonLink href={cta.button.href} variant="outline-light" size="lg" className="mt-[clamp(32px,calc(1.9vw+25px),62px)] w-fit">
              {cta.button.label}
            </ButtonLink>
          )}
        </div>
        {image && (
          <div className="relative aspect-[4/3] md:aspect-auto">
            <Media image={image} sizes="(min-width: 768px) 48vw, 100vw" lowPriority />
          </div>
        )}
      </div>
    </div>
  );
}

async function DualCallToAction({ cta }: { cta: SiteSettings["cta"] }) {
  const [settings, servicesPage] = await Promise.all([getSettings(), getPage("services")]);
  const servicesHero = servicesPage?.sections.find((s): s is HeroSection => s._type === "hero");
  const servicesLink = settings.menu.find((m) => m.href === "/services");
  const second =
    servicesHero && servicesLink
      ? { heading: servicesHero.heading, button: { label: servicesLink.label, href: servicesLink.href } }
      : null;

  return (
    <div className="@container grid gap-gap px-gutter md:grid-cols-2">
      <CtaCard heading={cta.heading} button={cta.button} image={CTA_IMAGES[0]} />
      {second && <CtaCard heading={second.heading} button={second.button} image={CTA_IMAGES[1] ?? CTA_IMAGES[0]} />}
    </div>
  );
}

function CtaCard({ heading, button, image }: { heading: string; button: LinkItem; image?: Img }) {
  return (
    <div
      data-reveal
      className="on-dark relative flex min-h-[360px] flex-col overflow-hidden rounded-card bg-coal px-[clamp(24px,4.05vw,77px)] pb-[clamp(24px,4.05vw,77px)] pt-[clamp(28px,4.6vw,88px)] text-white md:min-h-[calc((100cqw-var(--spacing-gap))*0.371)]"
    >
      {image && (
        <div aria-hidden="true" className="absolute inset-0">
          <Media image={{ ...image, alt: "" }} sizes="(min-width: 768px) 48vw, 100vw" lowPriority />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,color-mix(in_srgb,var(--color-coal)_94%,transparent)_0%,color-mix(in_srgb,var(--color-coal)_70%,transparent)_42%,transparent_78%)]" />
        </div>
      )}
      <h2 className="relative max-w-[14ch] text-[length:clamp(30px,2.9vw,55px)] leading-[1.2] font-semibold tracking-[-0.015em] text-balance">
        {heading}
      </h2>
      {button.href && button.label && (
        <ButtonLink href={button.href} variant="outline-light" size="lg" className="relative mt-[clamp(24px,2.6vw,50px)] w-fit">
          {button.label}
        </ButtonLink>
      )}
    </div>
  );
}
