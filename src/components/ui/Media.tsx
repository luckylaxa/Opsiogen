import Image from "next/image";
import type { Img } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  image: Img;
  sizes: string;
  className?: string;
  /** The page's main (LCP) image: loads at once, ahead of the rest. */
  priority?: boolean;
  /** Fill the parent box (parent must be positioned and sized). */
  fill?: boolean;
};

const objectPosition = (img: Img) =>
  img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined;

/** next/image wrapper for CMS and placeholder images. */
export function Media({ image, sizes, className, priority, fill = true }: Props) {
  const blur = image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
  const load = priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {};
  if (fill) {
    return (
      <Image
        src={image.url}
        alt={image.alt || ""}
        fill
        sizes={sizes}
        {...load}
        className={cn("object-cover", className)}
        style={{ objectPosition: objectPosition(image) }}
        {...blur}
      />
    );
  }
  return (
    <Image
      src={image.url}
      alt={image.alt || ""}
      width={image.width}
      height={image.height}
      sizes={sizes}
      {...load}
      className={cn("h-auto w-full", className)}
      {...blur}
    />
  );
}
