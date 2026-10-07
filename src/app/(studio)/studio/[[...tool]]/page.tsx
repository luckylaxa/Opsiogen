import { NextStudio } from "next-sanity/studio";
import config from "../../../../../sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: 48, maxWidth: 640, lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 24 }}>Connect Sanity to use the studio</h1>
        <p>
          Add <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>SANITY_API_WRITE_TOKEN</code> to{" "}
          <code>.env.local</code>, restart the site, then run <code>npm run seed</code>. See the README.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
