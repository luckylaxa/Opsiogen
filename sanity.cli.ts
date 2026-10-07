import nextEnv from "@next/env";
import { defineCliConfig } from "sanity/cli";

// Read .env.local so `npx sanity …` uses the same project as the website.
nextEnv.loadEnvConfig(process.cwd());

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
