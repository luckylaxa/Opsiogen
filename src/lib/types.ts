import type { PortableTextBlock } from "next-sanity";

/** An image normalised from Sanity (or a local placeholder) for next/image. */
export type Img = {
  url: string;
  width: number;
  height: number;
  alt: string;
  lqip?: string | null;
  hotspot?: { x: number; y: number } | null;
};

export type Video = { url: string; mimeType?: string | null };

export type LinkItem = { _key?: string; label: string; href: string };

export type Seo = {
  title?: string | null;
  description?: string | null;
  image?: Img | null;
  noIndex?: boolean | null;
};

export type ServiceGroup = "build" | "grow" | "create";

export type ServiceRef = {
  name: string;
  slug: string;
  shortName: string;
  group: ServiceGroup;
};

export type Service = ServiceRef & {
  _id: string;
  order: number;
  tagline: string;
  description: string;
  included: string[];
  note?: string | null;
  seo?: Seo | null;
};

export type ProjectCard = {
  _id: string;
  name: string;
  slug: string;
  client: string;
  industry?: string | null;
  year?: string | null;
  services: ServiceRef[];
  cover: Img;
  coverVideo?: Video | null;
  order: number;
};

export type GalleryItem = Img & { _key: string; size: "full" | "half" };

export type Project = ProjectCard & {
  summary: string;
  result?: { number?: string | null; label?: string | null } | null;
  gallery: GalleryItem[];
  liveUrl?: string | null;
  seo?: Seo | null;
};

export type HeroSection = {
  _type: "hero";
  _key: string;
  label?: string | null;
  heading: string;
  text?: string | null;
  button?: LinkItem | null;
};

export type FeaturedProjectSection = {
  _type: "featuredProject";
  _key: string;
  project?: ProjectCard | null;
};

export type ProjectGridSection = {
  _type: "projectGrid";
  _key: string;
  label?: string | null;
  heading?: string | null;
  text?: string | null;
  limit?: number | null;
  showFilters?: boolean | null;
  link?: LinkItem | null;
};

export type ServicesListSection = {
  _type: "servicesList";
  _key: string;
  label?: string | null;
  heading?: string | null;
  text?: string | null;
};

export type ShortTextSection = {
  _type: "shortText";
  _key: string;
  label?: string | null;
  heading?: string | null;
  body?: PortableTextBlock[] | null;
};

export type PromiseListSection = {
  _type: "promiseList";
  _key: string;
  label?: string | null;
  heading?: string | null;
  items: string[];
  layout?: "cards" | "rows" | null;
};

export type CallToActionSection = { _type: "callToAction"; _key: string };

export type Section =
  | HeroSection
  | FeaturedProjectSection
  | ProjectGridSection
  | ServicesListSection
  | ShortTextSection
  | PromiseListSection
  | CallToActionSection;

export type Page = {
  _id: string;
  title: string;
  slug: string;
  seo?: Seo | null;
  sections: Section[];
};

export type SiteSettings = {
  siteTitle: string;
  logo?: Img | null;
  logoOnDark?: Img | null;
  footerLine: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  socialLinks: LinkItem[];
  menu: LinkItem[];
  headerButton: LinkItem;
  cta: { heading: string; button: LinkItem };
  enquirySuccessMessage: string;
  seo: { title: string; description: string; image?: Img | null };
};
