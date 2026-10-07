import { defineArrayMember, defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentIcon } from "@sanity/icons/Document";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { altField, imageField } from "../objects/shared";

const RESERVED_PAGE_SLUGS = ["studio", "api"];

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
      name: "result",
      title: "Result (optional)",
      type: "object",
      group: "content",
      description: "Only add a real result, e.g. 3× / more enquiries.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "number", type: "string" }),
        defineField({ name: "label", type: "string" }),
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
    { ...imageField("cover", "Cover image", true), group: "media", description: "Used on cards and as the video poster. 4:3 or wider." },
    defineField({
      name: "coverVideo",
      title: "Cover video (optional)",
      type: "file",
      group: "media",
      options: { accept: "video/mp4,video/webm" },
      description: "Short MP4 loop, no sound, under 10 MB. Plays muted on the project and on card hover.",
    }),
    defineField({
      name: "gallery",
      type: "array",
      group: "media",
      description: "Four to eight images. Full width or side by side.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            altField,
            defineField({
              name: "size",
              type: "string",
              options: {
                list: [
                  { title: "Full width", value: "full" },
                  { title: "Half (side by side)", value: "half" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "full",
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
        defineArrayMember({ type: "servicesList" }),
        defineArrayMember({ type: "shortText" }),
        defineArrayMember({ type: "promiseList" }),
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

export const documentTypes = [siteSettings, page, project, service, enquiry];
