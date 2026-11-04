import type { ImageLoaderProps } from "next/image";

/** CMS images live on Sanity's CDN, which resizes and converts them itself. */
export const isSanityImage = (src: string) => src.startsWith("https://cdn.sanity.io/images/");

/**
 * Ask Sanity's CDN for the size the browser needs, as AVIF or WebP. This is
 * cached worldwide, so an image is never waiting on a resize at our server.
 */
export function sanityLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  return url.toString();
}

/** The loader to pass next/image for this source: Sanity's, or the default. */
export const loaderFor = (src: string) => (isSanityImage(src) ? sanityLoader : undefined);
