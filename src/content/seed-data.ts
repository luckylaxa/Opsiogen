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
  // Placeholders until the real profiles are added in Studio → Site settings → Social links.
  socialLinks: [
    { _key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
    { _key: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
    { _key: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
    { _key: "x", label: "X", href: "https://x.com/" },
    { _key: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
  ],
  menu: [
    { _key: "work", label: "Work", href: "/work" },
    { _key: "services", label: "Services", href: "/services" },
    { _key: "about", label: "About", href: "/about" },
    { _key: "contact", label: "Contact", href: "/contact" },
  ],
  // Each call to action has its own label: Start a project (header),
  // Let’s talk (floating bar), See our work (Home hero), Get in touch (closing band).
  headerButton: { label: "Start a project", href: "/contact" },
  dockButton: { label: "Let’s talk", href: "/contact" },
  cta: {
    heading: "One partner. Every digital need. One monthly plan.",
    button: { label: "Get in touch", href: "/contact" },
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
const img = (url: string, width: number, height: number, alt: string) => ({ url, width, height, alt });
const WEB = "/services/ai-websites";
const benefits = (items: Pair[]) => items.map(([title, text], i) => ({ _key: `b${i + 1}`, title, text }));
const faqs = (items: Pair[]) => items.map(([question, answer], i) => ({ _key: `q${i + 1}`, question, answer }));
/** What we do cards, each with its image from public/services/<slug>. */
const cards = (slug: string, items: [title: string, text: string, file: string, alt: string][]) =>
  items.map(([title, text, file, alt], i) => ({
    _key: `o${i + 1}`,
    title,
    text,
    image: img(`/services/${slug}/${file}`, 1600, 1200, alt),
  }));
const heroImage = (slug: string, alt: string) => ({ image: img(`/services/${slug}/hero.png`, 1600, 1120, alt) });
const statItems = (items: Pair[]) => ({
  label: "In numbers",
  items: items.map(([value, label], i) => ({ _key: `s${i + 1}`, value, label })),
});
const stepItems = (items: Pair[]) => items.map(([title, text], i) => ({ _key: `p${i + 1}`, title, text }));

const OWNERSHIP: Pair = ["Who owns the work?", "You do. You own everything we build."];
const PRICING: Pair = [
  "How is the work priced?",
  "With a fixed price agreed before we start, or a monthly plan. Start on a monthly plan or bring us a project.",
];

/** Colourful thumbnails for the service cards (public/services/<slug>/card.jpg). */
const CARD_ALT: Record<string, string> = {
  "ai-websites": "A coffee exporter's website on a laptop, on a green armchair",
  "ai-product-design": "A hand holding an iPhone with a savings app, in front of green plants",
  "ai-mvps-business-apps": "A woman pinning notes to a wall of app sketches",
  "ai-automation": "Three steps of an automated workflow: new enquiry, quote sent, call booked",
  "ai-social-media-marketing": "A hand holding an iPhone showing a bakery's social post",
  "digital-marketing": "Three ads for an e-bike brand on a blue background",
  "ai-creative-subscription": "A hand holding an iPhone with a yoga studio's ad: Slow down. Breathe out.",
  "ai-print-collateral": "An open hotel brochure with a houseboat photo, on dark green fabric",
  "ai-brand-services": "A bicycle brand's billboard on a grey stone wall",
  "ai-video-production": "A laptop on a wooden desk showing a video edit: a prompt, the preview and a timeline with captions",
};

export const SERVICES: Service[] = [
  {
    _id: "service-ai-websites",
    name: "AI Websites & Revamps",
    slug: "ai-websites",
    card: img(`/services/ai-websites/card.jpg`, 1600, 1200, CARD_ALT["ai-websites"]),
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
    statement:
      "Your website is often the first conversation a customer has with you. We make it fast, clear and built to turn visits into enquiries.",
    benefits: benefits([
      ["Live in days", "Basic websites launch in 7 days. Bigger builds follow a timeline we agree up front."],
      ["Built to convert", "Clear messages and calls to action, with every page designed around enquiries."],
      ["Easy to update", "An easy-to-use CMS, so your content never waits on developers."],
      ["Yours to keep", "You own the design, the code and the content."],
    ]),
    offerings: [
      {
        _key: "o1",
        title: "New websites",
        text: "Designed around your offer and built to turn visits into enquiries.",
        image: img(`${WEB}/tile-new.jpg`, 1600, 1200, "Laptop showing the Opsiogen home page"),
      },
      {
        _key: "o2",
        title: "Website revamps",
        text: "Outdated sites rebuilt to look current, load fast and work on every screen.",
        image: img(`${WEB}/tile-revamp.jpg`, 1600, 1200, "An outdated web page behind its modern redesign"),
      },
      {
        _key: "o3",
        title: "Landing pages",
        text: "Focused pages for campaigns, launches and lead generation.",
        image: img(`${WEB}/tile-landing.jpg`, 1600, 1200, "Two phones showing a landing page and an enquiry form"),
      },
      {
        _key: "o4",
        title: "SaaS and product sites",
        text: "Sites that explain your product clearly and lead to sign-ups and demos.",
        image: img(`${WEB}/tile-saas.jpg`, 1600, 1200, "Laptop and phone showing a case study page"),
      },
      {
        _key: "o5",
        title: "Corporate and portfolio sites",
        text: "A clear, credible home for your business and your work.",
        image: img(`${WEB}/tile-corporate.jpg`, 1600, 1200, "A stack of company website pages"),
      },
      {
        _key: "o6",
        title: "Easy-to-use CMS",
        text: "Change text, pages and images yourself, without waiting on developers.",
        image: img(`${WEB}/tile-cms.jpg`, 1600, 1200, "A web page beside a simple content editor"),
      },
    ],
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
      ["Will my site work on phones?", "Yes. Every site is designed and tested for phones, tablets and desktops."],
      ["Can you write the copy?", "Yes. We write clear, conversion-focused copy, or polish the copy you have."],
      [
        "What do you need from us to start?",
        "Your goals, any content you already have and access to your domain. We guide you through the rest.",
      ],
    ]),
    hero: { image: img(`${WEB}/hero.png`, 1600, 1120, "Laptop and phone showing Opsiogen web pages") },
    clientsLabel: "Websites we’ve built for",
    why: {
      label: "Why it matters",
      heading: "Your website isn’t a brochure. It’s your best salesperson.",
      accent: "salesperson",
    },
    stats: {
      label: "In numbers",
      items: [
        { _key: "s1", value: "7 days", label: "to launch a basic website" },
        { _key: "s2", value: "100%", label: "yours to keep" },
        { _key: "s3", value: "1", label: "partner for design, build and support" },
      ],
    },
    offer: { label: "What we do", heading: "Websites, ready to convert.", accent: "convert" },
    steps: {
      label: "How we work",
      heading: "From brief to live.",
      accent: "live",
      items: [
        { _key: "p1", title: "Brief and discovery", text: "We learn your business, audience and goals, and agree the scope." },
        { _key: "p2", title: "Plan and structure", text: "A sitemap, page structure and a fixed price or monthly plan." },
        { _key: "p3", title: "Design", text: "AI-assisted layouts, finished by our designers and reviewed with you." },
        { _key: "p4", title: "Build and CMS", text: "A fast, responsive build on an easy-to-use CMS." },
        { _key: "p5", title: "Test and launch", text: "Checked on every screen, then live. Basic websites launch in 7 days." },
        { _key: "p6", title: "Support and improve", text: "Updates, fixes and improvements after launch." },
      ],
    },
    related: { label: "Selected work", heading: "Websites we’ve launched.", accent: "launched" },
  },
  {
    _id: "service-ai-product-design",
    name: "AI Product Design & Design Systems",
    slug: "ai-product-design",
    card: img(`/services/ai-product-design/card.jpg`, 1600, 1200, CARD_ALT["ai-product-design"]),
    shortName: "Product Design",
    group: "build",
    order: 2,
    tagline: "Products people adopt. Systems that scale.",
    description:
      "We design SaaS, enterprise and mobile products that are simple to use and quick to adopt. AI speeds up research, flows and screens, and our designers make every decision count. Design systems keep your product consistent as it grows from MVP to enterprise.",
    included: [
      "Product design",
      "UX audits",
      "Redesign and iteration",
      "Prototypes and validation",
      "Design systems",
      "Developer-ready handoff",
    ],
    statement:
      "Good products feel simple. We design SaaS, enterprise and mobile products that people understand quickly and keep using.",
    benefits: benefits([
      ["Faster adoption", "Clear flows and familiar patterns help people get value sooner."],
      ["Scales with you", "A design system keeps every new screen consistent, from MVP to enterprise."],
      ["Ready to build", "Annotated screens, specs and components your developers can use straight away."],
      ["Designer-led AI", "AI speeds up research, flows and screens. Our designers make every decision count."],
    ]),
    offerings: cards("ai-product-design", [
      ["Product design", "New SaaS, web and mobile products, from flows to polished screens.", "tile-product.jpg", "A product dashboard on a laptop and an app on a phone"],
      ["UX audits", "We find where people get stuck and rank the fixes.", "tile-audit.jpg", "A product screen marked with numbered issues and a list of fixes"],
      ["Redesign and iteration", "Live products made simpler, one release at a time.", "tile-redesign.jpg", "A cluttered old screen beside its clean redesign"],
      ["Prototypes and validation", "Clickable prototypes to test ideas before you build.", "tile-prototype.jpg", "Three app screens linked as a clickable prototype"],
      ["Design systems", "Components, colours and rules that keep every screen consistent.", "tile-system.jpg", "A design system sheet with colours, type, buttons and inputs"],
      ["Developer-ready handoff", "Specs, assets and annotated screens your developers can build from.", "tile-handoff.jpg", "An app screen with measurements beside its specs"],
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
      ["Do you design mobile apps?", "Yes. We design apps for phones and tablets, as well as web products."],
      [
        "Can you work with our developers?",
        "Yes. We hand over specs, assets and annotated screens, and stay on hand while they build.",
      ],
      [
        "We already have a design system. Can you improve it?",
        "Yes. We audit what you have, fill the gaps and document it so your team can keep it up to date.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-product-design", "A product dashboard, an app and a design system sheet"),
    clientsLabel: "Products we’ve designed for",
    why: { label: "Why it matters", heading: "People don’t read manuals. Your product has to make sense.", accent: "sense" },
    stats: statItems([
      ["1", "design system, from MVP to enterprise"],
      ["3", "screen sizes in every design: phone, tablet and desktop"],
      ["100%", "yours to keep"],
    ]),
    offer: { label: "What we do", heading: "Products that feel simple.", accent: "simple" },
    steps: {
      label: "How we work",
      heading: "From discovery to handoff.",
      accent: "handoff",
      items: stepItems([
        ["Discovery", "We learn your product, your users and your goals."],
        ["Audit and ideas", "We map the journey, find the gaps and explore options."],
        ["Design", "Flows and screens, sped up with AI and finished by our designers."],
        ["Test", "Prototypes in front of real users before anything is built."],
        ["System and handoff", "Components, specs and documentation for your developers."],
        ["Improve", "We keep refining as your product grows."],
      ]),
    },
    related: { label: "Selected work", heading: "Products we’ve designed.", accent: "designed" },
  },
  {
    _id: "service-ai-mvps-business-apps",
    name: "AI MVPs & Business Apps",
    slug: "ai-mvps-business-apps",
    card: img(`/services/ai-mvps-business-apps/card.jpg`, 1600, 1200, CARD_ALT["ai-mvps-business-apps"]),
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
    statement:
      "The fastest way to test an idea is a working product in front of real users. We build it with AI in weeks, not months.",
    benefits: benefits([
      ["Weeks, not months", "A focused first version, scoped to what you need to learn."],
      ["AI built in", "Smart search, chat and summaries that make the product useful from launch."],
      ["Built to grow", "A first version that can grow into a full product."],
      ["Yours to keep", "You own everything we build."],
    ]),
    offerings: cards("ai-mvps-business-apps", [
      ["MVPs and prototypes", "A working first version to test with users and investors.", "tile-mvp.jpg", "A first app version on a phone beside a launch checklist"],
      ["AI-powered features", "Smart search, chat, summaries and forms built into your product.", "tile-ai.jpg", "A search screen with an answer written by AI"],
      ["Customer and partner portals", "One place for customers and partners to log in, track and get things done.", "tile-portal.jpg", "A customer portal listing orders on a laptop"],
      ["Dashboards", "Live views of the numbers that matter, in one place.", "tile-dashboard.jpg", "A live dashboard with charts and team status"],
      ["Booking and intake systems", "Online booking and intake that feed straight into your workflow.", "tile-booking.jpg", "A booking calendar and a phone showing time slots"],
      ["Internal tools and trackers", "Simple tools that replace spreadsheets and manual work.", "tile-internal.jpg", "A request board with cards in columns"],
    ]),
    faqs: faqs([
      [
        "How fast can you build an MVP?",
        "We take you from idea to working product in weeks, and agree the scope and timeline before we start.",
      ],
      ["Can the MVP grow into a full product?", "Yes. We build the first version so it can grow with your users and your business."],
      ["Do we need our own developers?", "No. We design, build and launch, then support the product after launch."],
      OWNERSHIP,
      [
        "What can you build?",
        "MVPs, customer portals, dashboards, booking systems, internal tools, and AI features inside your product.",
      ],
      [
        "Can you add AI to software we already have?",
        "Yes. We add features such as smart search, chat and summaries to products you already use.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-mvps-business-apps", "A customer portal on a laptop and a booking app on a phone"),
    clientsLabel: "Built for",
    why: { label: "Why it matters", heading: "The fastest way to test an idea is to put it in people’s hands.", accent: "hands" },
    stats: statItems([
      ["Weeks", "from idea to working product"],
      ["0", "developers needed on your side"],
      ["100%", "yours to keep"],
    ]),
    offer: { label: "What we build", heading: "Working software, in weeks.", accent: "weeks" },
    steps: {
      label: "How we work",
      heading: "From idea to launch.",
      accent: "launch",
      items: stepItems([
        ["Idea and scope", "We agree what the first version must prove, and what can wait."],
        ["Design", "Flows and screens you can click through before we build."],
        ["Build with AI", "AI speeds up the build. Our team reviews and tests every release."],
        ["Test with users", "Real feedback early, while changes are quick to make."],
        ["Launch", "Live and ready for your first users."],
        ["Grow", "We add features as your users and your business grow."],
      ]),
    },
    related: { label: "Selected work", heading: "Products we’ve built.", accent: "built" },
  },
  {
    _id: "service-ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    card: img(`/services/ai-automation/card.jpg`, 1600, 1200, CARD_ALT["ai-automation"]),
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
      "Reports, proposals and approvals",
      "Monthly care plan",
    ],
    statement:
      "Every hour spent copying data, chasing approvals or building reports is an hour not spent on customers. We hand that work to AI.",
    benefits: benefits([
      ["Hours back", "Repetitive tasks run on their own, so your people focus on the work that matters."],
      ["Connected tools", "The tools you already use, connected so data moves without copy and paste."],
      ["Fewer mistakes", "Automated steps follow the same rules every time."],
      ["Looked after", "A monthly care plan keeps every automation running and improving."],
    ]),
    offerings: cards("ai-automation", [
      ["Process audit", "We map how work gets done and find the tasks worth automating first.", "tile-audit.jpg", "A process map with steps marked to automate"],
      ["Lead and enquiry automation", "Every enquiry captured, sorted and followed up without manual work.", "tile-leads.jpg", "A website enquiry sorted by AI and answered with call times"],
      ["Internal dashboards", "Dashboards and reports that update themselves from the tools you use.", "tile-dashboards.jpg", "A weekly report dashboard that updates itself"],
      ["Document and data extraction", "Data pulled from forms, invoices and PDFs into your systems.", "tile-documents.jpg", "An invoice beside the details pulled from it"],
      ["AI chatbots and voice assistants", "Assistants that answer questions and handle routine requests by chat or voice.", "tile-assistants.jpg", "A chat assistant on a phone and a voice assistant on a call"],
      ["Reports, proposals and approvals", "Documents drafted and approvals routed automatically.", "tile-approvals.jpg", "A proposal drafted by AI waiting for approval"],
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
      ["Do we need technical staff?", "No. We build, run and look after the automations. Your team just uses them."],
      [
        "Can you build an AI voice assistant?",
        "Yes. We build assistants that answer calls and questions, and hand over to your team when needed.",
      ],
      [
        "How do we know what to automate first?",
        "The process audit ranks tasks by time saved and effort, so you start where it pays back fastest.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-automation", "An automated enquiry flow on a laptop and an AI assistant on a phone"),
    clientsLabel: "Automations built for",
    why: { label: "Why it matters", heading: "Your team wasn’t hired to copy and paste.", accent: "copy and paste" },
    stats: statItems([
      ["24/7", "automations at work, day and night"],
      ["0", "copy and paste between your tools"],
      ["1", "monthly care plan that keeps it all running"],
    ]),
    offer: { label: "What we automate", heading: "Hand the busywork to AI.", accent: "AI" },
    steps: {
      label: "How we work",
      heading: "From audit to autopilot.",
      accent: "autopilot",
      items: stepItems([
        ["Process audit", "We map how work gets done and find what to automate first."],
        ["Plan", "A clear plan for each automation, agreed with you."],
        ["Build and connect", "Automations and AI assistants, connected to the tools you use."],
        ["Test", "We test with real data before anything goes live."],
        ["Launch", "Live, with a short handover for your team."],
        ["Care plan", "We monitor, fix and improve every month."],
      ]),
    },
    related: { label: "Selected work", heading: "Automations we’ve built.", accent: "built" },
  },
  {
    _id: "service-ai-social-media-marketing",
    name: "AI Social Media Marketing",
    slug: "ai-social-media-marketing",
    card: img(`/services/ai-social-media-marketing/card.jpg`, 1600, 1200, CARD_ALT["ai-social-media-marketing"]),
    shortName: "Social Media",
    group: "grow",
    order: 5,
    tagline: "Scroll-stopping content, made fast and on brand.",
    description:
      "We plan, create and publish your social content every month: posts, reels, AI video and captions in your brand voice. You get consistent output, faster turnaround and a clear monthly report.",
    included: [
      "Content calendar",
      "Posts and carousels",
      "Reels and short video",
      "Paid social creative",
      "Campaign concepts",
      "Publishing and reporting",
    ],
    statement:
      "Social works when you show up consistently. We keep your brand visible every week, without adding work to your day.",
    benefits: benefits([
      ["Always on", "A full monthly calendar, planned ahead and published for you."],
      ["On brand", "Every post follows your look and your voice."],
      ["Faster with AI", "AI speeds up ideas, visuals and video, so turnaround is quick."],
      ["Clear reporting", "A monthly report on what worked and what comes next."],
    ]),
    offerings: cards("ai-social-media-marketing", [
      ["Content calendar", "A monthly plan built around your goals, launches and events.", "tile-calendar.jpg", "A monthly content calendar with planned posts"],
      ["Posts and carousels", "On-brand designs and captions for every channel, made fast with AI.", "tile-posts.jpg", "Three social posts from one carousel"],
      ["Reels and short video", "Short, vertical video that keeps your brand in the feed.", "tile-reels.jpg", "Two phones playing short vertical videos"],
      ["Paid social creative", "Ad designs and variations, made to test and improve.", "tile-paid.jpg", "Four ad variations, one marked as the winner"],
      ["Campaign concepts", "One big idea for a launch or season, ready for every format.", "tile-campaign.jpg", "One campaign idea as a poster, a story and posts"],
      ["Publishing and reporting", "We publish to your calendar and report on what worked.", "tile-reporting.jpg", "A monthly social report with a chart and next steps"],
    ]),
    faqs: faqs([
      ["How much content do we get?", "It depends on your plan. We agree the monthly output with you before we start."],
      [
        "Will it sound like us?",
        "Yes. We work from your brand voice and guidelines, and you approve the calendar before anything goes live.",
      ],
      ["Do you publish for us?", "Yes. We schedule and publish your content, then report on performance every month."],
      [
        "Do you make paid social ads?",
        "Yes. We design ads and variations for testing. Our Digital Marketing service can run the campaigns too.",
      ],
      ["Which channels do you cover?", "All the main social channels. Every post is sized and written for the channel it runs on."],
      ["Can you make video without a shoot?", "Yes. Many reels are made with motion graphics and AI, with no filming needed."],
      PRICING,
      OWNERSHIP,
    ]),
    hero: heroImage("ai-social-media-marketing", "Three phones showing social posts and a short video"),
    clientsLabel: "Social content for",
    why: { label: "Why it matters", heading: "Social rewards the brands that show up.", accent: "show up" },
    stats: statItems([
      ["30", "days of content, planned ahead"],
      ["1", "clear report every month"],
      ["100%", "in your brand voice"],
    ]),
    offer: { label: "What we create", heading: "Content made for the feed.", accent: "feed" },
    steps: {
      label: "How we work",
      heading: "From plan to post.",
      accent: "post",
      items: stepItems([
        ["Brief", "Your goals, your audience and your brand voice."],
        ["Calendar", "A monthly plan you approve before anything is made."],
        ["Create", "Posts, carousels and video, sped up with AI and finished by our designers."],
        ["Review", "You approve everything before it goes live."],
        ["Publish", "Scheduled and published for you."],
        ["Report", "A clear monthly report and what comes next."],
      ]),
    },
    related: { label: "Selected work", heading: "Brands we keep visible.", accent: "visible" },
  },
  {
    _id: "service-digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    card: img(`/services/digital-marketing/card.jpg`, 1600, 1200, CARD_ALT["digital-marketing"]),
    shortName: "Digital Marketing",
    group: "grow",
    order: 6,
    tagline: "Campaigns built for leads and sales.",
    description:
      "We plan and run paid social, search ads, SEO and email aimed at what matters: enquiries, leads and return on ad spend. Every campaign is tracked from the first click to the enquiry.",
    // The brief lists ad platforms by name; the copy rules exclude platform names.
    included: [
      "Paid social ads",
      "Search ads",
      "SEO",
      "Lead generation campaigns",
      "Email and retargeting",
      "Analytics and reporting",
    ],
    statement:
      "Clicks and likes don’t pay the bills. We run campaigns aimed at what does: enquiries, leads and return on ad spend.",
    benefits: benefits([
      ["Built for leads", "Every campaign is planned around enquiries and sales."],
      ["Paid and organic", "Ads, search and SEO working together."],
      ["Measured properly", "Clear tracking from the first click to the enquiry."],
      ["Always improving", "We test, learn and move budget to what works."],
    ]),
    offerings: cards("digital-marketing", [
      ["Paid social ads", "Campaigns aimed at the people most likely to buy.", "tile-social.jpg", "A sponsored post on a phone beside its audience settings"],
      ["Search ads", "Be found at the moment customers search for what you offer.", "tile-search.jpg", "A search results page with a sponsored result on top"],
      ["SEO", "Better search visibility through content, structure and technical fixes.", "tile-seo.jpg", "Organic visits rising, a site health score and keyword positions"],
      ["Lead generation campaigns", "Campaigns and landing pages built to bring in enquiries.", "tile-leads.jpg", "A landing page with an enquiry form and new lead alerts"],
      ["Email and retargeting", "Follow-ups that bring people back when they’re ready to buy.", "tile-email.jpg", "A campaign email beside a retargeting ad"],
      ["Analytics and reporting", "Clear tracking of leads, sales and return on ad spend.", "tile-analytics.jpg", "A campaign dashboard from first click to enquiry"],
    ]),
    faqs: faqs([
      ["What do you measure?", "What matters to your business: enquiries, leads and return on ad spend."],
      ["Can you take over our current campaigns?", "Yes. We review what’s running, keep what works and fix what doesn’t."],
      PRICING,
      ["Do you run the campaigns for us?", "Yes. We plan, launch and manage your campaigns, and keep improving them."],
      [
        "How soon will we see results?",
        "Paid campaigns bring traffic as soon as they go live. SEO builds over months. We agree goals and reporting before we start.",
      ],
      [
        "Do you write the ads and build the landing pages?",
        "Yes. We write and design the ads, and build landing pages made to turn clicks into enquiries.",
      ],
      [
        "Which channels do you use?",
        "The search and social channels where your customers are, chosen with you for your goals and budget.",
      ],
      ["Who owns the ad accounts and data?", "You do. Your accounts, analytics and data stay yours."],
    ]),
    hero: heroImage("digital-marketing", "A campaign dashboard on a laptop, a sponsored post on a phone and new lead alerts"),
    clientsLabel: "Campaigns for",
    why: { label: "Why it matters", heading: "Clicks don’t pay the bills. Enquiries do.", accent: "Enquiries do" },
    stats: statItems([
      ["1", "dashboard, from first click to enquiry"],
      ["0", "vanity metrics. Just leads and sales"],
      ["100%", "your accounts and your data"],
    ]),
    offer: { label: "What we do", heading: "Campaigns that bring in leads.", accent: "leads" },
    steps: {
      label: "How we work",
      heading: "From audit to growth.",
      accent: "growth",
      items: stepItems([
        ["Audit", "We review your current ads, search visibility and tracking."],
        ["Plan", "Goals, audiences, channels and budget, agreed with you."],
        ["Create", "Ads, copy and landing pages, made fast with AI and finished by our team."],
        ["Launch", "Campaigns live, tracked from the first click to the enquiry."],
        ["Optimise", "We test, learn and move budget to what works."],
        ["Report", "A clear monthly report on leads, sales and return on ad spend."],
      ]),
    },
    related: { label: "Selected work", heading: "Campaigns we’ve run.", accent: "run" },
  },
  {
    _id: "service-ai-creative-subscription",
    name: "AI Creative Subscription",
    slug: "ai-creative-subscription",
    card: img(`/services/ai-creative-subscription/card.jpg`, 1600, 1200, CARD_ALT["ai-creative-subscription"]),
    shortName: "Creative",
    group: "create",
    order: 7,
    tagline: "On-demand creative, one monthly plan.",
    description:
      "Dedicated creative support on a flat monthly subscription. Send requests any time and we deliver on-brand work fast, without hiring in-house or briefing a new agency for every project.",
    included: [
      "Ad creatives",
      "Presentations and pitch decks",
      "Brand assets and templates",
      "Motion graphics",
      "AI imagery and video",
      "Email and landing pages",
    ],
    statement:
      "Creative needs don’t wait for a hiring plan. Send requests any time and get on-brand work back fast.",
    benefits: benefits([
      ["One monthly fee", "A predictable cost for all your creative requests."],
      ["Ask any time", "One place to send briefs, whenever you need them."],
      ["Fast turnaround", "AI speeds up production. Designers keep the quality high."],
      ["No hiring", "Dedicated creative support without adding headcount."],
    ]),
    offerings: cards("ai-creative-subscription", [
      ["Ad creatives", "Static and animated ads sized for every channel.", "tile-ads.jpg", "One ad in six sizes"],
      ["Presentations and pitch decks", "Decks that make your story clear and convincing.", "tile-decks.jpg", "Three presentation slides"],
      ["Brand assets and templates", "Templates, icons, illustrations and everyday brand materials.", "tile-assets.jpg", "An icon set, a report template and a social template"],
      ["Motion graphics", "Animated graphics for social, ads and product stories.", "tile-motion.jpg", "Animation frames, an easing curve and a timeline"],
      ["AI imagery and video", "Original visuals made with AI and finished by designers.", "tile-ai.jpg", "A grid of AI-made visuals with one chosen as final"],
      ["Email and landing pages", "Designs for campaigns, newsletters, launches and reports.", "tile-email.jpg", "An email design beside a landing page"],
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
      [
        "What can we ask for?",
        "Ads, decks, brand assets, motion, AI visuals, email and landing pages. If it’s creative, ask.",
      ],
      [
        "How fast is turnaround?",
        "Fast. Smaller requests come back quickest, and bigger projects get a clear timeline before we start.",
      ],
      ["Will the work match our brand?", "Yes. We work from your guidelines and templates, so everything looks like you."],
      PRICING,
    ]),
    hero: heroImage("ai-creative-subscription", "A presentation slide, a poster, ads, a social post and a story"),
    clientsLabel: "Creative for",
    why: { label: "Why it matters", heading: "Say yes to every project, without adding headcount.", accent: "headcount" },
    stats: statItems([
      ["1", "flat monthly fee"],
      ["24/7", "to send requests"],
      ["0", "hires needed"],
    ]),
    offer: { label: "What you get", heading: "Every kind of creative, one plan.", accent: "one plan" },
    steps: {
      label: "How we work",
      heading: "Request, review, done.",
      accent: "done",
      items: stepItems([
        ["Onboard", "We learn your brand, your goals and how you work."],
        ["Request", "Send briefs any time, in one place."],
        ["Create", "AI speeds up production. Designers keep the quality high."],
        ["Review", "Share feedback and we refine until it’s right."],
        ["Deliver", "Final files, in every size you need."],
      ]),
    },
    related: { label: "Selected work", heading: "Creative we’ve delivered.", accent: "delivered" },
  },
  {
    _id: "service-ai-print-collateral",
    name: "AI Print & Collateral Design",
    slug: "ai-print-collateral",
    card: img(`/services/ai-print-collateral/card.jpg`, 1600, 1200, CARD_ALT["ai-print-collateral"]),
    shortName: "Print",
    group: "create",
    order: 8,
    tagline: "Print, packaging and merch, ready for production.",
    description:
      "We design brochures, posters, stationery, packaging, merchandise and event collateral with AI speed and designer precision. Every file is checked and delivered ready for print.",
    included: [
      "Brochures and catalogues",
      "Posters, flyers and print ads",
      "Stationery",
      "Packaging and labels",
      "Merchandise and apparel",
      "Event collateral and booths",
    ],
    statement:
      "Print still makes the first impression at events, on shelves and in people’s hands. We design it fast and get every file print-ready.",
    benefits: benefits([
      ["Print-ready", "Every file is checked and delivered ready for print."],
      ["Faster with AI", "AI speeds up layouts and variations. Designers finish every detail."],
      ["One brand everywhere", "Brochures, packaging and booths that look like they belong together."],
      ["Yours to keep", "You own every design and source file."],
    ]),
    offerings: cards("ai-print-collateral", [
      ["Brochures and catalogues", "Clear layouts that present your products and services well.", "tile-brochures.jpg", "A company brochure, open and closed"],
      ["Posters, flyers and print ads", "Bold print for launches, promotions and outdoor.", "tile-posters.jpg", "Three framed posters on a wall"],
      ["Stationery", "Business cards, letterheads and everyday brand print.", "tile-stationery.jpg", "A letterhead, an envelope and business cards"],
      ["Packaging and labels", "Packaging that stands out on the shelf and meets print specs.", "tile-packaging.jpg", "Three branded boxes in different sizes"],
      ["Merchandise and apparel", "Branded merch, uniforms, gifts and kits people keep.", "tile-merch.jpg", "A branded tote bag, T-shirt and mug"],
      ["Event collateral and booths", "Booths, banners and handouts for exhibitions and events.", "tile-events.jpg", "An exhibition booth with a back wall, counter and banners"],
    ]),
    faqs: faqs([
      ["Are the files ready for print?", "Yes. Every file is checked and delivered ready for print."],
      ["Do you design for exhibitions?", "Yes. We design expo booths, banners and event collateral."],
      OWNERSHIP,
      ["Do you design packaging?", "Yes. Boxes, bags, labels and inserts, designed to your printer’s specs."],
      [
        "Can you design merchandise and apparel?",
        "Yes. T-shirts, caps, mugs, notebooks, gift kits and more, all on brand.",
      ],
      [
        "Can you adapt one design to many sizes?",
        "Yes. AI speeds up resizing and variations, and our designers check every version.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-print-collateral", "A brochure, business cards, a box and a mug"),
    clientsLabel: "Print and collateral for",
    why: { label: "Why it matters", heading: "Every brochure, box and giveaway is a chance to be remembered.", accent: "remembered" },
    stats: statItems([
      ["100%", "print-ready files, checked before delivery"],
      ["1", "look across print, packaging and merch"],
      ["5", "steps from brief to final files"],
    ]),
    offer: { label: "What we do", heading: "Design you can hold.", accent: "hold" },
    steps: {
      label: "How we work",
      heading: "From brief to print-ready.",
      accent: "print-ready",
      items: stepItems([
        ["Brief", "Your goal, formats, sizes and deadlines."],
        ["Plan", "Timeline and print specs agreed up front."],
        ["First draft", "Concepts sped up with AI and finished by our designers."],
        ["Revisions", "You review and we refine until it’s right."],
        ["Print-ready files", "Checked and delivered ready for your printer."],
      ]),
    },
    related: { label: "Selected work", heading: "Print we’ve designed.", accent: "designed" },
  },
  {
    _id: "service-ai-brand",
    name: "AI Brand Services",
    slug: "ai-brand-services",
    card: img(`/services/ai-brand-services/card.jpg`, 1600, 1200, CARD_ALT["ai-brand-services"]),
    shortName: "Brand",
    group: "create",
    order: 9,
    tagline: "A clear, consistent brand, built faster.",
    description:
      "We create and refresh brands: strategy, logo, colours, type and guidelines, plus the templates your business uses every day. AI speeds up exploration, and our designers make sure every choice fits.",
    included: [
      "Brand strategy and messaging",
      "Logo and visual identity",
      "Brand guidelines",
      "Brand refresh",
      "Brand assets and templates",
      "Brand rollout",
    ],
    statement:
      "A brand is more than a logo. It is how people recognise you everywhere. We build brands that stay consistent as you grow.",
    benefits: benefits([
      ["Distinctive", "A look that sets you apart in your market."],
      ["Consistent", "Clear guidelines, so every touchpoint looks like you."],
      ["Ready to use", "Templates and assets your business can use straight away."],
      ["Faster with AI", "AI speeds up exploration, so you see more options sooner."],
    ]),
    offerings: cards("ai-brand-services", [
      ["Brand strategy and messaging", "Who you are, who you serve and how you sound.", "tile-strategy.jpg", "Three cards: who we are, who we serve and how we sound"],
      ["Logo and visual identity", "A distinctive logo, colours and type that fit your business.", "tile-identity.jpg", "The logo and symbol on dark, light and gradient tiles"],
      ["Brand guidelines", "Clear rules, so everyone uses your brand the same way.", "tile-guidelines.jpg", "Brand guidelines open at the logo and colour pages"],
      ["Brand refresh", "A modern update that keeps what people already recognise.", "tile-refresh.jpg", "An old logo beside its modern refresh"],
      ["Brand assets and templates", "Ready-to-use templates for decks, social posts and documents.", "tile-assets.jpg", "Slide, report and social post templates"],
      ["Brand rollout", "Your new brand applied across website, social and print.", "tile-rollout.jpg", "The brand on a poster, a phone, a tote bag and a business card"],
    ]),
    faqs: faqs([
      ["Can you refresh our existing brand?", "Yes. We modernise what you have and keep the parts people recognise."],
      [
        "What do we receive?",
        "Logo files, colours, type, brand guidelines and the templates you need, ready to use.",
      ],
      OWNERSHIP,
      [
        "How do you use AI in branding?",
        "AI speeds up exploration, so you see more directions sooner. Our designers make every final choice.",
      ],
      ["Can you help with messaging?", "Yes. We define how you describe what you do, and the voice that goes with it."],
      [
        "Will the brand work on our website and social?",
        "Yes. We roll it out across website, social, print and templates, so it looks the same everywhere.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-brand-services", "Brand guidelines, a type page, an app icon and a business card"),
    clientsLabel: "Brands we’ve worked on",
    why: { label: "Why it matters", heading: "Consistent brands are easier to trust.", accent: "trust" },
    stats: statItems([
      ["1", "brand system for every touchpoint"],
      ["100%", "yours, with every source file"],
      ["5", "steps from kickoff to rollout"],
    ]),
    offer: { label: "What we do", heading: "From strategy to systems.", accent: "systems" },
    steps: {
      label: "How we work",
      heading: "From kickoff to rollout.",
      accent: "rollout",
      items: stepItems([
        ["Kickoff", "Your story, your market, your audience and your goals."],
        ["Strategy", "Positioning and messaging that set you apart."],
        ["Exploration", "AI speeds up exploration, so you see more directions sooner."],
        ["Identity and guidelines", "Logo, colours, type and rules, refined with you."],
        ["Rollout", "Templates and assets applied across every touchpoint."],
      ]),
    },
    related: { label: "Selected work", heading: "Brands we’ve built.", accent: "built" },
  },
  {
    _id: "service-ai-video",
    name: "AI Video Production",
    slug: "ai-video-production",
    card: img(`/services/ai-video-production/card.jpg`, 1600, 1200, CARD_ALT["ai-video-production"]),
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
      "Concepts and scripts",
    ],
    statement:
      "Video explains in seconds what pages of text can’t. We produce it fast, on brand and ready for every channel.",
    benefits: benefits([
      ["Every format", "Wide, square and vertical versions from one project."],
      ["Often no shoot", "Motion graphics and AI mean many videos need no filming."],
      ["Fast turnaround", "AI speeds up scripts, visuals and edits."],
      ["On brand", "Designers check every frame against your brand."],
    ]),
    offerings: cards("ai-video-production", [
      ["Explainer and product videos", "Short videos that show what you do and why it matters.", "tile-explainer.jpg", "A video player paused on a title card"],
      ["Social video and reels", "Vertical, fast-paced video made for social channels.", "tile-social.jpg", "Three phones playing vertical videos"],
      ["Video ads", "Ads cut to the length and format of every placement.", "tile-ads.jpg", "One ad cut in wide, square and vertical formats"],
      ["Motion graphics and animation", "Animated stories, titles and data that make ideas easy to follow.", "tile-motion.jpg", "Frames of an animated chart with its easing curve"],
      ["AI video", "Visuals, voiceovers and scenes made with AI and finished by designers.", "tile-ai.jpg", "Four AI-made takes from one prompt, one selected"],
      ["Concepts and scripts", "Ideas, scripts and storyboards, before a single frame is made.", "tile-concepts.jpg", "A storyboard beside a script"],
    ]),
    faqs: faqs([
      ["Do we need to film anything?", "Not always. Many videos are made with motion graphics and AI, with no shoot needed."],
      ["Which formats do you deliver?", "Every size you need, wide, square and vertical, ready to publish."],
      OWNERSHIP,
      ["Can you write the script?", "Yes. We write scripts and storyboards, or polish the ones you have."],
      ["Do you add voiceovers and music?", "Yes. Voiceovers, music and subtitles are part of the edit."],
      [
        "How do you use AI in video?",
        "AI speeds up scripts, visuals and edits. Our designers check every frame against your brand.",
      ],
      PRICING,
    ]),
    hero: heroImage("ai-video-production", "A video editor on a laptop and a vertical video on a phone"),
    clientsLabel: "Video for",
    why: { label: "Why it matters", heading: "Video says in seconds what a page of text can’t.", accent: "seconds" },
    stats: statItems([
      ["3", "formats from every project: wide, square and vertical"],
      ["1", "team from script to final cut"],
      ["100%", "yours to keep"],
    ]),
    offer: { label: "What we make", heading: "Video for every screen.", accent: "every screen" },
    steps: {
      label: "How we work",
      heading: "From script to final cut.",
      accent: "final cut",
      items: stepItems([
        ["Brief", "Your message, your audience and where the video will run."],
        ["Concept and script", "Ideas, scripts and storyboards for you to approve."],
        ["Production", "Motion, AI and footage, made to the storyboard."],
        ["Edit and review", "You review the cut and we refine until it’s right."],
        ["Every format", "Wide, square and vertical versions, ready to publish."],
      ]),
    },
    related: { label: "Selected work", heading: "Videos we’ve made.", accent: "made" },
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

/** The case-study details: a line, where and when, and real results. */
type CaseDetails = {
  tagline: string;
  location: string;
  year: string;
  stats: Pair[];
};

/** A case study with its generated title-card cover (public/covers) and card mockup (public/cards). */
/**
 * Colourful card thumbnails (public/cards/<slug>.jpg, 1512 × 1200, the card's
 * own 1.26:1 shape): the real screens or mockups on a bold gradient.
 */
const DESIGNED_CARDS: Record<string, string> = {
  "surgo-health": "Hands holding the Surgo Health index on a tablet, on a tomato red backdrop",
  "care-connect": "Hands holding the Care Connect intake board on a tablet, on a sky blue backdrop",
  "rxlive": "A hand holding the RxLive worklist on a phone, on a sage backdrop",
  "sifio-health": "The Sifio Health app on a phone standing on a stone block, on a sage backdrop",
  "meetingful": "The Meetingful dashboard on a laptop, on a butter yellow backdrop",
  "oh-my-glam": "A hand holding the Oh My Glam lipstick page on a phone, on a blush pink backdrop",
  "bigtapp": "The BigTapp homepage on a laptop, on a cobalt blue backdrop",
  "cabot-solutions": "The Cabot website homepage on a laptop, on a sky blue backdrop",
  "carlton-noble": "Hands holding the Carlton Noble website on a tablet, on a terracotta backdrop",
  "engel-volkers": "The Engel & Völkers homepage on a tablet resting on travertine, on a sand backdrop",
  "norsecom": "A hand holding Norsecom business cards, on a butter yellow backdrop",
  "sandlogic": "A SandLogic water bottle and mug, on a lilac backdrop",
  "rohde-schwarz": "Hands holding a Rohde & Schwarz brochure, on a cobalt blue backdrop",
};

/**
 * A few lines of story, shown between a case study's wide mockups from tablets
 * up, one block after every four.
 */
const STORIES: Record<string, Pair[]> = {
  "surgo-health": [
    [
      "One index, every county",
      "Care teams, payers and public agencies explore 42 social drivers of health on one map, then open any county to see its score and what drives it.",
    ],
    [
      "From insight to action",
      "Trends, an index assistant and regional briefs explain where risk is building. Saved cohorts and the impact simulator help plan programs that reach people first.",
    ],
  ],
  "care-connect": [
    [
      "Every intake in one place",
      "Partner hospitals send referrals to one shared board, where each patient is scored, summarised and moved from new to accepted.",
    ],
    [
      "Decisions with the full picture",
      "Readmission risk, team discussions and key fields from discharge papers sit beside each patient, and accepted patients are matched to open beds.",
    ],
  ],
  rxlive: [
    [
      "A day's work, sorted",
      "Pharmacists start from one worklist of reviews, adherence calls and care alerts, with each patient's conditions and medications a click away.",
    ],
    [
      "From review to outcome",
      "Reviews, messages with prescribers, video consults and outside records come together, and the outcomes view shows the value across payers.",
    ],
  ],
  meetingful: [
    [
      "Before and during the meeting",
      "Agendas, smart scheduling and live notes keep every meeting focused while it happens.",
    ],
    [
      "After the meeting",
      "Summaries, action items and answers across every meeting turn talk into work with an owner.",
    ],
  ],
  "oh-my-glam": [
    [
      "Try before you buy",
      "Shoppers see shades on their own face with live AR try-on, from a single lipstick to a full look.",
    ],
    [
      "From look to checkout",
      "Creator looks, AI shade matching and a simple bag and checkout make buying easy, and Glam AI can book a glam artist.",
    ],
  ],
  "rohde-schwarz": [
    [
      "Print and digital, one look",
      "Company and product brochures, social ads and newsletters share one clear look, from the brand story to each product range.",
    ],
    [
      "One brand at every event",
      "Sales decks, exhibition booths, roll-up banners and outdoor ads carry the same message across India.",
    ],
    [
      "Down to the details",
      "Business cards, letterheads, event badges and magazine ads keep the brand consistent in every hand.",
    ],
    [
      "Campaigns that connect",
      "Metro posters, keynote screens and digital brochures turn each launch into one story.",
    ],
  ],
  "sifio-health": [
    [
      "From lost time to a plan",
      "Lost time, acuity and urgency each trace back to a cause. The optimization plan turns them into ranked changes a chief can accept in one click.",
    ],
    [
      "The surgical day, live",
      "The OR day twin models every room as cases start and end, and the outcomes view tracks the program before and after go-live.",
    ],
    [
      "A website that explains it",
      "The website walks hospitals from the problem to SurgiTwin, with an efficiency calculator, a case study and clear next steps.",
    ],
  ],
  bigtapp: [
    [
      "From data to agents",
      "The site leads with what BigTapp does best: help enterprise AI act, on a governed data foundation, with the Beeonix AI platform at the centre.",
    ],
    [
      "Proof on every page",
      "Impact numbers, case studies and pages for banking, insurance and retail show the outcome of the work, with a clear way to get in touch.",
    ],
  ],
  "cabot-solutions": [
    [
      "Healthcare first",
      "The home page, services and solution areas speak to providers, payers and health technology companies, from EHR integration to voice AI agents.",
    ],
    [
      "From pilot to production",
      "AI development, product engineering and agent workflows each get a page, and a side-by-side table shows how a healthcare-native partner works.",
    ],
  ],
  "carlton-noble": [
    [
      "Three houses, one story",
      "Travel, events and access each open with a full-screen photograph, so the experiences speak for themselves.",
    ],
    [
      "Quiet, generous pages",
      "Black space, editorial type and photo collages keep the focus on the moments, with a gallery and journal to explore.",
    ],
  ],
  "engel-volkers": [
    [
      "One look, every country",
      "Every country page shares one layout: a full-width property film with search right above it.",
    ],
    [
      "Regions and listings",
      "Region cards, featured listings and the Private Office lead buyers from a country to the right home.",
    ],
  ],
  norsecom: [
    [
      "A mark with meaning",
      "The logo is built from a two-way arrow and a signal wave, and the N stands on its own as an icon.",
    ],
    [
      "Everywhere the team shows up",
      "Stationery, apparel, signage, an exhibition booth and packaging all carry the same azure and carbon look.",
    ],
  ],
  sandlogic: [
    [
      "Where silicon meets intelligence",
      "A new mark, typeface, colours and voice for a full-stack AI company, set out in one brand system.",
    ],
    [
      "The brand, in the world",
      "Events, print, apparel, merchandise and digital share one look, from the keynote stage to a water bottle.",
    ],
  ],
};

/** Generated 1600 × 1200 card images that show the real work, by what they show. */
const CARD_ALTS: Record<string, string> = {
  "sifio-health": "The Sifio Health web app's home screen",
};

function makeProject(order: number, p: ProjectInput): Project {
  const services = p.services.map(ref);
  const d = CASE_DETAILS[p.slug];
  return {
    _id: `project-${p.slug}`,
    name: p.name,
    slug: p.slug,
    client: p.name,
    industry: p.industry ?? null,
    year: d?.year ?? null,
    services,
    cover: {
      url: `/covers/${p.slug}.jpg`,
      width: 1600,
      height: 1200,
      alt: `${p.name}: ${services.map((s) => s.name).join(", ")}`,
    },
    cardImage: DESIGNED_CARDS[p.slug]
      ? img(`/cards/${p.slug}.jpg`, 1512, 1200, DESIGNED_CARDS[p.slug])
      : img(`/cards/${p.slug}.jpg`, 1600, 1200, CARD_ALTS[p.slug] ?? `The ${p.name} case study on a laptop and a phone`),
    coverVideo: null,
    order,
    summary: p.summary,
    tagline: d?.tagline ?? null,
    location: d?.location ?? null,
    stats: (d?.stats ?? []).map(([value, label], i) => ({ _key: `r${i + 1}`, value, label })),
    story: (STORIES[p.slug] ?? []).map(([title, text], i) => ({ _key: `s${i + 1}`, title, text })),
    result: null,
    liveUrl: p.liveUrl ?? null,
    gallery: GALLERIES[p.slug] ?? SAMPLE_GALLERY,
    flow: FLOWS.includes(p.slug)
      ? {
          heading: FLOW_HEADINGS[p.slug] ?? null,
          video: { url: `/work/${p.slug}/${p.slug}-flow.mp4`, mimeType: "video/mp4" },
          videoWebm: { url: `/work/${p.slug}/${p.slug}-flow.webm`, mimeType: "video/webm" },
          phone: { url: `/work/${p.slug}/${p.slug}-flow-phone.mp4`, mimeType: "video/mp4" },
          phoneWebm: { url: `/work/${p.slug}/${p.slug}-flow-phone.webm`, mimeType: "video/webm" },
          poster: { url: `/work/${p.slug}/${p.slug}-flow.jpg` },
          posterPhone: { url: `/work/${p.slug}/${p.slug}-flow-phone.jpg` },
        }
      : null,
  };
}

/** The line above each screen-flow video, under an "In motion" label. */
const FLOW_HEADINGS: Record<string, string> = {
  "surgo-health": "From the national map to one county's story, in a few clicks.",
  "care-connect": "From a new referral to an accepted patient.",
  rxlive: "A pharmacist's day, from worklist to review.",
  "sifio-health": "Every operating room minute, put to work.",
  meetingful: "From agenda to action items.",
  "oh-my-glam": "Try it on, find the shade, add to bag.",
  bigtapp: "AI that acts, page by page.",
  "cabot-solutions": "Healthcare software, page by page.",
  "carlton-noble": "Travel, events and access, page by page.",
  "engel-volkers": "One look, country by country.",
  "rohde-schwarz": "One brand, from print to the show floor.",
  norsecom: "One mark, everywhere the team shows up.",
  sandlogic: "Where silicon meets intelligence, out in the world.",
};

/** Projects with a screen-flow video (public/work/<slug>/<slug>-flow*.mp4), shown after the results. */
const FLOWS = [
  "surgo-health",
  "care-connect",
  "rxlive",
  "sifio-health",
  "meetingful",
  "oh-my-glam",
  "bigtapp",
  "cabot-solutions",
  "carlton-noble",
  "engel-volkers",
  "rohde-schwarz",
  "norsecom",
  "sandlogic",
];

/**
 * Sample mockups shared by every project until its real work is added
 * (public/work/samples): a wide image under the name, then eight squares,
 * two by two. Neutral screens: no names, no copy.
 */
const SAMPLE_GALLERY = [
  ["hero", "A sample website on a laptop and a phone"],
  ["1", "A sample app screen on a phone"],
  ["2", "A sample dashboard on a laptop, seen at an angle"],
  ["3", "A sample web page on a tablet"],
  ["4", "Sample app screens on three phones"],
  ["5", "A close-up of a sample web page"],
  ["6", "Sample web pages, stacked"],
  ["7", "Sample app screens, stacked"],
  ["8", "A sample website in a browser"],
].map(([n, alt]) => {
  const wide = n === "hero";
  return {
    ...img(`/work/samples/sample-${n}.jpg`, wide ? 2400 : 1400, wide ? 1350 : 1400, alt),
    _key: `sample-${n}`,
    size: wide ? ("full" as const) : ("half" as const),
  };
});

/**
 * A project's own mockups (public/work/<slug>): the image under the name
 * (<file>-0.jpg), then squares, two by two. The first shows 16:9 on wider
 * screens and square on phones, so a tall photo with its hotspot on the work
 * keeps the work whole in both; with size `original` it shows whole, at its
 * own proportions.
 */
const workGallery = (
  slug: string,
  file: string,
  hero: {
    alt: string;
    width: number;
    height: number;
    hotspot: { x: number; y: number };
    size?: "full" | "original";
    /** A square <file>-0-phone.jpg (2400) shown on phones instead. */
    phone?: boolean;
  },
  squares: string[],
  squareSize = 1200,
  /**
   * Tiles that are wide (<file>-N-wide.jpg, 2400 × 1529, or the size given) from
   * tablets up, with the square (<file>-N.jpg) on phones unless `phone` is false.
   */
  wide: boolean | { width: number; height: number; phone?: boolean } = false,
) => {
  const w = wide === true ? { width: 2400, height: 1529, phone: true } : wide ? { phone: true, ...wide } : null;
  return [
  {
    ...img(`/work/${slug}/${file}-0.jpg`, hero.width, hero.height, hero.alt),
    hotspot: hero.hotspot,
    _key: `${file}-hero`,
    size: hero.size ?? ("full" as const),
    phone: hero.phone ? { url: `/work/${slug}/${file}-0-phone.jpg`, width: 2400, height: 2400 } : null,
  },
  ...squares.map((alt, i) => ({
    ...(w
      ? {
          ...img(`/work/${slug}/${file}-${i + 1}-wide.jpg`, w.width, w.height, alt),
          phone: w.phone ? { url: `/work/${slug}/${file}-${i + 1}.jpg`, width: squareSize, height: squareSize } : null,
        }
      : img(`/work/${slug}/${file}-${i + 1}.jpg`, squareSize, squareSize, alt)),
    _key: `${file}-${i + 1}`,
    size: w ? ("original" as const) : ("half" as const),
  })),
  ];
};

/** Projects with their real work; the rest show the shared samples. */
const GALLERIES: Record<string, ReturnType<typeof workGallery>> = {
  "surgo-health": workGallery(
    "surgo-health",
    "surgo",
    {
      alt: "The Surgo Health home page for its Population Health Index",
      width: 2400,
      height: 1877,
      hotspot: { x: 0.5, y: 0.5 },
      // The whole Figma frame wider up, and a square version of it on phones.
      size: "original",
      phone: true,
    },
    [
      "The index explorer: every US county ranked on social drivers of health",
      "Secure sign-in for care teams, payers and public agencies",
      "The county explorer, with ten years of data and a county summary",
      "A county profile: its score, what drives it and a projected impact",
      "Two indices side by side on one map",
      "Ten years of vulnerability for a county, its state and the US",
      "Asking the index assistant about maternal health risk",
      "Building a regional brief to export",
      "Saved cohorts of counties on the map",
      "Simulating the impact of new programs for a cohort",
    ],
    1600,
    true,
  ),
  "care-connect": workGallery(
    "care-connect",
    "care",
    {
      alt: "The Care Connect home page: admissions, decided in minutes",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Secure sign-in with single sign-on and passkeys",
      "The daily dashboard: new intakes, open decisions and free beds",
      "The intake board, moving each patient from new to accepted",
      "All intakes in one table, with filters and bulk actions",
      "Reviewing a patient with an AI summary, care needs and a checklist",
      "Readmission risk scored automatically from the discharge summary",
      "Clinicians, notes and activity in one thread per patient",
      "Key fields pulled from discharge papers, checked in one click",
      "Matching accepted patients to open beds for the week ahead",
      "Intake analytics: funnel, response times and partner performance",
    ],
    1600,
    true,
  ),
  rxlive: workGallery(
    "rxlive",
    "rx",
    {
      alt: "The RxLive home page: medication care that keeps patients home",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Secure sign-in to the pharmacy workspace, with single sign-on and passkeys",
      "The daily worklist: reviews, adherence calls, consults and care alerts",
      "A patient overview: conditions, adherence, readmission risk and key medications",
      "Active medications with adherence, and a drug interaction flagged for review",
      "A medication review: recommended changes, problems found and a pharmacist note",
      "Clinical messages with prescribers, about one patient's medications",
      "A video consult with a live summary and talking points",
      "Finding a patient's outside records across health information exchanges",
      "Labs and vitals over time, with what changed since the last review",
      "Outcomes: adherence by drug class, admissions and payer partners",
    ],
    1600,
    true,
  ),
  "rohde-schwarz": workGallery(
    "rohde-schwarz",
    "rs",
    {
      alt: "Rohde & Schwarz print, events, digital and sales materials",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      // The desktop frame designed in Figma; the square collage on phones.
      size: "original",
      phone: true,
    },
    [
      "A company brochure cover: ensuring a safer and connected world",
      "A brochure spread on radar, EMC and connectivity testing",
      "A product brochure for a compact oscilloscope, in hand",
      "A social story ad on a phone, in the city at dusk",
      "The newsletter on a phone",
      "A sales deck on a tablet",
      "An exhibition booth: make ideas real",
      "Roll-up banners in a glass lobby",
      "A billboard at dusk: from Bengaluru to orbit",
      "An airport lightbox: connectivity you can measure",
      "Business cards on slate",
      "A letterhead and envelope",
      "Event badges for visitors, speakers and exhibitors",
      "A sales deck on a boardroom screen",
      "A magazine ad: spectrum dominance in all domains",
      "A metro poster: engineer the signal",
      "A keynote stage screen: get ahead of technology",
      "A digital brochure on a tablet",
      "A poster series: fast, precise, secure",
      "A product datasheet on a lab bench",
      "A trifold brochure on three divisions",
      "A product launch on the keynote screen at a technology forum",
      "A brochure in hand: precision, measured, proven",
      "An email newsletter inviting engineers to a live product launch",
      "Social posts and stories, with the logo and typeface",
    ],
    1600,
    true,
  ),
  // The web app, then the website.
  "sifio-health": [
    ...workGallery(
    "sifio-health",
    "sifio",
    {
      alt: "The Sifio Health web app: every operating room minute, put to work",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Secure sign-in with hospital single sign-on",
      "The surgical overview: utilization, acuity, urgency and case volume",
      "Block utilization by program, against the 85% target",
      "Surgeon insights: block use, case length accuracy and on-time starts",
      "Where block time is lost, traced to each cause",
      "Acuity and urgency, with the beds needed downstream",
      "An optimization plan of ranked changes for the next three weeks",
      "Daily insights: live recommendations and warnings",
      "The OR day twin: a live model of every room, with predicted overruns",
      "Outcomes before and after go-live",
    ],
    1600,
    true,
    ),
    ...workGallery(
      "sifio-health",
      "sifioweb",
      {
        alt: "The Sifio Health website on three screens",
        width: 2400,
        height: 1500,
        hotspot: { x: 0.5, y: 0.5 },
        size: "original",
        phone: true,
      },
      [
        "The home page: unlocking healthcare workflow",
        "The problem, in three ring charts: overtime, throughput and margin",
        "Solutions: platforms that streamline healthcare",
        "The planning view, shown inside the page",
        "An efficiency calculator: where does your department rank",
        "SurgiTwin: healthcare scheduling software for the future",
        "Dynamic review, with collectable time",
        "Monitoring overtime and nudges",
        "A case study with a regional Canadian health system",
        "Three steps to integrate SurgiTwin",
        "Our story: reimagining surgical efficiency",
        "Mission and vision",
        "Careers",
        "Resources: insights and success stories",
      ],
      1600,
      { width: 2400, height: 1500 },
    ),
  ],
  meetingful: workGallery(
    "meetingful",
    "meetingful",
    {
      alt: "The Meetingful home page: clear agendas, live notes and outcomes that last",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Secure sign-in to Meetingful with single sign-on",
      "Today's meetings with their agendas, team and AI prep",
      "The meeting library: recordings with decisions, actions and owners",
      "Smart scheduling that finds a slot that works for everyone",
      "A live meeting with captions, AI notes and one-tap actions",
      "A meeting summary with highlights, decisions and action items",
      "Asking questions across every meeting, with sources",
      "Action items from every meeting on one board, each with an owner",
      "Team insights: meeting time tied to outcomes, with a health score",
      "Joining a call and reading its recap on a phone",
    ],
    1600,
    true,
  ),
  "oh-my-glam": workGallery(
    "oh-my-glam",
    "omg",
    {
      alt: "Trying on lip gloss live in the Oh My Glam app, with product cards",
      width: 2400,
      height: 2400,
      hotspot: { x: 0.5, y: 0.42 },
    },
    [
      "A lipstick product page with shades seen on you",
      "Oh My Glam app screens, side by side",
      "Creator profile, looks and profile screens",
      "Store panels for shades, AI match and Glam AI",
      "Onboarding, welcome and home screens",
      "Trying on a lipstick live with AR tracking",
      "Three try-on screens for eyes, a full look and blush",
      "Bag, checkout and order confirmation screens",
      "Glam AI chat and booking a glam artist",
      "A face scan that matches shades to skin tone",
    ],
    1600,
    true,
  ),
  // Desktop 16:10 mockups from Figma, with their 1:1 versions on phones.
  "bigtapp": workGallery(
    "bigtapp",
    "bigtapp",
    {
      alt: "The BigTapp website on a laptop, tablet and phone",
      width: 2400,
      height: 1500,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "The home page: most enterprise AI just advises, BigTapp helps it act",
      "Proven impact, in numbers from real enterprise work",
      "One platform, from governed data to AI agents",
      "Why BigTapp: IP-led, domain-deep and tech-strong",
      "Industry pages for banking, insurance and retail",
      "Services from strategy to run, as one partner",
      "Case studies with the outcome of each engagement",
      "Thought leadership for regulated industries",
      "The Beeonix AI product page",
      "Beeonix AI features, in a grid of cards",
      "The banking and finance industry page",
      "The approach: identify, prove, operationalize, scale",
      "Contact, with offices in Singapore and India",
    ],
    1600,
    { width: 2400, height: 1500 },
  ),
  // The website, then the brand collateral.
  "cabot-solutions": [
    ...workGallery(
    "cabot-solutions",
    "cabot",
    {
      alt: "The Cabot Solutions website for healthcare software",
      width: 2400,
      height: 1500,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "The home page: redefining healthcare with digital transformation",
      "The vision, with years, projects, offices and clients",
      "Healthcare software services, in one blue panel",
      "Solution areas, from integration to voice AI agents",
      "AI development that gets programs past the pilot",
      "Product engineering, from MVP to quality engineering",
      "What a healthcare-native partner does differently",
      "Why healthcare leaders choose Cabot",
      "An invitation to map which system to move first",
      "The contact form and footer",
      "Clinician-supervised AI agents for healthcare",
      "Healthcare workflows an AI agent can take on",
    ],
    1600,
    { width: 2400, height: 1500 },
    ),
    // Brand collateral mockups (no image of their own under the name, so the first is dropped).
    ...workGallery(
      "cabot-solutions",
      "cabotbrand",
      { alt: "", width: 2400, height: 1529, hotspot: { x: 0.5, y: 0.5 } },
      [
        "A woman holding a Cabot flyer: a clinic photo on the left, and Built around your EHR with 15+ years, 700+ projects and 140+ clients on the right",
        "A stack of white Cabot business cards on grey marble, with the logo, the website and the three countries",
        "Two framed Cabot posters on a white wall: Voice AI agents in navy, and Healthcare software, built around your EHR in blue",
        "A Cabot poster lit in a bus shelter at night: Healthcare software, built around your EHR",
        "A roadside billboard for Cabot: two clinicians with a tablet, and 700+ projects, 140+ clients",
        "A standing Cabot sign at a stone entrance: a doctor on the phone, and Voice AI agents, a person on every clinical call",
        "A Cabot employee pass on a blue lanyard, worn over a navy shirt",
        "Four people in a meeting room looking at a Cabot slide: Why healthcare leaders choose Cabot, with the three numbers",
        "A hand holding an iPhone in an office, showing a Cabot social post about voice AI agents",
        "A person holding a white canvas tote bag with the Cabot logo",
      ],
      1600,
      { width: 2400, height: 1529 },
    ).slice(1),
  ],
  "carlton-noble": workGallery(
    "carlton-noble",
    "carlton",
    {
      alt: "The Carlton Noble website on three screens",
      width: 2400,
      height: 1500,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "The home page: access the extraordinary",
      "Travel House, opening with a full-screen photograph",
      "Experiential travel",
      "Private travel",
      "Event House, as a photo collage",
      "VIP guest management",
      "Brand activation",
      "Access House, as a photo collage",
      "Hospitality and ticketing",
      "Bespoke brand collaboration",
      "Exclusive access",
      "The gallery",
      "Stories from the Carlton Noble world, by house",
    ],
    1600,
    { width: 2400, height: 1500 },
  ),
  "engel-volkers": workGallery(
    "engel-volkers",
    "ev",
    {
      alt: "Engel & Völkers country landing pages on three screens",
      width: 2400,
      height: 1500,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Dubai: find your dream property",
      "Mauritius",
      "Mykonos",
      "Quinta do Lago, from the air",
      "Berlin",
      "Italy, region by region",
      "The Greek islands",
      "Portugal",
      "Spain",
      "Switzerland",
      "France",
      "Featured luxury listings in Dubai",
      "The Private Office",
      "The world of Engel & Völkers clients",
    ],
    1600,
    { width: 2400, height: 1500 },
  ),
  "norsecom": workGallery(
    "norsecom",
    "norsecom",
    {
      alt: "The Norsecom brand on a booth, a reception wall and business cards",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "Norsecom business cards and a mug on a sand-coloured ledge",
      "A Norsecom billboard on a grey stone wall",
      "Business cards",
      "Letterhead and envelope",
      "A notebook and folder",
      "A tri-fold brochure",
      "A staff ID card",
      "A T-shirt",
      "A mug",
      "A tote bag",
      "The reception",
      "Office signage",
      "An exhibition booth",
      "A bus shelter poster",
      "Packaging for a Mergein gateway",
    ],
    1600,
    true,
  ),
  // Brand projects in the Rohde & Schwarz layout: photo and side panel from tablets up, the photo alone on phones.
  "sandlogic": workGallery(
    "sandlogic",
    "sandlogic",
    {
      alt: "The SandLogic brand: where silicon meets intelligence",
      width: 2400,
      height: 1529,
      hotspot: { x: 0.5, y: 0.5 },
      size: "original",
      phone: true,
    },
    [
      "The brand board",
      "The brand mark",
      "The brand system: symbol, app icon and type",
      "Colours and social posts",
      "An exhibition booth",
      "A panel discussion stage",
      "A keynote stage",
      "A digital billboard",
      "The reception wall",
      "The company profile",
      "A brochure",
      "A tri-fold brochure",
      "Stationery",
      "Event badges",
      "A team polo shirt",
      "A T-shirt",
      "Enamel mugs",
      "A water bottle",
      "The website on a phone",
      "Social posts",
    ],
    1600,
    true,
  ),
};

/** Case-study details from the client case studies; projects not listed show their card image and cover. */
const CASE_DETAILS: Record<string, CaseDetails> = {
  "surgo-health": {
    tagline: "Healthcare analytics, made clear.",
    location: "Canada",
    year: "2022",
    stats: [
      ["15+", "Healthcare clients"],
      ["4+", "Major partnerships"],
    ],
  },
  "care-connect": {
    tagline: "Faster referrals for post-acute care.",
    location: "Canada",
    year: "2021",
    stats: [
      ["300+", "Referrals processed"],
      ["1500+", "Active users"],
      ["75%", "Efficiency boost"],
      ["50+", "Healthcare partners"],
    ],
  },
  meetingful: {
    tagline: "Smarter meetings, from plan to follow-up.",
    location: "Canada",
    year: "2024",
    stats: [
      ["40%", "Better meeting output"],
      ["3X", "Faster decisions"],
      ["50%", "Less follow-up effort"],
      ["35%", "Better task accountability"],
    ],
  },
  rxlive: {
    tagline: "Healthcare data, turned into decisions.",
    location: "United States",
    year: "2022",
    stats: [
      ["25%", "Drop in admissions"],
      ["5X", "Return on healthcare spend"],
      ["150+", "Healthcare partners"],
      ["35%", "Better medication adherence"],
    ],
  },
  "oh-my-glam": {
    tagline: "Make-up, tried on before you buy.",
    location: "China",
    year: "2017",
    stats: [
      ["2X", "Faster booking"],
      ["35%", "More sales conversion"],
      ["30%", "Better customer retention"],
      ["40%", "More repeat bookings"],
    ],
  },
  "carlton-noble": {
    tagline: "A digital experience for modern luxury.",
    location: "Canada",
    year: "2025",
    stats: [
      ["65%", "Higher conversion rate"],
      ["55%", "Lower bounce rate"],
      ["100%", "Consistent content experience"],
      ["2X", "Qualified traffic"],
    ],
  },
  "engel-volkers": {
    tagline: "Luxury real estate, with a look of its own.",
    location: "Germany",
    year: "2024",
    stats: [["45%", "Higher brand recognition"]],
  },
};

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
      "Surgo Health grew from a consultancy into a SaaS product that helps healthcare teams decide with data. We designed its insight dashboards, a survey app and its website.",
    liveUrl: "https://www.surgohealth.com/",
  },
  {
    name: "Oh My Glam",
    slug: "oh-my-glam",
    industry: "Beauty",
    services: ["ai-product-design"],
    summary:
      "Oh My Glam lets shoppers try make-up on live before they buy. We designed the mobile app: AR try-on for lips, eyes and face, AI shade matching from a face scan, Glam AI for looks and artist bookings, and checkout.",
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
    industry: "Healthcare",
    services: ["ai-product-design", "ai-mvps-business-apps"],
    summary:
      "Care Connect manages referrals in post-acute care. We designed one web and mobile platform where providers, administrators and staff share real-time data, insights and secure messages.",
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
    name: "Engel & Völkers",
    slug: "engel-volkers",
    industry: "Real estate",
    services: ["ai-websites"],
    summary:
      "In luxury real estate, a strong identity builds trust with high-value buyers. We created a refined branding and illustration system for Engel & Völkers, used across its website and marketing.",
  },
  {
    name: "Sifio Health",
    slug: "sifio-health",
    industry: "Healthcare software",
    services: ["ai-product-design", "ai-websites"],
    summary:
      "Sifio Health builds AI software for surgical centres. We designed its perioperative web app, which turns hospital data into a live model of the surgical day, and its website.",
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
    industry: "Healthcare",
    services: ["ai-product-design"],
    summary:
      "Rxlive brings scattered medical, pharmacy and patient data into one platform. We designed a clear web app that helps care teams spot trends and make informed decisions.",
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
    industry: "Collaboration software",
    services: ["ai-product-design"],
    summary:
      "Meetingful AI helps teams plan, run and follow up on meetings. We designed the web app, from meeting highlights and takeaways to an AI assistant that answers questions about any meeting.",
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
    name: "Carlton Noble",
    slug: "carlton-noble",
    industry: "Luxury lifestyle",
    services: ["ai-websites"],
    summary:
      "Carlton Noble is a luxury lifestyle brand for curated travel, bespoke events and high-end hospitality. We designed a website as refined as the experiences it offers.",
  },
];

export const PROJECTS: Project[] = CASE_STUDIES.map((p, i) => makeProject(i + 1, p));

/** Slug of the project featured on Home (set in Site settings). */
export const FEATURED_PROJECT_SLUG = "oh-my-glam";

/** Earlier Home features: add mode moves the setting on from these, but keeps a pick made in Studio. */
export const PREVIOUS_FEATURED_IDS = ["project-surgo-health"];

/** Case studies taken off the site: the seed deletes them in either mode. */
export const REMOVED_PROJECT_IDS = ["project-elcoteq", "project-ciber-digita", "project-appdev-health", "project-amphenol"];

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
        // See our work: the header and the floating bar already lead to Contact.
        button: { label: "See our work", href: "/work" },
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
      {
        _type: "showreel",
        _key: "reel",
        label: "Showreel",
        heading: "Our work, in motion.",
        video: { url: "/work/showreel.mp4", mimeType: "video/mp4" },
        videoWebm: { url: "/work/showreel.webm", mimeType: "video/webm" },
        poster: img("/work/showreel.jpg", 1920, 1080, "A wall of Opsiogen case study covers"),
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
      {
        _type: "comparison",
        _key: "comparison",
        label: "Why Opsiogen",
        heading: "The faster way to get it done.",
        accent: "faster",
        columns: ["Opsiogen", "Hiring in-house", "Traditional agency"],
        rows: [
          { _key: "r1", label: "Speed", cells: ["Days, not months", "Months to hire and settle in", "Months, project by project"] },
          {
            _key: "r2",
            label: "Skills",
            cells: ["Every digital need, one partner", "Only the skills you hire", "A new agency for each need"],
          },
          {
            _key: "r3",
            label: "Cost",
            cells: ["A fixed price or one monthly plan", "Salaries and overheads", "Quoted project by project"],
          },
          { _key: "r4", label: "AI", cells: ["Used at every stage", "Depends on the hire", "Varies"] },
          {
            _key: "r5",
            label: "Ownership",
            cells: ["You own everything we build", "You own it", "Depends on the contract"],
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
