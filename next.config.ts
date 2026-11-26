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
 * camera, microphone and location stay off. Browsers are told to use only HTTPS
 * from now on (HSTS): Vercel adds that on its own, so it is sent from here
 * everywhere else (Hostinger).
 */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(process.env.VERCEL ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]),
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
  // One address for the site: the www / non-www twin of the live host sends visitors
  // (and search engines) on to the live host, keeping the path.
  async redirects() {
    const [host, twin] = siteHosts();
    if (!host || !twin) return [];
    return [{ source: "/:path*", has: [{ type: "host", value: twin }], destination: `https://${host}/:path*`, permanent: true }];
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
