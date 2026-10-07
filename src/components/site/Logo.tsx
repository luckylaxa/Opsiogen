import Image from "next/image";
import type { Img } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mark } from "./Mark";

/** CMS logo when uploaded, otherwise the logo mark beside the name set as a wordmark. */
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
    <span
      className={cn(
        "inline-flex items-center gap-[0.3em] text-[clamp(22px,calc(0.33vw+20.8px),27px)] font-semibold leading-none tracking-[-0.035em]",
        className,
      )}
    >
      <Mark priority className="size-[1.3em]" />
      {name}
    </span>
  );
}
