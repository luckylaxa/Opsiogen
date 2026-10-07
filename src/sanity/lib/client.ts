import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

let readClient: SanityClient | null = null;

/** Read-only client for published content. Null until a project ID is set. */
export function getClient(): SanityClient | null {
  if (!isSanityConfigured) return null;
  readClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
  });
  return readClient;
}
