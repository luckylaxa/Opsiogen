import { defineArrayMember, defineField } from "sanity";
import { accent } from "../sections";
import { imageField } from "./shared";

/**
 * Sections of the full service page (big text, big cards). A service with a
 * Hero image uses this layout; the others keep the simpler one.
 *
 * Fields marked `hidden` belong to an earlier version of this page. They stay
 * in the model so content saved with them doesn't show as unknown fields, but
 * they are no longer shown on the site or in Studio.
 */

const GROUP = "page";
const label = defineField({ name: "label", title: "Small label", type: "string" });
const retired = (name: string, type = "string") => defineField({ name, type, hidden: true });

export const servicePageFields = [
  defineField({
    name: "hero",
    title: "Hero",
    type: "object",
    group: GROUP,
    description: "Add the image to switch this service to the full page layout.",
    options: { collapsible: true, collapsed: false },
    fields: [
      imageField("image", "Image in the dark frame (transparent PNG works best)"),
      retired("heading"),
      retired("accent"),
      retired("text", "text"),
    ],
  }),
  defineField({
    name: "clientsLabel",
    title: "Clients line",
    type: "string",
    group: GROUP,
    description: "Shown above the client names, e.g. “Websites we’ve built for”.",
  }),
  defineField({
    name: "why",
    title: "Why it matters",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    fields: [
      label,
      defineField({ name: "heading", title: "Statement", type: "string", description: "One or two short sentences, shown large." }),
      accent,
      retired("lead", "text"),
      retired("text", "text"),
      defineField({ name: "image", type: "image", hidden: true }),
    ],
  }),
  defineField({
    name: "stats",
    title: "Numbers",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "Up to three real, checkable numbers, each on a big card.",
    fields: [
      label,
      defineField({
        name: "items",
        type: "array",
        validation: (rule) => rule.max(3),
        of: [
          defineArrayMember({
            type: "object",
            name: "stat",
            fields: [
              defineField({ name: "value", type: "string", validation: (rule) => rule.required().max(10) }),
              defineField({ name: "label", type: "string", validation: (rule) => rule.required().max(60) }),
            ],
            preview: { select: { title: "value", subtitle: "label" } },
          }),
        ],
      }),
      retired("heading"),
      retired("accent"),
    ],
  }),
  defineField({
    name: "offer",
    title: "What we do (heading)",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "The big cards come from What we do; give each a 4:3 card image.",
    fields: [label, defineField({ name: "heading", type: "string" }), accent, retired("text", "text")],
  }),
  defineField({
    name: "steps",
    title: "Process",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "Leave empty to use How we work from the Services page.",
    fields: [
      label,
      defineField({ name: "heading", type: "string" }),
      accent,
      defineField({
        name: "items",
        type: "array",
        of: [
          defineArrayMember({
            type: "object",
            name: "processStep",
            fields: [
              defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
              defineField({ name: "text", type: "text", rows: 2 }),
            ],
            preview: { select: { title: "title", subtitle: "text" } },
          }),
        ],
      }),
      retired("text", "text"),
    ],
  }),
  defineField({
    name: "related",
    title: "Work (heading)",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    fields: [label, defineField({ name: "heading", type: "string" }), accent],
  }),
  // Earlier sections, no longer shown.
  defineField({ name: "feature", type: "object", hidden: true, fields: [retired("heading")], options: { collapsible: true } }),
  defineField({ name: "uses", type: "object", hidden: true, fields: [retired("heading")], options: { collapsible: true } }),
  defineField({ name: "banner", type: "object", hidden: true, fields: [retired("heading")], options: { collapsible: true } }),
];

/** Extra field on each What we do item, used by the big cards. */
export const offeringImageFields = [
  imageField("image", "Card image (4:3)"),
  defineField({ name: "wide", type: "boolean", hidden: true }),
  defineField({ name: "dark", type: "boolean", hidden: true }),
];
