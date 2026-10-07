/**
 * Starter content for Opsiogen, taken from website-brief.md.
 *
 * Used in two places:
 *  - scripts/seed.ts uploads it to Sanity (run once after connecting a project).
 *  - src/lib/data.ts serves it as a fallback when no Sanity project is configured,
 *    so the site can be run and reviewed before the CMS is connected.
 *
 * The six projects are neutral placeholders. Replace them in /studio.
 */
import type {
  Page,
  Project,
  Service,
  ServiceRef,
  SiteSettings,
} from "@/lib/types";

export const SETTINGS: SiteSettings = {
  siteTitle: "Opsiogen",
  logo: null,
  logoOnDark: null,
  footerLine: "Your digital department, without the hiring.",
  email: null,
  phone: null,
  location: null,
  socialLinks: [],
  menu: [
    { _key: "work", label: "Work", href: "/work" },
    { _key: "services", label: "Services", href: "/services" },
    { _key: "about", label: "About", href: "/about" },
    { _key: "contact", label: "Contact", href: "/contact" },
  ],
  headerButton: { label: "Start a project", href: "/contact" },
  cta: {
    heading: "One partner. Every digital need. One monthly plan.",
    button: { label: "Start a project", href: "/contact" },
  },
  enquirySuccessMessage:
    "Thanks, we’ve got your message. We’ll be in touch soon.",
  seo: {
    title: "Opsiogen | Your digital department, without the hiring.",
    description:
      "Opsiogen is the outsourced digital department for growing businesses that don’t have one in-house.",
    image: {
      url: "/placeholders/share-default.jpg",
      width: 1200,
      height: 630,
      alt: "Opsiogen",
    },
  },
};

export const SERVICES: Service[] = [
  {
    _id: "service-ai-websites",
    name: "AI Websites & Revamps",
    slug: "ai-websites",
    shortName: "Websites",
    group: "build",
    order: 1,
    tagline: "Modern websites, live in a week.",
    description:
      "We design and build fast, conversion-focused websites with an easy-to-use CMS, so you can update content without waiting on developers. Built with AI and finished by designers, your site goes from brief to launch in days, not months.",
    included: [
      "New websites",
      "Revamps of outdated sites",
      "Landing pages",
      "SaaS and product sites",
      "Corporate and portfolio sites",
    ],
    note: "The 7-day timeline applies to basic websites.",
  },
  {
    _id: "service-ai-product-design",
    name: "AI Product Design & Design Systems",
    slug: "ai-product-design",
    shortName: "Product Design",
    group: "build",
    order: 2,
    tagline: "Products people adopt. Systems that scale.",
    description:
      "We design SaaS, enterprise and mobile products that are simple to use and quick to adopt. AI speeds up research, flows and screens, and our designers make every decision count. Design systems keep your product consistent as it grows from MVP to enterprise.",
    included: [
      "UX audits",
      "Product redesigns",
      "New product UX/UI",
      "Mobile app design",
      "Design systems",
      "Developer-ready handoff",
    ],
  },
  {
    _id: "service-ai-mvps-business-apps",
    name: "AI MVPs & Business Apps",
    slug: "ai-mvps-business-apps",
    shortName: "MVPs & Apps",
    group: "build",
    order: 3,
    tagline: "From idea to working product in weeks.",
    description:
      "We turn ideas into working software fast: MVPs to test with users and investors, portals for your customers, and internal tools that replace spreadsheets and manual work.",
    included: [
      "MVPs and prototypes",
      "Customer and partner portals",
      "Dashboards",
      "Booking and intake systems",
      "Internal tools and trackers",
    ],
  },
  {
    _id: "service-ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    shortName: "Automation",
    group: "build",
    order: 4,
    tagline: "Less manual work. Faster operations.",
    description:
      "We find the repetitive tasks slowing your business down and automate them with AI, from lead handling and document processing to reports and approvals. Your tools work together, and your people get hours back every week.",
    included: [
      "Process audit",
      "Lead and enquiry automation",
      "Document and data extraction",
      "AI chatbots",
      "Report and proposal generation",
      "Approval workflows",
      "Monthly care plan",
    ],
  },
  {
    _id: "service-ai-social-media-marketing",
    name: "AI Social Media Marketing",
    slug: "ai-social-media-marketing",
    shortName: "Social Media",
    group: "grow",
    order: 5,
    tagline: "Always-on content that keeps your brand visible.",
    description:
      "We plan, create and publish your social content every month: posts, reels, AI video and captions in your brand voice. You get consistent output, faster turnaround and a clear monthly report.",
    included: [
      "Content calendar",
      "Post and carousel design",
      "Reels and AI video",
      "Captions",
      "Scheduling and publishing",
      "Performance reporting",
    ],
  },
  {
    _id: "service-digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    shortName: "Digital Marketing",
    group: "grow",
    order: 6,
    tagline: "Campaigns built for leads and sales.",
    description:
      "We run paid campaigns and search visibility aimed at what matters: enquiries, leads and return on ad spend.",
    // The brief lists ad platforms by name; the copy rules exclude platform names.
    included: [
      "Paid social and search ads",
      "Lead generation campaigns",
      "SEO",
      "Analytics and reporting",
    ],
  },
  {
    _id: "service-ai-creative-subscription",
    name: "AI Creative Subscription",
    slug: "ai-creative-subscription",
    shortName: "Creative",
    group: "create",
    order: 7,
    tagline: "On-demand creative, one monthly plan.",
    description:
      "Dedicated creative support on a flat monthly subscription. Send requests any time and we deliver on-brand work fast, without hiring in-house or briefing a new agency for every project.",
    included: [
      "Ad creatives",
      "Presentations and pitch decks",
      "Brand assets",
      "Motion graphics",
      "AI imagery and video",
      "Email and landing page design",
    ],
  },
  {
    _id: "service-ai-print-collateral",
    name: "AI Print & Collateral Design",
    slug: "ai-print-collateral",
    shortName: "Print",
    group: "create",
    order: 8,
    tagline: "Print-ready design, delivered faster.",
    description:
      "We design brochures, catalogues, packaging and event collateral with AI speed and designer precision. Every file is checked and delivered ready for print.",
    included: [
      "Brochures",
      "Catalogues",
      "Flyers",
      "Posters",
      "Packaging and labels",
      "Stationery",
      "Expo booths and banners",
    ],
  },
];

const ref = (slug: string): ServiceRef => {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service ${slug}`);
  return { name: s.name, slug: s.slug, shortName: s.shortName, group: s.group };
};

const placeholder = (slug: string, file: string, w: number, h: number, name: string) => ({
  url: `/placeholders/${slug}-${file}.jpg`,
  width: w,
  height: h,
  alt: `Placeholder image for the ${name} project`,
});

const SUMMARY =
  "Placeholder project. Replace this summary in the studio with two or three lines on what we did.";

function makeProject(
  order: number,
  name: string,
  slug: string,
  industry: string,
  services: string[],
  video = false,
): Project {
  return {
    _id: `project-${slug}`,
    name,
    slug,
    client: "Client name",
    industry,
    year: "2026",
    services: services.map(ref),
    cover: placeholder(slug, "cover", 1600, 1200, name),
    coverVideo: video ? { url: `/placeholders/${slug}-cover.mp4`, mimeType: "video/mp4" } : null,
    order,
    summary: SUMMARY,
    result: null,
    liveUrl: null,
    gallery: [
      { _key: "g1", size: "full", ...placeholder(slug, "1", 2400, 1350, name) },
      { _key: "g2", size: "half", ...placeholder(slug, "2", 1200, 1500, name) },
      { _key: "g3", size: "half", ...placeholder(slug, "3", 1200, 1500, name) },
      { _key: "g4", size: "full", ...placeholder(slug, "4", 2400, 1350, name) },
    ],
  };
}

export const PROJECTS: Project[] = [
  makeProject(1, "Website Revamp", "website-revamp", "Manufacturing", ["ai-websites"], true),
  makeProject(2, "Product Redesign", "product-redesign", "SaaS", ["ai-product-design"]),
  makeProject(3, "Booking Portal", "booking-portal", "Healthcare", ["ai-mvps-business-apps"]),
  makeProject(4, "Lead Automation", "lead-automation", "Services", ["ai-automation"]),
  makeProject(5, "Social Campaign", "social-campaign", "Exports", [
    "ai-social-media-marketing",
    "digital-marketing",
  ]),
  makeProject(6, "Product Catalogue", "product-catalogue", "Manufacturing", [
    "ai-print-collateral",
    "ai-creative-subscription",
  ]),
];

/** Slug of the project featured on Home (set in Site settings). */
export const FEATURED_PROJECT_SLUG = "website-revamp";

const block = (key: string, text: string, style: "normal" | "h2" = "normal") => ({
  _type: "block" as const,
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: "span" as const, _key: `${key}s`, text, marks: [] }],
});

export const PAGES: Page[] = [
  {
    _id: "page-home",
    title: "Home",
    slug: "home",
    seo: null,
    sections: [
      {
        _type: "hero",
        _key: "hero",
        label: "AI-first design and digital company",
        heading: "Your digital department, without the hiring.",
        button: { label: "Start a project", href: "/contact" },
      },
      { _type: "featuredProject", _key: "featured", project: null },
      {
        _type: "projectGrid",
        _key: "latest",
        label: "Latest",
        heading: "Work",
        limit: 6,
        showFilters: false,
        link: { label: "View all work", href: "/work" },
      },
      { _type: "servicesList", _key: "services", heading: "Our services." },
      { _type: "callToAction", _key: "cta" },
    ],
  },
  {
    _id: "page-work",
    title: "Work",
    slug: "work",
    seo: null,
    sections: [
      {
        _type: "hero",
        _key: "hero",
        heading: "Work",
        text: "Selected projects across websites, products, content and print.",
      },
      { _type: "projectGrid", _key: "grid", limit: 12, showFilters: true },
      { _type: "callToAction", _key: "cta" },
    ],
  },
  {
    _id: "page-services",
    title: "Services",
    slug: "services",
    seo: null,
    sections: [
      {
        _type: "hero",
        _key: "hero",
        heading: "Everything digital, done for you.",
        text: "Start on a monthly plan or bring us a project.",
      },
      { _type: "servicesList", _key: "services" },
      { _type: "callToAction", _key: "cta" },
    ],
  },
  {
    _id: "page-about",
    title: "About",
    slug: "about",
    seo: null,
    sections: [
      {
        _type: "hero",
        _key: "hero",
        heading: "The digital department for businesses that don’t have one.",
        text: "Opsiogen is the outsourced digital department for growing businesses that don’t have one in-house. We use AI at every stage of our work, so we deliver in days what traditionally takes months.",
      },
      {
        _type: "promiseList",
        _key: "promises",
        label: "Promises",
        layout: "cards",
        items: [
          "One partner for every digital need",
          "Delivery in days, not months",
          "Fixed, published prices",
          "You own everything we build",
        ],
      },
      {
        _type: "promiseList",
        _key: "serve",
        label: "Who we serve",
        layout: "rows",
        items: [
          "Manufacturers",
          "Exporters",
          "Healthcare providers",
          "Service businesses",
          "Startups building their first product",
        ],
      },
      { _type: "callToAction", _key: "cta" },
    ],
  },
  {
    _id: "page-contact",
    title: "Contact",
    slug: "contact",
    seo: null,
    sections: [
      {
        _type: "hero",
        _key: "hero",
        heading: "Start a project.",
        text: "Tell us what you need. We’ll come back with a fixed price or the right plan.",
      },
    ],
  },
  {
    _id: "page-privacy",
    title: "Privacy Policy",
    slug: "privacy",
    seo: { noIndex: false },
    sections: [
      { _type: "hero", _key: "hero", heading: "Privacy Policy" },
      {
        _type: "shortText",
        _key: "body",
        body: [
          block(
            "p1",
            "This is placeholder text. Replace it in the studio with your privacy policy before launch.",
          ),
          block("h1", "Information we collect", "h2"),
          block(
            "p2",
            "Placeholder: describe what information is collected through the contact form and how it is used.",
          ),
          block("h2", "How to contact us", "h2"),
          block(
            "p3",
            "Placeholder: explain how people can ask about or update the information you hold about them.",
          ),
        ],
      },
    ],
  },
];

export const CONTACT_FORM = {
  extraNeeds: ["Monthly Digital Department plan", "Not sure yet"],
  sources: ["Event or expo", "Search", "Referral", "Social media", "Other"],
};
