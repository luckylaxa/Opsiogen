import type { Metadata } from "next";
import type { Img, Seo } from "./types";

/** Shorten text to a search-friendly length at a word boundary. */
export function clip(text: string, max = 160) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/** Build page metadata from CMS SEO fields with sensible fallbacks. */
export function buildMetadata({
  title,
  description,
  seo,
  image,
  path,
}: {
  title?: string;
  description?: string | null;
  seo?: Seo | null;
  image?: Img | null;
  path: string;
}): Metadata {
  const shareImage = seo?.image?.url ? seo.image : image;
  const pageTitle = seo?.title || title;
  const pageDescription = seo?.description || (description ? clip(description) : undefined);
  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: path },
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: path,
      images: shareImage
        ? [{ url: shareImage.url, width: shareImage.width, height: shareImage.height, alt: shareImage.alt }]
        : undefined,
    },
  };
}
