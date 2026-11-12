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

export type Offering = { _key?: string; title: string; text?: string | null; image?: Img | null };

export type Faq = { _key?: string; question: string; answer: string };

export type Benefit = { _key?: string; title: string; text?: string | null };

type Titled = { label?: string | null; heading?: string | null; accent?: string | null };

/** Sections of the full service page (see servicePage.ts in the schema). */
export type ServicePage = {
  hero?: { image?: Img | null } | null;
  clientsLabel?: string | null;
  why?: Titled | null;
  stats?: { label?: string | null; items: { _key?: string; value: string; label: string }[] } | null;
  offer?: Titled | null;
  steps?: (Titled & { items: { _key?: string; title: string; text?: string | null }[] }) | null;
  related?: Titled | null;
};

export type Service = ServiceRef & ServicePage & {
  _id: string;
  order: number;
  /** A colourful thumbnail for service cards; the hero image is used when there is none. */
  card?: Img | null;
  tagline: string;
  description: string;
  included: string[];
  note?: string | null;
  statement?: string | null;
  benefits: Benefit[];
  offerings: Offering[];
  faqs: Faq[];
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
  /** A mockup that fills the big project card; the cover is used when there is none. */
  cardImage?: Img | null;
  coverVideo?: Video | null;
  order: number;
  summary?: string | null;
};

/**
 * `original`: full width at the image's own proportions, never cropped.
 * `phone`: a version shown instead on phones (used for the first image).
 */
export type GalleryItem = Img & {
  _key: string;
  size: "full" | "half" | "original";
  caption?: string | null;
  phone?: Omit<Img, "alt" | "hotspot"> | null;
};

export type ProjectStat = { _key?: string; value: string; label: string };

export type StoryBlock = { _key?: string; title: string; text: string };

export type Project = ProjectCard & {
  summary: string;
  tagline?: string | null;
  location?: string | null;
  stats: ProjectStat[];
  story: StoryBlock[];
  result?: { number?: string | null; label?: string | null } | null;
  gallery: GalleryItem[];
  /** A short screen-flow video shown after the first image. */
  flow?: ProjectFlow | null;
  liveUrl?: string | null;
  seo?: Seo | null;
};

/** A screen-flow loop: 16:10 for wider screens, with an optional square version for phones. */
export type ProjectFlow = {
  video: Video;
  videoWebm?: Video | null;
  phone?: Video | null;
  phoneWebm?: Video | null;
  poster?: { url: string } | null;
  posterPhone?: { url: string } | null;
};

export type HeroSection = {
  _type: "hero";
  _key: string;
  label?: string | null;
  heading: string;
  accent?: string | null;
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
  accent?: string | null;
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
  accent?: string | null;
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

export type ProcessStep = { _key?: string; title: string; text: string };

export type ProcessSection = {
  _type: "process";
  _key: string;
  label?: string | null;
  heading: string;
  accent?: string | null;
  steps: ProcessStep[];
};

export type ComparisonSection = {
  _type: "comparison";
  _key: string;
  label?: string | null;
  heading: string;
  accent?: string | null;
  columns: string[];
  rows: { _key?: string; label: string; cells: string[] }[];
};

export type ShowreelSection = {
  _type: "showreel";
  _key: string;
  label?: string | null;
  heading?: string | null;
  video?: Video | null;
  /** The same video as WebM, used where MP4 can't play. */
  videoWebm?: Video | null;
  poster?: Img | null;
};

export type CallToActionSection = { _type: "callToAction"; _key: string };

export type Section =
  | HeroSection
  | FeaturedProjectSection
  | ProjectGridSection
  | ServicesListSection
  | ShortTextSection
  | PromiseListSection
  | ProcessSection
  | ComparisonSection
  | ShowreelSection
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
  /** The floating bar's button: a different label from the header's. */
  dockButton: LinkItem;
  cta: { heading: string; button: LinkItem };
  enquirySuccessMessage: string;
  seo: { title: string; description: string; image?: Img | null };
};

/** Blog categories, in the order the filter shows them. */
export const POST_CATEGORIES = ["Websites", "Product design", "AI & automation", "Marketing", "Brand & creative"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export type PostCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  publishedAt: string;
  _updatedAt?: string;
  /** Reading time, worked out from the body. */
  readMinutes: number;
  cover: Img;
  /** Demo posts show only on /blog/preview, never to visitors or search. */
  demo?: boolean | null;
};

/** An image inside a post body. */
export type PostImageBlock = Img & { _type: "image"; _key: string; caption?: string | null };

export type Post = PostCard & {
  body: (PortableTextBlock | PostImageBlock)[];
  seo?: Seo | null;
};
