import { getImageProps } from "next/image";
import { preload } from "react-dom";
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
  /** Further down a page: loads as it nears the screen, after the main image. */
  lowPriority?: boolean;
  /** Fill the parent box (parent must be positioned and sized). */
  fill?: boolean;
  /** Shown instead on phones (below `phoneBelow`, 640px by default); each screen loads only its own image. */
  phone?: Omit<Img, "alt" | "hotspot"> | null;
  phoneBelow?: number;
};

const objectPosition = (img: Img) =>
  img.hotspot ? `${Math.round(img.hotspot.x * 100)}% ${Math.round(img.hotspot.y * 100)}%` : undefined;

/**
 * next/image wrapper for CMS and placeholder images. CMS images, the page's main
 * (`priority`) image included, come straight from Sanity's CDN at the size each
 * screen needs; until one arrives, the box shows one flat colour taken from the
 * image's tiny preview (never a blur).
 */
export function Media({ image, sizes, className, priority, eager, lowPriority, fill = true, phone, phoneBelow = 640 }: Props) {
  const alt = image.alt || "";
  const load = priority
    ? { loading: "eager" as const, fetchPriority: "high" as const }
    : eager
      ? { loading: "eager" as const }
      : lowPriority
        ? { loading: "lazy" as const, fetchPriority: "low" as const }
        : {};
  // A flat colour while loading: the preview stretched so far that one pixel fills the box. Opaque (JPEG) only.
  const flat = (src: string, lqip?: string | null) =>
    lqip && /\.jpe?g(\?|$)/i.test(src)
      ? { backgroundImage: `url(${lqip})`, backgroundSize: "100000% 100000%", backgroundPosition: "50% 50%" }
      : {};
  const props = (src: string) =>
    getImageProps({
      src,
      alt,
      sizes,
      // Straight from Sanity's CDN, the main image too: it is near every visitor and keeps its copies,
      // while our one server (Hostinger, Mumbai) would make each size again after every deploy. (On
      // Vercel, until 26 Nov, the main image came through the site's own address instead.) The layout
      // preconnects to the CDN, so the connection is open by the time the image is asked for.
      loader: loaderFor(src),
      ...(fill ? { fill: true } : { width: image.width, height: image.height }),
      ...load,
    }).props;

  if (fill && phone?.url) {
    const wide = props(image.url);
    const narrow = props(phone.url);
    if (priority) {
      // React preloads a plain main image by itself, but not one inside <picture> (it can't tell which
      // source a screen will pick), so phones found it late, in the page body. One hint per screen size,
      // in <head>: each device fetches only its own version, straight away.
      const hint = { as: "image" as const, imageSizes: sizes, fetchPriority: "high" as const };
      preload(narrow.src, { ...hint, imageSrcSet: narrow.srcSet, media: `(max-width: ${phoneBelow - 0.02}px)` });
      preload(wide.src, { ...hint, imageSrcSet: wide.srcSet, media: `(min-width: ${phoneBelow}px)` });
    }
    return (
      <picture>
        <source media={`(min-width: ${phoneBelow}px)`} srcSet={wide.srcSet} sizes={sizes} />
        <img
          {...narrow}
          alt={alt}
          className={cn("object-cover", className)}
          style={{ ...narrow.style, ...flat(phone.url, phone.lqip ?? image.lqip), objectPosition: objectPosition(image) }}
        />
      </picture>
    );
  }
  const own = props(image.url);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- getImageProps already sized and optimised it
    <img
      {...own}
      alt={alt}
      className={cn(fill ? "object-cover" : "h-auto w-full", className)}
      style={{ ...own.style, ...flat(image.url, image.lqip), objectPosition: fill ? objectPosition(image) : undefined }}
    />
  );
}
