export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

/** False until a Sanity project ID is set; the site then serves the starter content. */
export const isSanityConfigured = projectId.length > 0;

/** Seconds before published CMS changes show on the live site. */
export const REVALIDATE_SECONDS = 60;
