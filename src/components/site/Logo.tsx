import Image from "next/image";
import type { Img } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mark } from "./Mark";

/** CMS logo when uploaded, otherwise the logo mark on its own, with the name for screen readers. */
export function Logo({ logo, name, className }: { logo?: Img | null; name: string; className?: string }) {
  if (logo?.url) {
    const height = 28;
    const width = Math.round((logo.width / logo.height) * height) || 120;
    return (
      <Image
        src={logo.url}
        alt={logo.alt || name}
        width={width}
        height={height}
        priority
        unoptimized={logo.url.endsWith(".svg")}
        className={cn("h-[clamp(22px,1.47vw,28px)] w-auto", className)}
      />
    );
  }
  return (
    <span className={cn("flex", className)}>
      <Mark priority className="size-[clamp(40px,calc(1.05vw+36px),56px)]" />
      <span className="sr-only">{name}</span>
    </span>
  );
}
