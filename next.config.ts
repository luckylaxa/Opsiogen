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

/**
 * Sent with every response: other sites can't frame ours (clickjacking), browsers
 * don't guess file types, links to other sites carry only our domain, and the
 * camera, microphone and location stay off. Vercel adds HSTS on its own; the
 * Hostinger move needs it set there (LAUNCH-CHECKLIST.md).
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/covers/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
