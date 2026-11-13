import type { HeroSection, SiteSettings } from "@/lib/types";
import { getPage, getSettings } from "@/lib/data";
import { CTA_IMAGES } from "@/content/section-images";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { cn } from "@/lib/utils";

/**
 * Shared call to action, edited once in Site settings: one wide photo banner.
 * From 768px the photo fills a 21:10 card, trimmed a little at top and bottom,
 * and the heading sits over its plain left side under a dark shade; on phones
 * the photo sits on top, uncropped, with the heading below it.
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

  // Phones show the whole photo in its own shape; wider screens use a slightly shorter card.
  const ratio = image ? ({ "--cta-ratio": `${image.width} / ${image.height}` } as React.CSSProperties) : undefined;

  return (
    <div className="px-gutter">
      <div
        data-reveal
        style={ratio}
        className={cn(
          "on-dark relative overflow-hidden rounded-card bg-coal text-white md:flex md:flex-col md:justify-center",
          image
            ? "md:aspect-[21/10]"
            : "flex min-h-[clamp(520px,calc(14vw+460px),660px)] flex-col justify-end md:min-h-[clamp(420px,30vw,620px)]",
        )}
      >
        {image && (
          <div aria-hidden="true" className="relative aspect-(--cta-ratio) md:absolute md:inset-0 md:aspect-auto">
            <Media image={{ ...image, alt: "" }} sizes="100vw" lowPriority />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-coal)_0%,transparent_32%)] md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-coal)_88%,transparent)_0%,color-mix(in_srgb,var(--color-coal)_62%,transparent)_38%,transparent_64%)]" />
          </div>
        )}
        <div
          className={cn(
            "relative px-[clamp(28px,calc(3.2vw+16px),77px)] pb-[clamp(28px,calc(3.2vw+16px),77px)] md:pt-[clamp(28px,calc(3.2vw+16px),77px)]",
            image ? "pt-4" : "pt-[clamp(28px,calc(3.2vw+16px),77px)]",
          )}
        >
          <h2 className="max-w-[15ch] text-cta font-semibold text-balance">{cta.heading}</h2>
          <div className="mt-[clamp(28px,calc(1.9vw+22px),56px)] flex flex-wrap gap-3">
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
    </div>
  );
}
