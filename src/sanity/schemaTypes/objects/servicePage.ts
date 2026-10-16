import { defineArrayMember, defineField } from "sanity";
import { DS_ICON_NAMES } from "@/components/ui/ds-icons";
import { accent } from "../sections";
import { imageField } from "./shared";

/**
 * The sections of a service page laid out like the reference's service pages
 * (hero with image, why it matters, numbers, a feature, what we do as image
 * tiles, uses, process, banner). A service whose Hero heading is filled in
 * uses this layout; the others keep the simpler one.
 */

const GROUP = "page";
const heading = defineField({ name: "heading", type: "string", validation: (rule) => rule.required() });
const label = defineField({ name: "label", title: "Small label", type: "string" });
const text = (name = "text", title?: string, rows = 3) => defineField({ name, title, type: "text", rows });

export const servicePageFields = [
  defineField({
    name: "hero",
    title: "Hero",
    type: "object",
    group: GROUP,
    description: "Fill in the heading to switch this service to the full page layout.",
    options: { collapsible: true, collapsed: false },
    fields: [heading, accent, text("text"), { ...imageField("image", "Image (transparent PNG works best)") }],
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
    fields: [label, heading, accent, text("lead", "Lead"), text("text", "Text"), imageField("image", "Image")],
  }),
  defineField({
    name: "stats",
    title: "Numbers",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "Only real, checkable numbers.",
    fields: [
      label,
      heading,
      accent,
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
    ],
  }),
  defineField({
    name: "feature",
    title: "Feature",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    fields: [label, heading, accent, text("lead", "Lead"), text("text", "Text", 4), imageField("image", "Image")],
  }),
  defineField({
    name: "offer",
    title: "What we do (heading)",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "The tiles come from What we do; give each an image, and mark two as wide.",
    fields: [label, heading, accent, text("text")],
  }),
  defineField({
    name: "uses",
    title: "Uses",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    fields: [
      label,
      heading,
      accent,
      defineField({
        name: "items",
        type: "array",
        validation: (rule) => rule.max(4),
        of: [
          defineArrayMember({
            type: "object",
            name: "use",
            fields: [
              defineField({
                name: "icon",
                type: "string",
                options: { list: DS_ICON_NAMES.map((n) => ({ title: n, value: n })) },
                initialValue: "globe",
              }),
              defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
              defineField({ name: "text", type: "text", rows: 2 }),
            ],
            preview: { select: { title: "title", subtitle: "text" } },
          }),
        ],
      }),
    ],
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
      heading,
      accent,
      text("text"),
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
    ],
  }),
  defineField({
    name: "related",
    title: "Work (heading)",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    description: "Shows this service’s three most recent projects.",
    fields: [label, heading, accent],
  }),
  defineField({
    name: "banner",
    title: "Banner",
    type: "object",
    group: GROUP,
    options: { collapsible: true, collapsed: true },
    fields: [heading, accent, text("text"), imageField("image", "Background image")],
  }),
];

/** Extra fields on each What we do item, used by the image tiles. */
export const offeringImageFields = [
  imageField("image", "Tile image"),
  defineField({
    name: "wide",
    title: "Wide tile",
    type: "boolean",
    initialValue: false,
    description: "Wide tiles take two columns. Two per page works best.",
  }),
  defineField({
    name: "dark",
    title: "Dark image",
    type: "boolean",
    initialValue: false,
    description: "Tick when the tile image is dark, so the title shows in white.",
  }),
];
