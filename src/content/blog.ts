import type { Post, PostCategory, PostImageBlock } from "@/lib/types";
import type { PortableTextBlock } from "next-sanity";

/**
 * Blog content: the page's own text and the starter posts. The seed writes
 * the posts to Sanity; until then the site shows them from here. Posts marked
 * `demo` are examples: they show only on /blog/preview, never to visitors.
 *
 * The six posts are real articles (owner, 28 Nov 2026), one for each of our
 * main services and one on being found in search and AI answers. Their covers
 * are our own service tiles, cut to 16:10 by design/blog/covers.py.
 */

export const BLOG = {
  label: "Blog",
  heading: "Insights",
  text: "Practical notes on websites, products, AI and marketing, from the work we do.",
  description:
    "Practical notes from Opsiogen on websites, product design, AI automation and marketing for growing businesses.",
};

/**
 * A body written compactly: paragraphs, headings, lists, a quote or an image.
 * In text, [label](/path) makes a link and **text** makes it bold.
 */
type Part =
  | ["p", string]
  | ["h2", string]
  | ["h3", string]
  | ["ul", string[]]
  | ["ol", string[]]
  | ["quote", string]
  | ["img", { url: string; width: number; height: number; alt: string; caption?: string }];

type StarterPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory;
  publishedAt: string;
  cover: { url: string; alt: string };
  demo?: boolean;
  body: Part[];
};

/** Newest first, as the blog lists them. */
const STARTER_POSTS: StarterPost[] = [
  {
    title: "How to show up in Google and AI answers",
    slug: "how-to-show-up-in-google-and-ai-answers",
    excerpt: "What helps a site appear in search results and AI answers: clear answers, good structure, speed and trust.",
    category: "Marketing",
    publishedAt: "2026-11-28T10:00:00Z",
    cover: {
      url: "/blog/how-to-show-up-in-google-and-ai-answers.jpg",
      alt: "Search cards on forest green: a walking boots guide in first place, a ranking chart climbing to the top and a list of search terms",
    },
    body: [
      [
        "p",
        "When people look for a business like yours, they might scan a page of search results or ask an AI assistant for a recommendation. Both reward the same things: pages that are easy to find, easy to understand and easy to trust. Here is what we put in place on every site, and what you can check on yours.",
      ],
      ["h2", "How do search engines and AI assistants choose a page?"],
      [
        "p",
        "Both work in a similar way. They find your pages, read them, work out what each one is about and judge whether it’s trustworthy enough to show. A page that is hard to reach, vague or slow loses out at every step, however good the business behind it.",
      ],
      ["h2", "Make sure your pages can be found"],
      ["p", "Start with the basics. Check that:"],
      [
        "ul",
        [
          "Every page has its own clear address and is linked from somewhere on the site",
          "A sitemap lists every page you want found",
          "Nothing important is hidden from search engines by mistake",
          "The site is verified in the search engines’ webmaster tools, so you can see how they read it",
        ],
      ],
      ["h2", "Answer the questions your customers ask"],
      [
        "p",
        "Write down the questions people ask before they buy: what it costs, how long it takes, how it works and whether it suits them. Give each important question a clear place on your site. Put the direct answer first, in a sentence or two, then the detail. Clear, self-contained answers are easier for search engines to show and for AI assistants to quote.",
      ],
      ["h2", "Give every page a clear structure"],
      [
        "p",
        "Use one main heading that says what the page is about, then subheadings that describe each section, in order. Keep paragraphs short and use lists where they help. Structure helps people scan, and it helps machines understand what each part of the page covers.",
      ],
      ["h2", "Add FAQs where questions come up"],
      [
        "p",
        "A short set of questions and answers on a service page settles doubts before they become objections, and it matches the way people search and ask. Keep the answers honest and specific, and mark them up so search engines know they are questions and answers.",
      ],
      ["h2", "Tell search engines what each page is"],
      [
        "p",
        "Every page needs its own title and description, written for people: what the page offers and why it’s worth the click. Behind the scenes, structured data, a small piece of code, tells search engines what they are looking at: your organisation, a service, an article or a set of questions. It removes the guesswork.",
      ],
      ["h2", "Show who you are"],
      [
        "p",
        "Search engines and AI assistants prefer sources they can trust. Make that easy: a clear About page, real contact details, examples of your work, and the same business name and description everywhere you appear. Vague, anonymous pages are hard to recommend.",
      ],
      ["h2", "Make it fast and easy on a phone"],
      [
        "p",
        "Slow pages lose visitors before they read a word. Compress images, keep scripts light and check every page on a phone. Speed is one of the few things you fully control.",
      ],
      ["h2", "Get mentioned elsewhere"],
      [
        "p",
        "What others say about you counts too. Listings in relevant directories, partner pages, reviews and articles that mention your business all help search engines and AI assistants understand who you are and what you’re known for. Keep your details consistent everywhere they appear.",
      ],
      ["h2", "Keep it current"],
      [
        "p",
        "Update pages when your services, prices or details change, and remove what’s out of date. Accurate pages are more useful to people, and more likely to be shown.",
      ],
      ["h2", "How do you know it’s working?"],
      [
        "p",
        "Watch how often your pages appear in search and how many visits turn into enquiries. Ask new customers how they found you. And ask AI assistants the questions your customers would ask: see whether you’re mentioned, and what they say about you.",
      ],
      ["h2", "How we help"],
      [
        "p",
        "We build every site with clear headings, fast pages, structured data and proper page details, so search engines and AI assistants can read it. See how we build [websites](/services/ai-websites) and run [digital marketing](/services/digital-marketing), or [ask us about your site](/contact).",
      ],
    ],
  },
  {
    title: "Designing a product people use without training",
    slug: "designing-a-product-people-use-without-training",
    excerpt: "How clear screens, sensible defaults and small moments of guidance help new users get going on their own.",
    category: "Product design",
    publishedAt: "2026-11-28T09:00:00Z",
    cover: {
      url: "/blog/designing-a-product-people-use-without-training.jpg",
      alt: "A travel app, a produce ordering screen and a booking confirmation we designed, on two phones and a browser, on teal",
    },
    body: [
      [
        "p",
        "People decide quickly whether a product is worth learning. If the first session feels like work, they leave, or they stay and ask for help with everything. A product people can use without training isn’t luck. It comes from a few habits we design around.",
      ],
      ["h2", "Design around the jobs, not the features"],
      [
        "p",
        "Nobody opens a product to admire its features. They open it to get something done: send an invoice, book a session, approve a request. List those jobs, rank them by how often they happen and build the main screens around the top few. Everything else can sit one level down.",
      ],
      ["h2", "Get to a first result quickly"],
      [
        "p",
        "The first session sets the tone. Design it around one useful result and remove every step that doesn’t lead there. Profiles, settings and integrations can wait until the person has seen the product work.",
      ],
      ["h2", "Use the words your users use"],
      [
        "p",
        "Labels are the cheapest usability fix there is. Name things the way your users talk about them, not the way the database stores them. “Book a session” beats “Create appointment”. Read every button aloud: if it needs explaining, rename it.",
      ],
      ["h2", "Choose sensible defaults"],
      [
        "p",
        "Every choice you ask people to make is a chance to stall. Pick the option most people would choose, fill it in for them and make it easy to change later. Good defaults do the thinking for new users and stay out of the way of experienced ones.",
      ],
      ["h2", "Guide in context, not with tours"],
      [
        "p",
        "Long product tours ask people to remember things before they need them. Put a short hint next to the thing it explains, at the moment it helps, and let people dismiss it. Empty screens are a good place to start: instead of “No data yet”, show what will appear there and the one action that fills it.",
      ],
      ["h2", "Make mistakes cheap"],
      [
        "p",
        "People learn by trying, and they try more when nothing feels permanent. Offer undo where you can, ask for confirmation only before actions that can’t be reversed, and write error messages that say what happened and what to do next.",
      ],
      ["h2", "Keep it consistent as it grows"],
      [
        "p",
        "When the same action looks and works the same everywhere, people learn it once. A design system, a shared set of components and rules, keeps buttons, forms and messages consistent as the product grows and more people build it.",
      ],
      ["h2", "Watch real people use it"],
      [
        "p",
        "Nothing replaces watching someone new try the product. Give them a real task, stay quiet and note where they hesitate. A few short sessions settle questions that meetings can’t, and each round makes the next version easier to use.",
      ],
      ["h2", "How we help"],
      [
        "p",
        "We design SaaS, enterprise and mobile products around these habits, from the first flows to a full design system. See our [product design](/services/ai-product-design) work, or [tell us about your product](/contact).",
      ],
    ],
  },
  {
    title: "Where AI automation fits in everyday operations",
    slug: "where-ai-automation-fits-in-everyday-operations",
    excerpt: "Start with the repetitive work your people already dislike: that’s usually where automation pays off first.",
    category: "AI & automation",
    publishedAt: "2026-11-28T08:00:00Z",
    cover: {
      url: "/blog/where-ai-automation-fits-in-everyday-operations.jpg",
      alt: "An enquiry workflow between two phones on violet: a staff assistant answering a holiday question and a request to approve an order",
    },
    body: [
      [
        "p",
        "AI automation pays off fastest on ordinary work: the tasks people repeat every day or week, that follow clear rules and move information from one place to another. Start there, not with the most ambitious idea. Here is how we find the right first tasks and bring them in safely.",
      ],
      ["h2", "Look for work that repeats"],
      ["p", "Ask people which tasks they do the same way every week, and which ones they put off. Typical answers:"],
      [
        "ul",
        [
          "Copying details from emails, forms and documents into another system",
          "Reading invoices, orders and receipts",
          "Sorting routine enquiries and sending first replies",
          "Chasing approvals and sign-offs",
          "Building the same report every week",
        ],
      ],
      ["h2", "Choose tasks with clear rules"],
      [
        "p",
        "A good first task has a clear start, a clear finish and a way to check the result. “Put each invoice’s supplier, date and total into the accounts” is a good candidate. “Decide which suppliers to keep” is not: that needs judgement and context only your people have.",
      ],
      ["h2", "What AI adds"],
      [
        "p",
        "Older automation could only follow fixed rules on tidy data. AI can also read and write. It can pull details out of a scanned document, tell a complaint from a sales enquiry, draft a reply or summarise a long thread. That opens up work that used to need a person for every single item.",
      ],
      ["h2", "Keep a person in the loop"],
      ["p", "Start with automation preparing the work and a person approving it:"],
      [
        "ol",
        [
          "Let automation prepare the work: the details pulled out, the draft reply, the report",
          "Let a person check and approve it",
          "Automate the approval only once the results are reliably right",
        ],
      ],
      ["p", "This builds trust, catches mistakes early and shows exactly where the automation needs to improve."],
      ["h2", "Work inside the tools you already use"],
      [
        "p",
        "Automation works best inside the systems people already open every day: email, the accounts software, customer records, a shared spreadsheet. Nobody should have to learn a new screen to benefit from it.",
      ],
      ["h2", "Look after data and access"],
      [
        "p",
        "Decide what the automation can see and what it can change. Keep sensitive information where it already lives, give each automation only the access it needs and keep a record of what it did.",
      ],
      ["h2", "Measure the time saved"],
      [
        "p",
        "Note how long the task takes today and how often it happens. Check again after a few weeks. The difference shows whether it worked and which task to automate next.",
      ],
      ["h2", "Where to start"],
      [
        "p",
        "Pick one task this month: common, rule-based and disliked. Automate it with a person checking the output, measure the result, then move to the next. See how we approach [AI automation](/services/ai-automation), or [tell us which task you would hand over first](/contact).",
      ],
    ],
  },
  {
    title: "Planning a month of social content in one sitting",
    slug: "planning-a-month-of-social-content-in-one-sitting",
    excerpt: "A simple planning routine that keeps posts regular, on brand and tied to what the business is doing.",
    category: "Marketing",
    publishedAt: "2026-11-28T07:00:00Z",
    cover: {
      url: "/blog/planning-a-month-of-social-content-in-one-sitting.jpg",
      alt: "Social creatives on teal: a candle ad, a coffee video on a phone, a planned feed on a phone and a lemonade post",
    },
    body: [
      [
        "p",
        "Posting regularly is hard when every post starts from a blank page on the day. A monthly plan fixes that. One focused session gives you a month of ideas, a calendar and time to make each post properly. Here is the routine we follow.",
      ],
      ["h2", "Start from the business calendar"],
      [
        "p",
        "Before any ideas, list what is happening in the business this month: launches, events, offers, hiring and the seasonal moments in your industry. These become your anchor posts. Everything else supports them.",
      ],
      ["h2", "Choose a few content themes"],
      [
        "p",
        "Themes are the subjects you come back to again and again. They keep the feed varied without starting from scratch each time. Good ones to start with:",
      ],
      [
        "ul",
        [
          "Your work and what it achieved for customers",
          "Answers to questions customers ask",
          "How you work, behind the scenes",
          "The people behind the business",
          "News, launches and offers",
        ],
      ],
      ["h2", "Set a rhythm you can keep"],
      [
        "p",
        "Decide how often you will post on each channel, then stick to it. A steady rhythm beats bursts of activity followed by silence. Posting less and keeping going works better than posting daily for two weeks and stopping.",
      ],
      ["h2", "Fill the calendar"],
      [
        "p",
        "Put the anchor posts on their dates first. Then spread the themes across the remaining slots, so no subject repeats too often in a row. For each slot, write a working title and the format: a single image, a carousel, a short video or a story.",
      ],
      ["h2", "Make one idea work harder"],
      [
        "p",
        "A strong idea can become several posts. A customer question might become a short video, a carousel that walks through the answer and a quick tip in stories. Plan them together and each idea goes further.",
      ],
      ["h2", "Write and design in batches"],
      [
        "p",
        "Write all the captions in one session and design the visuals in another. Working in batches keeps the voice and the look consistent, and leaves time for someone else to review before anything goes out.",
      ],
      ["h2", "Leave room for the moment"],
      [
        "p",
        "Keep a few slots open for what you can’t plan: news in your industry, a customer win, a question everyone is asking. A plan should give you structure, not stop you reacting.",
      ],
      ["h2", "Review and adjust"],
      [
        "p",
        "At the end of the month, look at which posts started conversations, brought visits to your site or led to enquiries. Do more of what worked in next month’s plan. Likes are pleasant; enquiries matter more.",
      ],
      ["h2", "How we help"],
      [
        "p",
        "We plan, design and publish social content every week, so your brand stays visible without adding work to your day. See our [social media marketing](/services/ai-social-media-marketing), or [tell us where you post today](/contact).",
      ],
    ],
  },
  {
    title: "Keeping a brand consistent across every channel",
    slug: "keeping-a-brand-consistent-across-every-channel",
    excerpt: "Why a small set of shared rules and ready-made templates keeps a growing brand looking like itself.",
    category: "Brand & creative",
    publishedAt: "2026-11-28T06:00:00Z",
    cover: {
      url: "/blog/keeping-a-brand-consistent-across-every-channel.jpg",
      alt: "One cycling brand on a website, a mobile site and a printed poster, all in black and lime",
    },
    body: [
      [
        "p",
        "A brand drifts as a business grows. More people create content, more channels need it and deadlines win over guidelines. Consistency doesn’t come from policing. It comes from rules that are easy to follow and templates that make the right choice the easy one.",
      ],
      ["h2", "Why consistency matters"],
      [
        "p",
        "People recognise a brand through repetition: the same colours, the same type, the same way of speaking. Each consistent touchpoint builds on the last. Each inconsistent one makes the business look smaller or less sure of itself.",
      ],
      ["h2", "Write down the few rules that matter"],
      ["p", "Most everyday decisions come down to a handful of things:"],
      [
        "ul",
        [
          "**Logo:** the versions, the space around it and what not to do with it",
          "**Colour:** the main colours, the supporting ones and where each is used",
          "**Type:** the fonts and how headings, text and captions relate",
          "**Imagery:** the style of photos, illustrations and icons",
          "**Voice:** how the brand sounds, with a few examples of what to say and what to avoid",
        ],
      ],
      ["p", "Keep the guide short enough to read in one sitting. A long document nobody opens protects nothing."],
      ["h2", "Give people templates"],
      [
        "p",
        "Templates do more for consistency than any rulebook. Ready-made layouts for social posts, presentations, documents, email signatures and ads mean people start from something on brand instead of a blank page.",
      ],
      ["h2", "Keep every file in one place"],
      [
        "p",
        "Put the current logos, fonts, templates and approved photos in one shared place, and remove the old versions. Plenty of inconsistency starts with an outdated file found in an old email.",
      ],
      ["h2", "Adapt without breaking the brand"],
      [
        "p",
        "Every channel has its own shapes and habits. A banner, a story and a printed brochure can’t look identical, and they shouldn’t. Keep the core fixed (logo, colours, type and voice) and let layout and format flex to suit each one.",
      ],
      ["h2", "Make someone responsible"],
      [
        "p",
        "Name one person who answers brand questions and approves new templates. It doesn’t have to be a full-time role, but it does have to be someone’s job.",
      ],
      ["h2", "Review it regularly"],
      [
        "p",
        "Every few months, put recent work side by side: website, social, sales material and print. Where things drifted, ask why. Often a rule was unclear or a template was missing. Fix the system, not just the file.",
      ],
      ["h2", "How we help"],
      [
        "p",
        "We build brand identities, guidelines and ready-to-use templates, and keep them consistent as you grow. See our [brand services](/services/ai-brand-services), or [tell us about your brand](/contact).",
      ],
    ],
  },
  {
    title: "How to brief a website redesign",
    slug: "how-to-brief-a-website-redesign",
    excerpt:
      "What to have ready before a redesign starts, so the new site does the job you need and gets there faster.",
    category: "Websites",
    publishedAt: "2026-11-04T09:00:00Z",
    cover: {
      url: "/blog/how-to-brief-a-website-redesign.jpg",
      alt: "An estate agency’s dated website behind its redesign, with an arrow from Before to After, on blue",
    },
    body: [
      [
        "p",
        "A website redesign goes faster and lands better when the brief is clear. It doesn’t need to be long. It needs to answer a few questions before anyone opens a design file. Here is what we ask for, and why.",
      ],
      ["h2", "Start with the job the site has to do"],
      [
        "p",
        "Every site has one or two jobs that matter more than the rest: bring in enquiries, sell a product, book demos, hire people or answer customer questions. Name them. They decide what goes on the home page, where each page leads and how we judge the result.",
      ],
      ["h2", "Say who it is for"],
      [
        "p",
        "List the people who visit and what each of them came to do. A buyer comparing suppliers needs different pages from a customer looking for support. Once we know who we are designing for, the structure follows.",
      ],
      ["h2", "Gather what you already have"],
      ["p", "Collect these in one place before the first meeting:"],
      [
        "ul",
        [
          "Your logo, brand colours and fonts, if you have them",
          "The pages and content you want to keep",
          "Photos, videos and case studies you can use",
          "Access to the current site, its analytics and the domain",
          "A few sites you like, and what you like about each",
        ],
      ],
      ["h2", "Know which pages already work"],
      [
        "p",
        "Some of your current pages already earn their place: they bring visitors from search, get shared or turn visits into enquiries. Find them before anything changes. Keep their content, or point their old addresses to the new pages, so the new site keeps the visitors the old one earned.",
      ],
      ["h2", "Decide what success looks like"],
      [
        "p",
        "Pick a few signs that tell you the new site works: more enquiries from the contact form, more demo requests, fewer support emails, faster pages. Note where each one stands today, so there is something to compare against after launch.",
      ],
      ["quote", "A good brief isn’t long. It says what the site is for, who it is for and how you will know it works."],
      ["h2", "Agree who signs off"],
      [
        "p",
        "Projects slow down when feedback arrives late or from too many directions. Choose one person to gather comments and approve each stage. It keeps the project moving and the decisions consistent.",
      ],
      ["h2", "What we do with it"],
      [
        "p",
        "We turn the brief into a sitemap and a page-by-page plan, then design the key pages first so you see the direction early. If a question has no answer yet, that’s fine: we work it out together in the first session.",
      ],
      [
        "p",
        "Planning a redesign? See how we build [websites and revamps](/services/ai-websites), or [tell us about your site](/contact).",
      ],
    ],
  },
];

const key = (i: number) => `b${i}`;

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type LinkMark = { _type: "link"; _key: string; href: string };

/** A compact text as spans: [label](/path) becomes a link, **text** bold. */
function inline(text: string, at: string): { children: Span[]; markDefs: LinkMark[] } {
  const children: Span[] = [];
  const markDefs: LinkMark[] = [];
  const add = (t: string, marks: string[] = []) => {
    if (t) children.push({ _type: "span", _key: `${at}s${children.length}`, text: t, marks });
  };
  let last = 0;
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g)) {
    add(text.slice(last, m.index));
    if (m[1] !== undefined) {
      const mark = `${at}m${markDefs.length}`;
      markDefs.push({ _type: "link", _key: mark, href: m[2] });
      add(m[1], [mark]);
    } else add(m[3], ["strong"]);
    last = m.index + m[0].length;
  }
  add(text.slice(last));
  return { children, markDefs };
}

/** A compact body as Portable Text, as Studio stores it. */
export function toBlocks(parts: Part[]): (PortableTextBlock | PostImageBlock)[] {
  const out: (PortableTextBlock | PostImageBlock)[] = [];
  parts.forEach((part, i) => {
    const [type, value] = part;
    if (type === "ul" || type === "ol") {
      value.forEach((item, j) =>
        out.push({
          _type: "block",
          _key: `${key(i)}l${j}`,
          style: "normal",
          listItem: type === "ul" ? "bullet" : "number",
          level: 1,
          ...inline(item, `${key(i)}l${j}`),
        } as PortableTextBlock),
      );
    } else if (type === "img") {
      out.push({ _type: "image", _key: key(i), ...value, caption: value.caption ?? null });
    } else {
      const style = type === "p" ? "normal" : type === "quote" ? "blockquote" : type;
      out.push({ _type: "block", _key: key(i), style, ...inline(value, key(i)) } as PortableTextBlock);
    }
  });
  return out;
}

/** Plain text of a body, for reading time. */
export function bodyText(body: Post["body"]) {
  return body
    .map((b) =>
      b._type === "block" && "children" in b && Array.isArray(b.children)
        ? b.children.map((c) => ("text" in c ? String(c.text) : "")).join("")
        : "",
    )
    .join(" ");
}

/** Minutes to read a body of this many characters (about 1,100 characters a minute). */
export const readMinutes = (chars: number) => Math.max(1, Math.round(chars / 1100));

export const POSTS: Post[] = STARTER_POSTS.map((p) => {
  const body = toBlocks(p.body);
  return {
    _id: `post-${p.slug}`,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category,
    publishedAt: p.publishedAt,
    readMinutes: readMinutes(bodyText(body).length),
    cover: { url: p.cover.url, width: 1600, height: 1000, alt: p.cover.alt },
    demo: p.demo ?? false,
    body,
  };
});
