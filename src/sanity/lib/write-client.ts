import "server-only";
import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

let writeClient: SanityClient | null = null;

/** Server-only client with write access, used to save enquiries. */
export function getWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!isSanityConfigured || !token) return null;
  writeClient ??= createClient({ projectId, dataset, apiVersion, token, useCdn: false });
  return writeClient;
}
