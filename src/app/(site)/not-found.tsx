import type { Metadata } from "next";
import { GiantHeading } from "@/components/ui/Headings";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="-mt-[var(--header-h)] bg-band pb-[clamp(96px,calc(8vw+66px),220px)] pt-[calc(var(--header-h)+clamp(56px,calc(4vw+41px),140px))]">
      <GiantHeading as="h1" label="404" labelStyle="pill" heading="Page not found">
        <ButtonLink href="/" className="mt-[clamp(28px,calc(1.7vw+21.6px),54px)]">
          Back to home
        </ButtonLink>
      </GiantHeading>
    </section>
  );
}
