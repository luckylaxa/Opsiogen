import { defineArrayMember, defineField, defineType } from "sanity";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BoltIcon } from "@sanity/icons/Bolt";
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
  callToActionSection,
];
