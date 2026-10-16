import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../objects/shared";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BoltIcon } from "@sanity/icons/Bolt";
import { OlistIcon } from "@sanity/icons/Olist";
import { PlayIcon } from "@sanity/icons/Play";
import { SplitHorizontalIcon } from "@sanity/icons/SplitHorizontal";
import { CaseIcon } from "@sanity/icons/Case";
import { RocketIcon } from "@sanity/icons/Rocket";
import { StarIcon } from "@sanity/icons/Star";
import { TextIcon } from "@sanity/icons/Text";
import { ThListIcon } from "@sanity/icons/ThList";

const label = defineField({
  name: "label",
  title: "Small label",
  type: "string",
  description: "Optional short label shown above the heading.",
});

/** The heading word shown in the brand gradient (the design system's accent word). */
export const accent = defineField({
  name: "accent",
  title: "Word in colour",
  type: "string",
  description:
    "One word (or two) from the heading to show in the brand gradient, e.g. “hiring”. Leave empty to colour the last word.",
  validation: (rule) =>
    rule.custom((value, context) => {
      if (!value) return true;
      const heading = (context.parent as { heading?: string } | undefined)?.heading ?? "";
      const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
      return ` ${norm(heading)} `.includes(` ${norm(value)} `) || "Use a word that appears in the heading.";
    }),
});

export const heroSection = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: RocketIcon,
  fields: [
    label,
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    accent,
    defineField({ name: "text", type: "text", rows: 3 }),
    defineField({ name: "button", type: "link" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Hero", subtitle: "Hero" }),
  },
});

export const featuredProjectSection = defineType({
  name: "featuredProject",
  title: "Featured project",
  type: "object",
  icon: StarIcon,
  fields: [
    defineField({
      name: "project",
      type: "reference",
      to: [{ type: "project" }],
      description:
        "Leave empty to use the featured project chosen in Site settings.",
    }),
  ],
  preview: {
    select: { title: "project.name", media: "project.cover" },
    prepare: ({ title, media }) => ({
      title: title || "From Site settings",
      subtitle: "Featured project",
      media: media ?? StarIcon,
    }),
  },
});

export const projectGridSection = defineType({
  name: "projectGrid",
  title: "Project grid",
  type: "object",
  icon: CaseIcon,
  fields: [
    label,
    defineField({ name: "heading", type: "string" }),
    accent,
    defineField({ name: "text", type: "text", rows: 2 }),
    defineField({
      name: "limit",
      title: "Projects to show",
      type: "number",
      description: "How many projects show before the Load more button.",
      initialValue: 6,
      validation: (rule) => rule.min(1).max(48).integer(),
    }),
    defineField({
      name: "showFilters",
      title: "Show service filters and Load more",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "link", title: "Link below the grid", type: "link" }),
  ],
  preview: {
    select: { heading: "heading", limit: "limit", filters: "showFilters" },
    prepare: ({ heading, limit, filters }) => ({
      title: heading || "Project grid",
      subtitle: `Project grid · ${limit ?? 6} projects${filters ? " · filters" : ""}`,
    }),
  },
});

export const servicesListSection = defineType({
  name: "servicesList",
  title: "Services list",
  type: "object",
  icon: ThListIcon,
  description: "All services, grouped into Build, Grow and Create.",
  fields: [
    label,
    defineField({ name: "heading", type: "string" }),
    accent,
    defineField({ name: "text", type: "text", rows: 2 }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Services list", subtitle: "Services list" }),
  },
});

export const shortTextSection = defineType({
  name: "shortText",
  title: "Short text",
  type: "object",
  icon: TextIcon,
  fields: [
    label,
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading", body: "body" },
    prepare: ({ title, body }) => {
      const first = Array.isArray(body)
        ? body[0]?.children?.map((c: { text?: string }) => c.text).join("")
        : "";
      return { title: title || first || "Short text", subtitle: "Short text" };
    },
  },
});

export const promiseListSection = defineType({
  name: "promiseList",
  title: "Promise list",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    label,
    defineField({ name: "heading", type: "string" }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "layout",
      type: "string",
      options: {
        list: [
          { title: "Cards", value: "cards" },
          { title: "Rows", value: "rows" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "cards",
    }),
  ],
  preview: {
    select: { label: "label", heading: "heading", items: "items" },
    prepare: ({ label, heading, items }) => ({
      title: heading || label || "Promise list",
      subtitle: `Promise list · ${Array.isArray(items) ? items.length : 0} items`,
    }),
  },
});

export const processSection = defineType({
  name: "process",
  title: "How we work",
  type: "object",
  icon: OlistIcon,
  description: "Numbered steps that open one at a time. The steps on the Services page also show on every service page.",
  fields: [
    label,
    defineField({ name: "heading", type: "string", validation: (rule) => rule.required() }),
    accent,
    defineField({
      name: "steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "text", type: "text", rows: 2, validation: (rule) => rule.required().max(240) }),
          ],
          preview: { select: { title: "title", subtitle: "text" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading", steps: "steps" },
    prepare: ({ title, steps }) => ({
      title: title || "How we work",
      subtitle: `How we work · ${Array.isArray(steps) ? steps.length : 0} steps`,
    }),
  },
});

export const comparisonSection = defineType({
  name: "comparison",
  title: "Comparison",
  type: "object",
  icon: SplitHorizontalIcon,
  description: "A table comparing Opsiogen with the alternatives. The one on the Services page also shows on every service page.",
  fields: [
    label,
    defineField({ name: "heading", type: "string", validation: (rule) => rule.required() }),
    accent,
    defineField({
      name: "columns",
      title: "Column titles",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "Opsiogen first; it is the highlighted column. Two to four columns.",
      validation: (rule) => rule.required().min(2).max(4),
    }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "comparisonRow",
          fields: [
            defineField({ name: "label", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "cells",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description: "One entry per column, in the same order.",
              validation: (rule) => rule.required().min(2).max(4),
            }),
          ],
          preview: {
            select: { title: "label", cells: "cells" },
            prepare: ({ title, cells }) => ({ title, subtitle: Array.isArray(cells) ? cells.join(" · ") : "" }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "heading", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Comparison",
      subtitle: `Comparison · ${Array.isArray(rows) ? rows.length : 0} rows`,
    }),
  },
});

export const showreelSection = defineType({
  name: "showreel",
  title: "Video card",
  type: "object",
  icon: PlayIcon,
  description: "A big video card that plays on its own, muted. On Work it sits between the title and the projects.",
  fields: [
    label,
    defineField({ name: "heading", type: "string", description: "One short line shown on the card." }),
    defineField({
      name: "video",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "MP4 loop, no sound, under 10 MB, 16:9. Phones show it 4:3, so keep words and faces in the middle.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videoWebm",
      title: "Video, WebM copy (optional)",
      type: "file",
      options: { accept: "video/webm" },
      description: "The same video as WebM, for the few browsers that can’t play MP4.",
    }),
    {
      ...imageField("poster", "Poster image", true),
      description: "Shown while the video loads, and instead of it for visitors who prefer less motion. 16:9.",
    },
  ],
  preview: {
    select: { title: "heading", media: "poster" },
    prepare: ({ title, media }) => ({ title: title || "Video card", subtitle: "Video card", media: media ?? PlayIcon }),
  },
});

export const callToActionSection = defineType({
  name: "callToAction",
  title: "Call to action",
  type: "object",
  icon: BoltIcon,
  fields: [
    defineField({
      name: "shared",
      title: "Uses the shared call to action",
      type: "boolean",
      readOnly: true,
      initialValue: true,
      description: "Edit the heading and button once in Site settings → Call to action.",
    }),
  ],
  preview: { prepare: () => ({ title: "Call to action", subtitle: "Shared block from Site settings" }) },
});

export const sectionTypes = [
  heroSection,
  featuredProjectSection,
  projectGridSection,
  servicesListSection,
  shortTextSection,
  promiseListSection,
  processSection,
  comparisonSection,
  showreelSection,
  callToActionSection,
];
