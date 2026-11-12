import { defineArrayMember, defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ComposeIcon } from "@sanity/icons/Compose";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { altField, imageField } from "../objects/shared";
import { offeringImageFields, servicePageFields } from "../objects/servicePage";
import { POST_CATEGORIES } from "../../../lib/types";

const RESERVED_PAGE_SLUGS = ["studio", "api", "blog", "work", "services"];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "navigation", title: "Header & footer" },
    { name: "contact", title: "Contact" },
    { name: "cta", title: "Call to action" },
    { name: "home", title: "Home" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      type: "string",
      group: "brand",
      initialValue: "Opsiogen",
      validation: (rule) => rule.required(),
    }),
    { ...imageField("logo", "Logo (for light backgrounds)"), group: "brand", description: "SVG works best. Leave empty to show the name as text." },
    { ...imageField("logoOnDark", "Logo (for dark backgrounds)"), group: "brand" },
    defineField({
      name: "footerLine",
      type: "string",
      group: "navigation",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "menu",
      title: "Menu links",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "link" })],
      description: "Shown in the header, the floating menu and the footer.",
    }),
    defineField({
      name: "headerButton",
      title: "Header button",
      type: "link",
      group: "navigation",
    }),
    defineField({
      name: "dockButton",
      title: "Floating bar button",
      type: "link",
      group: "navigation",
      description: "Use a different label from the header button, e.g. Let’s talk.",
    }),
    defineField({
      name: "socialLinks",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({ name: "email", type: "string", group: "contact", validation: (rule) => rule.email() }),
    defineField({ name: "phone", type: "string", group: "contact" }),
    defineField({ name: "location", type: "string", group: "contact" }),
    defineField({
      name: "enquirySuccessMessage",
      title: "Message after the contact form is sent",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "cta",
      title: "Call to action",
      type: "object",
      group: "cta",
      description: "Shared by every page.",
      fields: [
        defineField({ name: "heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "button", type: "link" }),
      ],
    }),
    defineField({
      name: "featuredProject",
      title: "Featured project on Home",
      type: "reference",
      group: "home",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "seo",
      title: "Default SEO",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "title", type: "string" }),
        defineField({ name: "description", type: "text", rows: 3 }),
        defineField({
          name: "image",
          title: "Default share image",
          type: "image",
          options: { hotspot: true },
          fields: [altField],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  icon: SparklesIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "page", title: "Page sections" },
    { name: "seo", title: "SEO" },
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "group",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Build", value: "build" },
          { title: "Grow", value: "grow" },
          { title: "Create", value: "create" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortName",
      title: "Short filter name",
      type: "string",
      group: "content",
      description: "Used on the Work page filters and project cards, e.g. Websites.",
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description: "Lower numbers show first.",
      validation: (rule) => rule.required().integer(),
    }),
    defineField({ name: "tagline", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({ name: "description", type: "text", rows: 4, group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "included",
      title: "What’s included",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "note",
      type: "string",
      group: "content",
      description: "Optional short note shown on the service page.",
    }),
    defineField({
      name: "statement",
      title: "Why it matters",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two sentences on the problem this service solves, shown large on the service page.",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: "benefits",
      title: "Benefits",
      type: "array",
      group: "content",
      description: "Up to four short benefits, shown as cards under “Why it matters”.",
      of: [
        defineArrayMember({
          type: "object",
          name: "benefit",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required().max(32) }),
            defineField({ name: "text", type: "text", rows: 2, validation: (rule) => rule.max(140) }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "offerings",
      title: "What we do",
      type: "array",
      group: "content",
      description: "Shown as a numbered list on the service page. Leave empty to show “What’s included” instead.",
      of: [
        defineArrayMember({
          type: "object",
          name: "offering",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "text", type: "text", rows: 2, validation: (rule) => rule.max(160) }),
            ...offeringImageFields,
          ],
          preview: { select: { title: "title", subtitle: "text", media: "image" } },
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      group: "content",
      description: "Common questions about this service, shown near the end of its page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "question", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "answer", type: "text", rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
    ...servicePageFields,
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline", group: "group" },
    prepare: ({ title, subtitle, group }) => ({
      title,
      subtitle: [group && group[0].toUpperCase() + group.slice(1), subtitle].filter(Boolean).join(" · "),
    }),
  },
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "client", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({ name: "industry", type: "string", group: "content" }),
    defineField({ name: "location", type: "string", group: "content", description: "Where the client is, e.g. Canada." }),
    defineField({ name: "year", type: "string", group: "content", validation: (rule) => rule.regex(/^\d{4}$/, { name: "year" }) }),
    defineField({
      name: "services",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "service" }] })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      group: "content",
      description: "Two or three lines on what we did.",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "tagline",
      type: "string",
      group: "content",
      description: "One short line under the project name, e.g. Healthcare analytics, made clear.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "stats",
      title: "Results (optional)",
      type: "array",
      group: "content",
      description: "Up to four real results, e.g. 75% / Efficiency boost. Shown as big numbers.",
      of: [
        defineArrayMember({
          type: "object",
          name: "projectStat",
          fields: [
            defineField({ name: "value", type: "string", validation: (rule) => rule.required().max(8) }),
            defineField({ name: "label", type: "string", validation: (rule) => rule.required().max(48) }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "result",
      title: "Single result (optional)",
      type: "object",
      group: "content",
      description: "Shown only when Results is empty. Only add a real result, e.g. 3× / more enquiries.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "number", type: "string" }),
        defineField({ name: "label", type: "string" }),
      ],
    }),
    defineField({
      name: "story",
      title: "Story (optional)",
      type: "array",
      group: "content",
      description: "A few lines each, such as The challenge or What we did. Shown from tablets up between gallery images that have a phone version, one block after every four or five.",
      of: [
        defineArrayMember({
          type: "object",
          name: "storyBlock",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "text", type: "text", rows: 3, validation: (rule) => rule.required().max(400) }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
    }),
    defineField({ name: "liveUrl", title: "Live site link (optional)", type: "url", group: "content" }),
    defineField({
      name: "order",
      type: "number",
      group: "content",
      description: "Lower numbers show first on Home and Work.",
      validation: (rule) => rule.required().integer(),
    }),
    { ...imageField("cover", "Cover image", true), group: "media", description: "Used on the project page and as the video poster. 4:3 or wider." },
    {
      ...imageField("cardImage", "Card image"),
      group: "media",
      description:
        "A mockup of the work (devices, print, packaging) that fills the big project card. 4:3, 1600 × 1200; keep the lower third quiet, the title sits there. Uses the cover when empty.",
    },
    defineField({
      name: "coverVideo",
      title: "Cover video (optional)",
      type: "file",
      group: "media",
      options: { accept: "video/mp4,video/webm" },
      description: "Short MP4 loop, no sound, under 10 MB. Plays muted on the project and on card hover.",
    }),
    defineField({
      name: "flow",
      title: "Screen-flow video (optional)",
      type: "object",
      group: "media",
      description: "A short muted loop shown right after the first image: 16:10 MP4 (1600 × 1000) for wider screens and a square one for phones, each under 5 MB.",
      fields: [
        defineField({ name: "video", title: "Video, 16:10 (MP4)", type: "file", options: { accept: "video/mp4" } }),
        defineField({ name: "videoWebm", title: "Video, 16:10 (WebM, optional)", type: "file", options: { accept: "video/webm" } }),
        defineField({ name: "phone", title: "Phone video, square (MP4)", type: "file", options: { accept: "video/mp4" } }),
        defineField({ name: "phoneWebm", title: "Phone video, square (WebM, optional)", type: "file", options: { accept: "video/webm" } }),
        defineField({ name: "poster", title: "Poster, 16:10", type: "image" }),
        defineField({ name: "posterPhone", title: "Phone poster, square", type: "image" }),
      ],
    }),
    defineField({
      name: "gallery",
      type: "array",
      group: "media",
      description:
        "The work, as big mockup cards. Six to ten images. The first shows under the name, 16:9 on wider screens and square on phones: use a tall or square photo and set its hotspot on the work so both crops keep it, or set it to Full width, uncropped to show the whole image at its own proportions. The rest: set to Half, two per row at their own proportions; give both images in a row the same size, such as squares (1400 × 1400).",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            altField,
            defineField({ name: "caption", type: "string", description: "Optional, shown under the image.", validation: (rule) => rule.max(80) }),
            defineField({
              name: "size",
              type: "string",
              options: {
                list: [
                  { title: "Full width", value: "full" },
                  { title: "Half (side by side)", value: "half" },
                  { title: "Full width, uncropped", value: "original" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "full",
            }),
            defineField({
              name: "phone",
              title: "On phones",
              type: "image",
              description: "Optional, for the first image: a square version shown on phones instead.",
            }),
          ],
        }),
      ],
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "name", client: "client", year: "year", media: "cover" },
    prepare: ({ title, client, year, media }) => ({
      title,
      subtitle: [client, year].filter(Boolean).join(" · "),
      media,
    }),
  },
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      description: "The page address. Use “home” for the home page.",
      options: { source: "title", maxLength: 64 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          const value = slug?.current;
          if (!value) return "Required";
          if (!/^[a-z0-9-]+$/.test(value)) return "Use lowercase letters, numbers and hyphens";
          if (RESERVED_PAGE_SLUGS.includes(value)) return "This address is reserved";
          return true;
        }),
    }),
    defineField({
      name: "sections",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({ type: "hero" }),
        defineArrayMember({ type: "featuredProject" }),
        defineArrayMember({ type: "projectGrid" }),
        defineArrayMember({ type: "showreel" }),
        defineArrayMember({ type: "servicesList" }),
        defineArrayMember({ type: "shortText" }),
        defineArrayMember({ type: "promiseList" }),
        defineArrayMember({ type: "process" }),
        defineArrayMember({ type: "comparison" }),
        defineArrayMember({ type: "callToAction" }),
      ],
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({ title, subtitle: slug === "home" ? "/" : `/${slug ?? ""}` }),
  },
});

export const enquiry = defineType({
  name: "enquiry",
  title: "Enquiry",
  type: "document",
  icon: EnvelopeIcon,
  readOnly: true,
  orderings: [
    { title: "Newest first", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] },
  ],
  fields: [
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "phone", type: "string", readOnly: true }),
    defineField({ name: "company", type: "string", readOnly: true }),
    defineField({
      name: "needs",
      title: "What do they need?",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      readOnly: true,
    }),
    defineField({ name: "message", type: "text", rows: 6, readOnly: true }),
    defineField({ name: "source", title: "How did they hear about us?", type: "string", readOnly: true }),
    defineField({ name: "submittedAt", type: "datetime", readOnly: true }),
  ],
  preview: {
    select: { name: "name", company: "company", date: "submittedAt" },
    prepare: ({ name, company, date }) => ({
      title: [name, company].filter(Boolean).join(" · ") || "Enquiry",
      subtitle: date ? new Date(date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "",
      media: EnvelopeIcon,
    }),
  },
});

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: ComposeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  orderings: [{ title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      description: "Clear and specific. Up to about 60 characters reads best in search results.",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) => (slug?.current === "preview" ? "This address is reserved" : true)),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two sentences shown on the blog page and in search results (50 to 160 characters).",
      validation: (rule) => rule.required().min(50).max(200),
    }),
    defineField({
      name: "category",
      type: "string",
      group: "content",
      options: { list: [...POST_CATEGORIES], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published on",
      type: "datetime",
      group: "content",
      description: "Posts show newest first. A post without a date is not shown.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    { ...imageField("cover", "Cover image", true), group: "content", description: "16:10, at least 1600 × 1000." },
    defineField({
      name: "body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Subheading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullets", value: "bullet" },
            { title: "Numbers", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              defineArrayMember({
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    type: "string",
                    description: "A page on this site (/contact) or another site (https://…)",
                    validation: (rule) => rule.required(),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [altField, defineField({ name: "caption", type: "string" })],
        }),
      ],
      description: "Headings make the contents list beside the post.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "demo",
      title: "Demo post",
      type: "boolean",
      group: "content",
      initialValue: false,
      description: "Shown only on /blog/preview to see the layout, never to visitors or search engines.",
    }),
    defineField({ name: "seo", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", category: "category", date: "publishedAt", demo: "demo", media: "cover" },
    prepare: ({ title, category, date, demo, media }) => ({
      title,
      subtitle: [demo ? "Demo" : null, category, date ? new Date(date).toLocaleDateString("en-GB", { dateStyle: "medium" }) : null]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});

export const documentTypes = [siteSettings, page, project, service, post, enquiry];
