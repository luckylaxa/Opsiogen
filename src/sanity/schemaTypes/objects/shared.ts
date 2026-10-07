import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons/Link";
import { SearchIcon } from "@sanity/icons/Search";

/** Alt text field. Every image on the site requires one. */
export const altField = defineField({
  name: "alt",
  title: "Alt text",
  type: "string",
  description: "Describe the image for people using screen readers.",
  validation: (rule) => rule.required().error("Alt text is required"),
});

/** An image with hotspot and required alt text. */
export function imageField(name: string, title: string, required = false) {
  return defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [altField],
    validation: required ? (rule) => rule.required() : undefined,
  });
}

function isValidHref(value: string | undefined) {
  if (!value) return "Required";
  if (/^(\/|https?:\/\/|mailto:|tel:|#)/.test(value)) return true;
  return "Start with / for a page on this site, or https:// for another site";
}

export const linkType = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link to",
      type: "string",
      description: "e.g. /contact or https://example.com",
      validation: (rule) => rule.custom(isValidHref),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "Shown in search results and browser tabs. Leave empty to use the name.",
      validation: (rule) => rule.max(70).warning("Keep it under 70 characters"),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(170).warning("Keep it under 170 characters"),
    }),
    defineField({
      name: "image",
      title: "Share image",
      type: "image",
      description: "Shown when the page is shared. 1200 × 630 works best.",
      options: { hotspot: true },
      fields: [altField],
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
