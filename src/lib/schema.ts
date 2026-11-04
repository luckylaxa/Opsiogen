import type { Faq, PostCard, Project, Service, SiteSettings } from "./types";
import { isExternal, siteUrl } from "./utils";

/**
 * schema.org structured data (JSON-LD) so search engines read who we are,
 * where a page sits in the site, and the answers on service pages.
 */

type Thing = Record<string, unknown>;

const abs = (path: string) => (isExternal(path) ? path : `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`);

/** Opsiogen as an organisation, and the site itself, shown on every page. */
export function siteSchema(settings: SiteSettings): Thing[] {
  const url = siteUrl();
  // Only real profile links: a bare https://www.linkedin.com/ is a placeholder.
  const sameAs = settings.socialLinks
    .map((l) => l.href)
    .filter((href) => isExternal(href) && new URL(href).pathname.replace(/\/$/, "") !== "");
  const organization: Thing = {
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: settings.siteTitle,
    url,
    description: settings.seo.description,
    ...(settings.logo?.url && { logo: settings.logo.url }),
    ...(settings.email && { email: settings.email }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.location && { address: settings.location }),
    ...(sameAs.length && { sameAs }),
  };
  const website: Thing = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: settings.siteTitle,
    url,
    publisher: { "@id": `${url}/#organization` },
  };
  return [organization, website];
}

/** The trail from the home page to this page. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Thing {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function faqSchema(faqs: Faq[]): Thing | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceSchema(service: Service): Thing {
  return {
    "@type": "Service",
    name: service.name,
    description: `${service.tagline} ${service.description}`,
    url: abs(`/services/${service.slug}`),
    provider: { "@id": `${siteUrl()}/#organization` },
  };
}

export function projectSchema(project: Project): Thing {
  const image = project.cardImage ?? project.cover;
  return {
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    url: abs(`/work/${project.slug}`),
    ...(image?.url && { image: image.url }),
    ...(project.year && { dateCreated: project.year }),
    ...(project.client && { sourceOrganization: { "@type": "Organization", name: project.client } }),
    creator: { "@id": `${siteUrl()}/#organization` },
  };
}

const org = () => ({ "@id": `${siteUrl()}/#organization` });

/** The blog itself, listing its posts. */
export function blogSchema(name: string, description: string, posts: PostCard[]): Thing {
  return {
    "@type": "Blog",
    name,
    description,
    url: abs("/blog"),
    publisher: org(),
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: abs(`/blog/${p.slug}`), datePublished: p.publishedAt })),
  };
}

/** A post, with Opsiogen as author and publisher. */
export function postSchema(post: PostCard): Thing {
  return {
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: abs(`/blog/${post.slug}`),
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    image: post.cover.url.startsWith("/") ? abs(post.cover.url) : post.cover.url,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt ?? post.publishedAt,
    articleSection: post.category,
    timeRequired: `PT${post.readMinutes}M`,
    author: org(),
    publisher: org(),
  };
}
