import type { HeroSection, Img, LinkItem, SiteSettings } from "@/lib/types";
import { getPage, getProjects, getSettings } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";

/**
 * Shared call to action, edited once in Site settings.
 * - single: the dark card from the reference hero.
 * - dual: the reference's two closing cards side by side. The first carries
 *   the call to action; the second leads to Services, using the Services
 *   page's own heading. Both sit on a dimmed project image.
 */
export async function CallToAction({ cta, variant = "single" }: { cta: SiteSettings["cta"]; variant?: "single" | "dual" }) {
  if (variant === "dual") return <DualCallToAction cta={cta} />;
  return (
    <div className="px-gutter">
      <div
        data-reveal
        className="on-dark relative flex min-h-[clamp(340px,calc(20.2vw+264px),650px)] flex-col overflow-hidden rounded-card bg-coal p-[clamp(28px,calc(3.2vw+16px),77px)] text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 85% 15%, rgb(255 255 255 / 0.10) 0%, transparent 55%), radial-gradient(80% 70% at 10% 110%, rgb(0 0 0 / 0.45) 0%, transparent 60%)",
          }}
        />
        <h2 className="relative max-w-[15ch] text-cta font-semibold text-balance">{cta.heading}</h2>
        {cta.button.href && cta.button.label && (
          <ButtonLink href={cta.button.href} variant="outline-light" size="lg" className="relative mt-[clamp(32px,calc(1.9vw+25px),62px)] w-fit">
            {cta.button.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

async function DualCallToAction({ cta }: { cta: SiteSettings["cta"] }) {
  const [projects, settings, servicesPage] = await Promise.all([getProjects(), getSettings(), getPage("services")]);
  const servicesHero = servicesPage?.sections.find((s): s is HeroSection => s._type === "hero");
  const servicesLink = settings.menu.find((m) => m.href === "/services");
  const second =
    servicesHero && servicesLink
      ? { heading: servicesHero.heading, button: { label: servicesLink.label, href: servicesLink.href } }
      : null;

  return (
    <div className="grid gap-[clamp(12px,calc(0.6vw+10px),25px)] px-gutter md:grid-cols-2">
      <CtaCard heading={cta.heading} button={cta.button} image={projects[0]?.cover} />
      {second && <CtaCard heading={second.heading} button={second.button} image={projects[1]?.cover ?? projects[0]?.cover} />}
    </div>
  );
}

function CtaCard({ heading, button, image }: { heading: string; button: LinkItem; image?: Img }) {
  return (
    <div
      data-reveal
      className="on-dark relative flex min-h-[clamp(320px,calc(14vw+240px),600px)] flex-col overflow-hidden rounded-card bg-coal p-[clamp(24px,calc(1.6vw+18px),48px)] text-white"
    >
      {image && (
        <div aria-hidden="true" className="absolute inset-0">
          <Media image={{ ...image, alt: "" }} sizes="(min-width: 768px) 48vw, 100vw" className="opacity-35 grayscale" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgb(34_34_34/0.92)_0%,rgb(34_34_34/0.55)_55%,rgb(34_34_34/0.35)_100%)]" />
        </div>
      )}
      <h2 className="relative max-w-[14ch] text-[length:clamp(30px,calc(1.15vw+25px),48px)] leading-[1.12] font-semibold tracking-[-0.015em] text-balance">
        {heading}
      </h2>
      {button.href && button.label && (
        <ButtonLink href={button.href} variant="outline-light" className="relative mt-[clamp(24px,calc(1.2vw+19px),44px)] w-fit">
          {button.label}
        </ButtonLink>
      )}
    </div>
  );
}
