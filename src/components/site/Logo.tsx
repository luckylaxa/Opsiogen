import Image from "next/image";
import onLight from "@/assets/opsiogen-logo-on-light.png";
import onDark from "@/assets/opsiogen-logo-on-dark.png";
import type { Img } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Logo height, from the design system's header (22px), scaled for the larger screens here. */
const SIZE = "h-[clamp(20px,calc(0.42vw+17px),26px)] w-auto";

/**
 * The design system's full logo (wordmark with the ribbon O), exactly as
 * supplied: the light-background version in the light theme and the
 * dark-background one in the dark theme, or always the dark-background one
 * with `tone="dark"`. A logo uploaded in the CMS replaces it.
 */
export function Logo({
  logo,
  name,
  tone = "auto",
  priority,
  className,
}: {
  logo?: Img | null;
  name: string;
  tone?: "auto" | "dark";
  priority?: boolean;
  className?: string;
}) {
  if (logo?.url) {
    const height = 28;
    const width = Math.round((logo.width / logo.height) * height) || 120;
    return (
      <Image
        src={logo.url}
        alt={logo.alt || name}
        width={width}
        height={height}
        loading={priority ? "eager" : undefined}
        unoptimized={logo.url.endsWith(".svg")}
        className={cn(SIZE, className)}
      />
    );
  }
  const sizes = "(min-width: 1024px) 160px, 130px";
  return (
    <span className={cn("flex", className)}>
      {tone === "auto" && (
        <Image src={onLight} alt="" aria-hidden="true" sizes={sizes} className={cn(SIZE, "dark:hidden")} />
      )}
      <Image
        src={onDark}
        alt=""
        aria-hidden="true"
        sizes={sizes}
        loading={priority ? "eager" : undefined}
        className={cn(SIZE, tone === "auto" && "hidden dark:block")}
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
