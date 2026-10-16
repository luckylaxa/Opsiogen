import { defineQuery } from "next-sanity";

const IMG = `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  alt,
  "hotspot": hotspot{x, y}
}`;

const SEO = `seo{ title, description, noIndex, "image": image${IMG} }`;

const SERVICE_REF = `{ name, "slug": slug.current, shortName, group }`;

const PROJECT_CARD = `{
  _id,
  name,
  "slug": slug.current,
  client,
  industry,
  year,
  order,
  summary,
  "services": services[]->${SERVICE_REF},
  "cover": cover${IMG},
  "coverVideo": coverVideo{ "url": asset->url, "mimeType": asset->mimeType }
}`;

export const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  siteTitle,
  "logo": logo${IMG},
  "logoOnDark": logoOnDark${IMG},
  footerLine,
  email,
  phone,
  location,
  "socialLinks": socialLinks[]{ _key, label, href },
  "menu": menu[]{ _key, label, href },
  headerButton{ label, href },
  cta{ heading, button{ label, href } },
  enquirySuccessMessage,
  seo{ title, description, "image": image${IMG} }
}`);

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  ${SEO},
  "sections": sections[]{
    ...,
    _type == "hero" => { button{ label, href } },
    _type == "projectGrid" => { link{ label, href } },
    _type == "featuredProject" => {
      "project": coalesce(
        project->${PROJECT_CARD},
        *[_id == "siteSettings"][0].featuredProject->${PROJECT_CARD}
      )
    }
  }
}`);

export const PAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current)].slug.current`,
);

export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && defined(slug.current)] | order(order asc, _createdAt desc) ${PROJECT_CARD}`,
);

export const PROJECT_QUERY = defineQuery(`*[_type == "project" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  client,
  industry,
  year,
  order,
  "services": services[]->${SERVICE_REF},
  "cover": cover${IMG},
  "coverVideo": coverVideo{ "url": asset->url, "mimeType": asset->mimeType },
  summary,
  "story": coalesce(story[]{ _key, title, text }, []),
  result,
  liveUrl,
  "gallery": gallery[]{
    _key,
    "size": coalesce(size, "full"),
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height,
    "lqip": asset->metadata.lqip,
    alt,
    "hotspot": hotspot{x, y}
  },
  ${SEO}
}`);

const SERVICE = `{
  _id,
  name,
  "slug": slug.current,
  shortName,
  group,
  order,
  tagline,
  description,
  "included": coalesce(included, []),
  note,
  statement,
  "benefits": coalesce(benefits[]{ _key, title, text }, []),
  "offerings": coalesce(offerings[]{ _key, title, text, wide, dark, "image": image${IMG} }, []),
  "faqs": coalesce(faqs[]{ _key, question, answer }, []),
  hero{ heading, accent, text, "image": image${IMG} },
  clientsLabel,
  why{ label, heading, accent, lead, text, "image": image${IMG} },
  stats{ label, heading, accent, "items": coalesce(items[]{ _key, value, label }, []) },
  feature{ label, heading, accent, lead, text, "image": image${IMG} },
  offer{ label, heading, accent, text },
  uses{ label, heading, accent, "items": coalesce(items[]{ _key, icon, title, text }, []) },
  steps{ label, heading, accent, text, "items": coalesce(items[]{ _key, title, text }, []) },
  related{ label, heading, accent },
  banner{ heading, accent, text, "image": image${IMG} },
  ${SEO}
}`;

export const SERVICES_QUERY = defineQuery(
  `*[_type == "service" && defined(slug.current)] | order(order asc) ${SERVICE}`,
);

export const SITEMAP_QUERY = defineQuery(`{
  "pages": *[_type == "page" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt },
  "projects": *[_type == "project" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt },
  "services": *[_type == "service" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt }
}`);
