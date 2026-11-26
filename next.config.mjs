// Plain JavaScript (not next.config.ts) so starting the site never has to compile it: Hostinger only starts the site,
// built on GitHub (.github/workflows/hostinger.yml), and its servers can't run Next.js's compiler.

/**
 * The live host, plus its www / non-www twin. Hosts that run the app behind a
 * reverse proxy (e.g. Hostinger) may not forward the public host, which would
 * make Next.js reject the contact form's server action as cross-origin.
 * @returns {string[]}
 */
function siteHosts() {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").host;
    if (!host) return [];
    return [host, host.startsWith("www.") ? host.slice(4) : `www.${host}`];
  } catch {
    return [];
  }
}

/** The old agency domain and its subdomains, sent on to the home page (see `redirects` below; 26 Nov 2026). */
const OLD_HOSTS = ["fineartdesign.agency", "www.fineartdesign.agency", "healthcare.fineartdesign.agency"];

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

/** @type {import("next").NextConfig} */
const nextConfig = {
  // Hostinger runs Next.js sites as the self-contained server Next.js builds with `output: "standalone"`
  // (.next/standalone/server.js). The Hostinger workflow turns it on; Vercel and the Quality check build as before.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
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
  // (and search engines) on to the live host, keeping the path. The old agency domain also points
  // at this server (a parked domain on Hostinger): every page on it goes to our home page for good.
  async redirects() {
    const [host, twin] = siteHosts();
    if (!host || !twin) return [];
    return [
      ...OLD_HOSTS.map((value) => ({
        source: "/:path*",
        has: [{ type: "host", value }],
        destination: `https://${host}/`,
        statusCode: 301,
      })),
      { source: "/:path*", has: [{ type: "host", value: twin }], destination: `https://${host}/:path*`, permanent: true },
    ];
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
