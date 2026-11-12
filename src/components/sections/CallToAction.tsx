import type { HeroSection, SiteSettings } from "@/lib/types";
import { getPage, getSettings } from "@/lib/data";
import { CTA_IMAGES } from "@/content/section-images";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

/**
 * Shared call to action, edited once in Site settings: one wide photo banner.
 * The photo fills the card with its subject on the right; a dark shade from
 * the left (from the bottom on phones) keeps the heading and buttons readable.
 * - single: the call to action's button.
 * - dual: the same banner with a second button to Services.
 */
export async function CallToAction({ cta, variant = "single" }: { cta: SiteSettings["cta"]; variant?: "single" | "dual" }) {
  let second: { label: string; href: string } | null = null;
  if (variant === "dual") {
    const [settings, servicesPage] = await Promise.all([getSettings(), getPage("services")]);
    const servicesLink = settings.menu.find((m) => m.href === "/services");
    const servicesHero = servicesPage?.sections.find((s): s is HeroSection => s._type === "hero");
    if (servicesLink && servicesHero) second = { label: servicesLink.label, href: servicesLink.href };
  }
  const image = CTA_IMAGES[0];

  return (
    <div className="px-gutter">
      <div
        data-reveal
        className="on-dark relative flex min-h-[clamp(520px,calc(14vw+460px),660px)] flex-col justify-end overflow-hidden rounded-card bg-coal p-[clamp(28px,calc(3.2vw+16px),77px)] text-white md:min-h-[clamp(420px,30vw,620px)] md:justify-center"
      >
        {image && (
          <div aria-hidden="true" className="absolute inset-0">
            <Media image={{ ...image, alt: "" }} sizes="100vw" lowPriority />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--color-coal)_92%,transparent)_0%,color-mix(in_srgb,var(--color-coal)_70%,transparent)_38%,transparent_70%)] md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-coal)_88%,transparent)_0%,color-mix(in_srgb,var(--color-coal)_62%,transparent)_38%,transparent_64%)]" />
          </div>
        )}
        <h2 className="relative max-w-[15ch] text-cta font-semibold text-balance">{cta.heading}</h2>
        <div className="relative mt-[clamp(28px,calc(1.9vw+22px),56px)] flex flex-wrap gap-3">
          {cta.button.href && cta.button.label && (
            <ButtonLink href={cta.button.href} variant="light" size="lg">
              {cta.button.label}
            </ButtonLink>
          )}
          {second && (
            <ButtonLink href={second.href} variant="outline-light" size="lg">
              {second.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}
