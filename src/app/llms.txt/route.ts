import { getPosts, getProjects, getServices, getSettings } from "@/lib/data";
import { FEATURES } from "@/lib/features";
import { siteUrl } from "@/lib/utils";

/**
 * /llms.txt: a plain guide to Opsiogen for AI assistants (the llms.txt convention: a title, a one-line summary,
 * then sections of links with a short note each). Built from the same content the site shows, so Studio edits to
 * services, case studies and posts reach it within the hour. Same copy rules as the pages: each service's own
 * text, the websites note (the 7-day timeline is for basic websites) kept with it.
 */
export const revalidate = 3600;

const line = (...parts: (string | null | undefined)[]) =>
  parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");

export async function GET() {
  const base = siteUrl();
  const [settings, services, projects, posts] = await Promise.all([
    getSettings(),
    getServices(),
    getProjects(),
    FEATURES.blog ? getPosts() : Promise.resolve([]),
  ]);
  const contact = [settings.email, settings.phone, settings.location].filter(Boolean).join(" · ");

  const text = [
    `# ${settings.siteTitle}`,
    "",
    `> ${settings.seo.description}`,
    "",
    line(
      `${settings.footerLine}`,
      "We design and build websites, products and apps, automate everyday work with AI, and create the brand, marketing, print and video that keep a business visible.",
    ),
    ...(contact ? ["", `Contact: ${contact}`] : []),
    "",
    "## Services",
    "",
    ...[...services]
      .sort((a, b) => a.order - b.order)
      .map((s) => `- [${s.name}](${base}/services/${s.slug}): ${line(s.tagline, s.description, s.note)}`),
    "",
    "## Work",
    "",
    ...projects.map((p) => {
      const about = p.summary?.trim() || `${p.services.map((s) => s.shortName).join(", ")} for ${p.client}.`;
      return `- [${p.name}](${base}/work/${p.slug}): ${line(about, p.industry ? `Industry: ${p.industry}.` : null)}`;
    }),
    ...(posts.length
      ? ["", "## Articles", "", ...posts.map((p) => `- [${p.title}](${base}/blog/${p.slug}): ${p.excerpt}`)]
      : []),
    "",
    "## Company",
    "",
    `- [About](${base}/about): who we are and how we work`,
    `- [Services](${base}/services): everything we do, in one place`,
    `- [Work](${base}/work): our case studies`,
    `- [Contact](${base}/contact): tell us about your project`,
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
