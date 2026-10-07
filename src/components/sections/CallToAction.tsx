import type { SiteSettings } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";

/** Shared call to action: the dark card from the reference, edited once in Site settings. */
export function CallToAction({ cta }: { cta: SiteSettings["cta"] }) {
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
