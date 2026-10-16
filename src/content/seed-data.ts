/**
 * Starter content for Opsiogen, taken from website-brief.md.
 *
 * Used in two places:
 *  - scripts/seed.ts uploads it to Sanity (run once after connecting a project).
 *  - src/lib/data.ts serves it as a fallback when no Sanity project is configured,
 *    so the site can be run and reviewed before the CMS is connected.
 *
 * Services, case studies and service-page copy follow the content document;
 * edit any of it in /studio.
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
      url: "/share.jpg",
      width: 1200,
      height: 630,
      alt: "Opsiogen: Your digital department, without the hiring.",
    },
  },
};

type Pair = [string, string];
const offerings = (items: Pair[]) => items.map(([title, text], i) => ({ _key: `o${i + 1}`, title, text }));
const faqs = (items: Pair[]) => items.map(([question, answer], i) => ({ _key: `q${i + 1}`, question, answer }));

const OWNERSHIP: Pair = ["Who owns the work?", "You do. You own everything we build."];
const PRICING: Pair = [
  "How is the work priced?",
  "With a fixed price agreed before we start, or a monthly plan. Start on a monthly plan or bring us a project.",
];

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
    offerings: offerings([
      ["New websites", "Designed around your offer and built to turn visits into enquiries."],
      ["Website revamps", "Outdated sites rebuilt to look current, load fast and work on every screen."],
      ["Landing pages", "Focused pages for campaigns, launches and lead generation."],
      ["SaaS and product sites", "Sites that explain your product clearly and lead to sign-ups and demos."],
      ["Corporate and portfolio sites", "A clear, credible home for your business and your work."],
      ["Easy-to-use CMS", "Change text, pages and images yourself, without waiting on developers."],
    ]),
    faqs: faqs([
      [
        "How fast can my website go live?",
        "Basic websites go live in 7 days. Larger sites take longer, and we agree the timeline with you before we start.",
      ],
      [
        "Can I update the site myself?",
        "Yes. Every site comes with an easy-to-use CMS, so you can edit text, pages and images without a developer.",
      ],
      ["Can you revamp my current site?", "Yes. We redesign and rebuild outdated sites and keep the content that still works."],
      PRICING,
      OWNERSHIP,
    ]),
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
    offerings: offerings([
      ["UX audits", "We review your product, find where people get stuck and rank the fixes."],
      ["Product redesigns", "Complex products made simpler to use and quicker to adopt."],
      ["New product UX/UI", "From user flows and wireframes to polished, tested screens."],
      ["Mobile app design", "App experiences designed for phones and tablets."],
      ["Design systems", "Reusable components and clear rules that keep your product consistent as it grows."],
      ["Developer-ready handoff", "Specs, assets and annotated screens your developers can build from."],
    ]),
    faqs: faqs([
      ["Do you work on existing products?", "Yes. We audit and redesign live products as well as design new ones."],
      [
        "Can you build a design system for us?",
        "Yes. We create the components, styles and rules your designers and developers share, so the product stays consistent from MVP to enterprise.",
      ],
      [
        "How do you use AI in product design?",
        "AI speeds up research, flows and screens. Our designers make every decision count.",
      ],
      OWNERSHIP,
    ]),
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
      "We use AI to turn ideas into working software fast: MVPs to test with users and investors, portals for your customers, and internal tools that replace spreadsheets and manual work.",
    included: [
      "MVPs and prototypes",
      "AI-powered features",
      "Customer and partner portals",
      "Dashboards",
      "Booking and intake systems",
      "Internal tools and trackers",
    ],
    offerings: offerings([
      ["MVPs and prototypes", "A working first version to test with users and investors."],
      ["AI-powered features", "Smart search, chat, summaries and forms built into your product."],
      ["Customer and partner portals", "One place for customers and partners to log in, track and get things done."],
      ["Dashboards", "Live views of the numbers that matter, in one place."],
      ["Booking and intake systems", "Online booking and intake that feed straight into your workflow."],
      ["Internal tools and trackers", "Simple tools that replace spreadsheets and manual work."],
    ]),
    faqs: faqs([
      [
        "How fast can you build an MVP?",
        "We take you from idea to working product in weeks, and agree the scope and timeline before we start.",
      ],
      ["Can the MVP grow into a full product?", "Yes. We build the first version so it can grow with your users and your business."],
      ["Do we need our own developers?", "No. We design, build and launch, then support the product after launch."],
      OWNERSHIP,
    ]),
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
      "Internal dashboard automation",
      "Document and data extraction",
      "AI chatbots and voice assistants",
      "Report and proposal generation",
      "Approval workflows",
      "Monthly care plan",
    ],
    offerings: offerings([
      ["Process audit", "We map how work gets done and find the tasks worth automating first."],
      ["Lead and enquiry automation", "Every enquiry captured, sorted and followed up without manual work."],
      ["Internal dashboard automation", "Dashboards and reports that update themselves from the tools you use."],
      ["Document and data extraction", "Data pulled from forms, invoices and PDFs into your systems."],
      ["AI chatbots and voice assistants", "Assistants that answer questions and handle routine requests by chat or voice."],
      ["Reports, proposals and approvals", "Documents generated and approvals routed automatically."],
      ["Monthly care plan", "We monitor, fix and improve your automations every month."],
    ]),
    faqs: faqs([
      [
        "What can be automated?",
        "Repetitive, rule-based work such as data entry, follow-ups, reports, approvals and document handling. A process audit shows where to start.",
      ],
      [
        "Will it work with the tools we use?",
        "We connect the tools you already have wherever they allow it, so your people don’t have to switch.",
      ],
      ["What happens after launch?", "The monthly care plan keeps your automations running and improving."],
      OWNERSHIP,
    ]),
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
    offerings: offerings([
      ["Content calendar", "A monthly plan built around your goals, launches and events."],
      ["Posts and carousels", "On-brand designs for every channel, made fast with AI."],
      ["Reels and AI video", "Short videos that keep your brand in the feed."],
      ["Captions", "Copy in your brand voice, written for each channel."],
      ["Scheduling and publishing", "We publish to your calendar, so you don’t have to."],
      ["Performance reporting", "A clear monthly report on what worked and what’s next."],
    ]),
    faqs: faqs([
      ["How much content do we get?", "It depends on your plan. We agree the monthly output with you before we start."],
      [
        "Will it sound like us?",
        "Yes. We work from your brand voice and guidelines, and you approve the calendar before anything goes live.",
      ],
      ["Do you publish for us?", "Yes. We schedule and publish your content, then report on performance every month."],
    ]),
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
    offerings: offerings([
      ["Paid social ads", "Campaigns aimed at the people most likely to buy."],
      ["Search ads", "Be found when customers search for what you offer."],
      ["Lead generation campaigns", "Campaigns and landing pages built to bring in enquiries."],
      ["SEO", "Better search visibility through content, structure and technical fixes."],
      ["Analytics and reporting", "Clear tracking of leads, sales and return on ad spend."],
    ]),
    faqs: faqs([
      ["What do you measure?", "What matters to your business: enquiries, leads and return on ad spend."],
      ["Can you take over our current campaigns?", "Yes. We review what’s running, keep what works and fix what doesn’t."],
      PRICING,
    ]),
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
    offerings: offerings([
      ["Ad creatives", "Static and animated ads sized for every channel."],
      ["Presentations and pitch decks", "Decks that make your story clear and convincing."],
      ["Brand assets", "Templates, icons, illustrations and everyday brand materials."],
      ["Motion graphics", "Animated graphics for social, ads and product stories."],
      ["AI imagery and video", "Original visuals made with AI and finished by designers."],
      ["Email and landing page design", "Designs for campaigns, newsletters and launches."],
    ]),
    faqs: faqs([
      [
        "How does the subscription work?",
        "One flat monthly fee. Send requests any time and we deliver on-brand work fast.",
      ],
      [
        "Why not hire in-house?",
        "You get dedicated creative support without hiring, or briefing a new agency for every project.",
      ],
      OWNERSHIP,
    ]),
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
      "We design brochures, catalogues, packaging, merchandise and event collateral with AI speed and designer precision. Every file is checked and delivered ready for print.",
    included: [
      "Brochures",
      "Catalogues",
      "Flyers",
      "Posters",
      "Packaging and labels",
      "Merchandise and apparel",
      "Stationery",
      "Expo booths and banners",
    ],
    offerings: offerings([
      ["Brochures and catalogues", "Clear layouts that present your products and services well."],
      ["Flyers and posters", "Bold print for events, promotions and launches."],
      ["Packaging and labels", "Packaging that stands out on the shelf and meets print specs."],
      ["Merchandise and apparel", "Branded merchandise, uniforms and giveaways."],
      ["Stationery", "Business cards, letterheads and everyday brand print."],
      ["Expo booths and banners", "Large-format graphics for exhibitions and events."],
    ]),
    faqs: faqs([
      ["Are the files ready for print?", "Yes. Every file is checked and delivered ready for print."],
      ["Do you design for exhibitions?", "Yes. We design expo booths, banners and event collateral."],
      OWNERSHIP,
    ]),
  },
  {
    _id: "service-ai-brand",
    name: "AI Brand Services",
    slug: "ai-brand-services",
    shortName: "Brand",
    group: "create",
    order: 9,
    tagline: "A clear, consistent brand, built faster.",
    description:
      "We create and refresh brands: logo, colours, type and guidelines, plus the templates your business uses every day. AI speeds up exploration, and our designers make sure every choice fits.",
    included: [
      "Logo and visual identity",
      "Brand guidelines",
      "Brand refresh",
      "Brand assets and templates",
      "Brand rollout",
    ],
    offerings: offerings([
      ["Logo and visual identity", "A distinctive logo, colours and type that fit your business."],
      ["Brand guidelines", "Clear rules, so everyone uses your brand the same way."],
      ["Brand refresh", "A modern update that keeps what people already recognise."],
      ["Brand assets and templates", "Ready-to-use templates for decks, social posts and documents."],
      ["Brand rollout", "Your new brand applied across website, social and print."],
    ]),
    faqs: faqs([
      ["Can you refresh our existing brand?", "Yes. We modernise what you have and keep the parts people recognise."],
      [
        "What do we receive?",
        "Logo files, colours, type, brand guidelines and the templates you need, ready to use.",
      ],
      OWNERSHIP,
    ]),
  },
  {
    _id: "service-ai-video",
    name: "AI Video Production",
    slug: "ai-video-production",
    shortName: "Video",
    group: "create",
    order: 10,
    tagline: "Video that explains, sells and gets shared.",
    description:
      "We plan, script and produce video for products, ads and social. AI speeds up scripts, visuals and edits, and our designers make sure every frame is on brand.",
    included: [
      "Explainer and product videos",
      "Social video and reels",
      "Video ads",
      "Motion graphics and animation",
      "AI video",
    ],
    offerings: offerings([
      ["Explainer and product videos", "Short videos that show what you do and why it matters."],
      ["Social video and reels", "Vertical, fast-paced video made for social channels."],
      ["Video ads", "Ads cut to the length and format of every placement."],
      ["Motion graphics and animation", "Animated stories, titles and data that make ideas easy to follow."],
      ["AI video", "Visuals, voiceovers and scenes made with AI and finished by designers."],
    ]),
    faqs: faqs([
      ["Do we need to film anything?", "Not always. Many videos are made with motion graphics and AI, with no shoot needed."],
      ["Which formats do you deliver?", "Every size you need, wide, square and vertical, ready to publish."],
      OWNERSHIP,
    ]),
  },
];

const ref = (slug: string): ServiceRef => {
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown service ${slug}`);
  return { name: s.name, slug: s.slug, shortName: s.shortName, group: s.group };
};

type ProjectInput = {
  name: string;
  slug: string;
  industry?: string;
  services: string[];
  summary: string;
  liveUrl?: string;
};

/** A case study with its generated title-card cover from public/covers. */
function makeProject(order: number, p: ProjectInput): Project {
  const services = p.services.map(ref);
  return {
    _id: `project-${p.slug}`,
    name: p.name,
    slug: p.slug,
    client: p.name,
    industry: p.industry ?? null,
    year: null,
    services,
    cover: {
      url: `/covers/${p.slug}.jpg`,
      width: 1600,
      height: 1200,
      alt: `${p.name}: ${services.map((s) => s.name).join(", ")}`,
    },
    coverVideo: null,
    order,
    summary: p.summary,
    story: [],
    result: null,
    liveUrl: p.liveUrl ?? null,
    gallery: [],
  };
}

/**
 * Client work from the content document. Summaries only state what the
 * document and the clients' own public pages show; add the full story,
 * year, results and images in the studio.
 */
const CASE_STUDIES: ProjectInput[] = [
  {
    name: "Surgo Health",
    slug: "surgo-health",
    industry: "Healthcare",
    services: ["ai-product-design", "ai-websites"],
    summary:
      "Surgo Health uses behavioural science and AI to understand health behaviour. We designed its insight dashboards, a survey app and its marketing website.",
    liveUrl: "https://www.surgohealth.com/",
  },
  {
    name: "Rohde & Schwarz",
    slug: "rohde-schwarz",
    industry: "Technology",
    services: ["ai-social-media-marketing", "ai-automation", "digital-marketing", "ai-print-collateral"],
    summary:
      "Social media, digital marketing and print for Rohde & Schwarz in India, plus an AI voice assistant.",
    liveUrl: "https://www.rohde-schwarz.com/in/home_48230.html",
  },
  {
    name: "BigTapp",
    slug: "bigtapp",
    industry: "Data, AI and automation",
    services: ["ai-websites", "digital-marketing", "ai-print-collateral"],
    summary: "Website, digital marketing and print for BigTapp, an enterprise data, AI and automation company.",
    liveUrl: "https://www.bigtapp.ai/",
  },
  {
    name: "Care Connect",
    slug: "care-connect",
    services: ["ai-product-design", "ai-mvps-business-apps"],
    summary: "Product design and app development for Care Connect, from the first flows to a working product.",
  },
  {
    name: "SandLogic",
    slug: "sandlogic",
    industry: "Artificial intelligence",
    services: ["ai-brand-services"],
    summary: "Brand work for SandLogic, an enterprise and edge AI company.",
    liveUrl: "https://www.sandlogic.com/",
  },
  {
    name: "AppDev Health",
    slug: "appdev-health",
    industry: "Healthcare software",
    services: ["ai-websites", "digital-marketing", "ai-print-collateral"],
    summary: "Website, digital marketing and print for AppDev Health, a custom healthcare software company.",
    liveUrl: "https://appdev.health/",
  },
  {
    name: "Engel & Völkers",
    slug: "engel-volkers",
    industry: "Real estate",
    services: ["ai-websites"],
    summary: "Website design and build for Engel & Völkers in real estate.",
  },
  {
    name: "Amphenol",
    slug: "amphenol",
    industry: "Connectors and interconnects",
    services: ["ai-social-media-marketing", "digital-marketing"],
    summary: "Social media and digital marketing for Amphenol’s connector and interconnect businesses.",
    liveUrl: "https://www.amphenol-cs.com/",
  },
  {
    name: "Sifio Health",
    slug: "sifio-health",
    industry: "Healthcare software",
    services: ["ai-websites"],
    summary: "The website for Sifio Health, which builds AI software for surgical centres.",
    liveUrl: "https://sifiohealth.com/",
  },
  {
    name: "Norsecom",
    slug: "norsecom",
    services: ["ai-brand-services"],
    summary: "Brand work for Norsecom.",
    liveUrl: "https://www.norse-com.com/",
  },
  {
    name: "Rxlive",
    slug: "rxlive",
    services: ["ai-product-design"],
    summary: "Product design for Rxlive, from user flows to final screens.",
  },
  {
    name: "Afthab Tours",
    slug: "afthab-tours",
    industry: "Travel",
    services: ["ai-social-media-marketing"],
    summary: "Social media content for Afthab Tours, a travel company.",
    liveUrl: "https://www.afthabtours.com/",
  },
  {
    name: "Cabot Solutions",
    slug: "cabot-solutions",
    industry: "Healthcare technology",
    services: ["ai-websites"],
    summary: "The website for Cabot Solutions, a healthcare digital transformation company.",
    liveUrl: "https://www.cabotsolutions.com/",
  },
  {
    name: "Meetingful",
    slug: "meetingful",
    services: ["ai-product-design"],
    summary: "Product design for Meetingful, from user flows to developer-ready screens.",
  },
  {
    name: "Elcoteq",
    slug: "elcoteq",
    industry: "Electronics manufacturing",
    services: ["ai-websites"],
    summary: "The website for Elcoteq, an electronics manufacturing services company.",
    liveUrl: "https://elcoteqems.com/",
  },
  {
    name: "Oh My Glam",
    slug: "oh-my-glam",
    services: ["ai-product-design"],
    summary: "Product design for the Oh My Glam app, from user flows to final screens.",
  },
  {
    name: "Carlton Noble",
    slug: "carlton-noble",
    services: ["ai-websites"],
    summary: "Website design and build for Carlton Noble.",
  },
  {
    name: "Ciber Digita",
    slug: "ciber-digita",
    industry: "Cybersecurity",
    services: ["ai-websites"],
    summary: "The website for Ciber Digita, which provides cybersecurity for critical infrastructure.",
  },
];

export const PROJECTS: Project[] = CASE_STUDIES.map((p, i) => makeProject(i + 1, p));

/** Slug of the project featured on Home (set in Site settings). */
export const FEATURED_PROJECT_SLUG = "surgo-health";

/** Project ids from the first starter content, removed when the seed overwrites. */
export const RETIRED_PROJECT_IDS = [
  "project-website-revamp",
  "project-product-redesign",
  "project-booking-portal",
  "project-lead-automation",
  "project-social-campaign",
  "project-product-catalogue",
];

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
        text: "Selected work across products, websites, marketing, brand and print.",
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
      {
        _type: "process",
        _key: "process",
        label: "How we work",
        heading: "Four steps.",
        steps: [
          { _key: "s1", title: "Brief", text: "Tell us what you need. We ask the right questions and agree the goal." },
          {
            _key: "s2",
            title: "Plan",
            text: "We come back with a fixed price or the right monthly plan, and a clear timeline.",
          },
          {
            _key: "s3",
            title: "Build",
            text: "We design and build with AI at every stage, and share progress as we go.",
          },
          {
            _key: "s4",
            title: "Launch & support",
            text: "We launch, hand over everything you own and stay on to support and improve it.",
          },
        ],
      },
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
