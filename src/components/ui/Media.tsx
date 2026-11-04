import { getImageProps } from "next/image";
import type { Img } from "@/lib/types";
import { loaderFor } from "@/lib/sanityImage";
import { cn } from "@/lib/utils";

type Props = {
  image: Img;
  sizes: string;
  className?: string;
  /** The page's main (LCP) image: loads at once, ahead of the rest. */
  priority?: boolean;
  /** Loads at once at normal priority, for images just below the first screen. */
  eager?: boolean;
  /** Fill the parent box (parent must be positioned and sized). */
  fill?: boolean;
  /** Shown instead on phones (below `phoneBelow`, 640px by default); each screen loads only its own image. */
  phone?: Omit<Img, "alt" | "hotspot"> | null;
  phoneBelow?: number;
};

const objectPosition = (img: Img) =>
  img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined;

/**
 * next/image wrapper for CMS and placeholder images. CMS images come straight
 * from Sanity's CDN at the size each screen needs; until one arrives, its tiny
 * preview (lqip) fills the box instead of an empty frame.
 */
export function Media({ image, sizes, className, priority, eager, fill = true, phone, phoneBelow = 640 }: Props) {
  const alt = image.alt || "";
  const load = priority
    ? { loading: "eager" as const, fetchPriority: "high" as const }
    : eager
      ? { loading: "eager" as const }
      : {};
  const props = (src: string, lqip?: string | null) =>
    getImageProps({
      src,
      alt,
      sizes,
      loader: loaderFor(src),
      ...(fill ? { fill: true } : { width: image.width, height: image.height }),
      // The preview stays behind the loaded image, so only opaque (JPEG) ones get it.
      ...(lqip && /\.jpe?g(\?|$)/i.test(src) ? { placeholder: "blur" as const, blurDataURL: lqip } : {}),
      ...load,
    }).props;

  if (fill && phone?.url) {
    const wide = props(image.url);
    const narrow = props(phone.url, phone.lqip ?? image.lqip);
    return (
      <picture>
        <source media={`(min-width: ${phoneBelow}px)`} srcSet={wide.srcSet} sizes={sizes} />
        <img
          {...narrow}
          alt={alt}
          className={cn("object-cover", className)}
          style={{ ...narrow.style, objectPosition: objectPosition(image) }}
        />
      </picture>
    );
  }
  const own = props(image.url, image.lqip);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- getImageProps already sized and optimised it
    <img
      {...own}
      alt={alt}
      className={cn(fill ? "object-cover" : "h-auto w-full", className)}
      style={{ ...own.style, objectPosition: fill ? objectPosition(image) : undefined }}
    />
  );
}
