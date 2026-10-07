import type { NextConfig } from "next";

/**
 * The live host, plus its www / non-www twin. Hosts that run the app behind a
 * reverse proxy (e.g. Hostinger) may not forward the public host, which would
 * make Next.js reject the contact form's server action as cross-origin.
 */
function siteHosts(): string[] {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").host;
    if (!host) return [];
    return [host, host.startsWith("www.") ? host.slice(4) : `www.${host}`];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: siteHosts() },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/placeholders/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
