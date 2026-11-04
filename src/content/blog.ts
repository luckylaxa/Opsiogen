import type { Post, PostCategory, PostImageBlock } from "@/lib/types";
import type { PortableTextBlock } from "next-sanity";

/**
 * Blog content: the page's own text and the starter posts. The seed writes
 * the posts to Sanity; until then the site shows them from here. Posts marked
 * `demo` are examples: they show only on /blog/preview, never to visitors.
 */

export const BLOG = {
  label: "Blog",
  heading: "Insights",
  text: "Practical notes on websites, products, AI and marketing, from the work we do.",
  description:
    "Practical notes from Opsiogen on websites, product design, AI automation and marketing for growing businesses.",
};

/** A body written compactly: paragraphs, headings, lists, a quote or an image. */
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

const STARTER_POSTS: StarterPost[] = [
  {
    title: "How to brief a website redesign",
    slug: "how-to-brief-a-website-redesign",
    excerpt:
      "What to have ready before a redesign starts, so the new site does the job you need and gets there faster.",
    category: "Websites",
    publishedAt: "2026-11-04T09:00:00Z",
    cover: { url: "/blog/how-to-brief-a-website-redesign.jpg", alt: "Outlined browser windows in the Opsiogen gradient on a dark background" },
    body: [
      [
        "p",
        "A website redesign goes faster and lands better when the brief is clear. It doesn't need to be long. It needs to answer a few questions before anyone opens a design file. Here is what we ask for, and why.",
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
      ["h2", "Decide what success looks like"],
      [
        "p",
        "Pick a few signs that tell you the new site works: more enquiries from the contact form, more demo requests, fewer support emails, faster pages. Note where each one stands today, so there is something to compare against after launch.",
      ],
      ["quote", "A good brief isn't long. It says what the site is for, who it is for and how you will know it works."],
      ["h2", "Agree who signs off"],
      [
        "p",
        "Most delays come from feedback that arrives late or from too many directions. Choose one person to gather comments and approve each stage. It keeps the project moving and the decisions consistent.",
      ],
      ["h2", "What we do with it"],
      [
        "p",
        "We turn the brief into a sitemap and a page-by-page plan, then design the key pages first so you see the direction early. If a question has no answer yet, that's fine: we work it out together in the first session.",
      ],
    ],
  },
  {
    title: "Designing a product people use without training",
    slug: "designing-a-product-people-use-without-training",
    excerpt: "How clear screens, sensible defaults and small moments of guidance help new users get going on their own.",
    category: "Product design",
    publishedAt: "2026-10-28T09:00:00Z",
    cover: { url: "/blog/designing-a-product-people-use-without-training.jpg", alt: "Stacked interface cards outlined in the Opsiogen gradient" },
    demo: true,
    body: [
      ["p", "New users decide quickly whether a product is worth learning. The best products make that decision easy by showing value before asking for effort."],
      ["h2", "Lead with the first useful result"],
      ["p", "Design the first session around one result the user cares about, and remove every step that doesn't lead to it. Settings, profiles and integrations can wait."],
      ["h2", "Use defaults that fit most people"],
      ["p", "Good defaults do the thinking for the user. Pick the option most people would choose, and make it easy to change later."],
      ["img", { url: "/blog/designing-a-product-people-use-without-training.jpg", width: 1600, height: 1000, alt: "Interface cards stacked in layers", caption: "Show the next step, not every step." }],
      ["h2", "Guide in context"],
      ["p", "Short hints next to the thing they explain beat long tours. Show them once, at the moment they help, and let people dismiss them."],
    ],
  },
  {
    title: "Where AI automation fits in everyday operations",
    slug: "where-ai-automation-fits-in-everyday-operations",
    excerpt: "Start with the repetitive work your people already dislike: that's usually where automation pays off first.",
    category: "AI & automation",
    publishedAt: "2026-10-21T09:00:00Z",
    cover: { url: "/blog/where-ai-automation-fits-in-everyday-operations.jpg", alt: "Connected nodes in the Opsiogen gradient on a dark background" },
    demo: true,
    body: [
      ["p", "Automation works best on tasks that repeat, follow clear rules and move information from one place to another."],
      ["h2", "Find the repeat work"],
      ["p", "Ask each team which tasks they do the same way every week. Copying data between systems, sorting enquiries and preparing routine reports are common candidates."],
      ["h2", "Keep a person in the loop"],
      ["ol", ["Let automation prepare the work", "Let a person check and approve it", "Automate the approval only once it is reliably right"]],
      ["h2", "Measure the time saved"],
      ["p", "Track how long the task took before and after. It shows where to automate next."],
    ],
  },
  {
    title: "Planning a month of social content in one sitting",
    slug: "planning-a-month-of-social-content-in-one-sitting",
    excerpt: "A simple planning routine that keeps posts regular, on brand and tied to what the business is doing.",
    category: "Marketing",
    publishedAt: "2026-10-14T09:00:00Z",
    cover: { url: "/blog/planning-a-month-of-social-content-in-one-sitting.jpg", alt: "A grid of squares in the Opsiogen gradient, like a content calendar" },
    demo: true,
    body: [
      ["p", "Posting regularly is easier with a plan made once a month than with ideas found each morning."],
      ["h2", "Start from the business calendar"],
      ["p", "List launches, events and offers for the month first. They become the anchor posts; everything else supports them."],
      ["h2", "Mix a few content types"],
      ["ul", ["Work you are proud of", "Answers to common customer questions", "Behind the scenes", "News and launches"]],
      ["h2", "Write captions in batches"],
      ["p", "Drafting all captions in one session keeps the voice consistent and leaves time for review."],
    ],
  },
  {
    title: "Keeping a brand consistent across every channel",
    slug: "keeping-a-brand-consistent-across-every-channel",
    excerpt: "Why a small set of shared rules and ready-made templates keeps a growing brand looking like itself.",
    category: "Brand & creative",
    publishedAt: "2026-10-07T09:00:00Z",
    cover: { url: "/blog/keeping-a-brand-consistent-across-every-channel.jpg", alt: "Concentric rings in the Opsiogen gradient on a dark background" },
    demo: true,
    body: [
      ["p", "As more people create content, a brand drifts unless the rules are easy to follow."],
      ["h2", "Write down the few rules that matter"],
      ["p", "Logo use, colours, type and tone of voice cover most decisions. Keep them short enough to read in a few minutes."],
      ["h2", "Give people templates"],
      ["p", "Templates for social posts, presentations and documents make the right choice the easy one."],
      ["h2", "Review regularly"],
      ["p", "Look at recent work together every few months and update the rules where people struggled."],
    ],
  },
];

const key = (i: number) => `b${i}`;
const span = (text: string, i: number) => ({ _type: "span", _key: `s${i}`, text, marks: [] as string[] });

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
          markDefs: [],
          children: [span(item, 0)],
        } as PortableTextBlock),
      );
    } else if (type === "img") {
      out.push({ _type: "image", _key: key(i), ...value, caption: value.caption ?? null });
    } else {
      const style = type === "p" ? "normal" : type === "quote" ? "blockquote" : type;
      out.push({ _type: "block", _key: key(i), style, markDefs: [], children: [span(value, 0)] } as PortableTextBlock);
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
