import Image, { getImageProps } from "next/image";
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
  /** Shown instead on phones (below 640px); each screen loads only its own image. */
  phone?: Omit<Img, "alt" | "hotspot"> | null;
};

const objectPosition = (img: Img) =>
  img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined;

/** next/image wrapper for CMS and placeholder images. */
export function Media({ image, sizes, className, priority, fill = true, phone }: Props) {
  const blur = image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
  const load = priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {};
  if (fill && phone?.url) {
    const alt = image.alt || "";
    const common = { alt, fill: true, sizes, ...load };
    const { props: wide } = getImageProps({ ...common, src: image.url });
    const { props: narrow } = getImageProps({ ...common, src: phone.url });
    return (
      <picture>
        <source media="(min-width: 640px)" srcSet={wide.srcSet} sizes={sizes} />
        <img
          {...narrow}
          alt={alt}
          className={cn("object-cover", className)}
          style={{ ...narrow.style, objectPosition: objectPosition(image) }}
        />
      </picture>
    );
  }
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
