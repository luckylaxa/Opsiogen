import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { getProjects, getServices, getSettings } from "@/lib/data";
import { buildMenuGroups, buildSearchItems } from "@/lib/search";
import { DEFAULT_THEME, PRELOADER_SCRIPT, THEME_BAR, THEME_SCRIPT } from "@/lib/theme";
import { siteUrl } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Logo } from "@/components/site/Logo";
import { Footer } from "@/components/site/Footer";
import { Dock } from "@/components/site/Dock";
import { ScrollTop } from "@/components/site/ScrollTop";
import { MenuProvider } from "@/components/site/MenuContext";
import { MenuOverlay } from "@/components/site/MenuOverlay";
import { Reveal } from "@/components/motion/Reveal";
import { Cursor } from "@/components/motion/Cursor";
import { BrandGradientDefs } from "@/components/site/SocialLinks";
import { Preloader } from "@/components/motion/Preloader";

/** Outfit, the Opsiogen typeface (SIL OFL), self-hosted as one variable file covering weights 100–900. */
const outfit = localFont({
  src: "../../fonts/Outfit-Variable.woff2",
  weight: "100 900",
  variable: "--font-outfit",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const image = settings.seo.image;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: settings.seo.title, template: `%s | ${settings.siteTitle}` },
    description: settings.seo.description,
    applicationName: settings.siteTitle,
    openGraph: {
      type: "website",
      siteName: settings.siteTitle,
      title: settings.seo.title,
      description: settings.seo.description,
      images: image ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: THEME_BAR[DEFAULT_THEME],
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, projects, services] = await Promise.all([getSettings(), getProjects(), getServices()]);
  const searchItems = buildSearchItems(projects, services);
  const groups = buildMenuGroups(services);
  return (
    // The head scripts change <html> before React hydrates, hence suppressHydrationWarning.
    <html lang="en" data-theme={DEFAULT_THEME} className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* Lets CSS hide media that fades in on scroll, only when JS runs. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* Applies the theme (dark unless the visitor chose light) before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Decides whether the first-visit preloader shows. */}
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_SCRIPT }} />
        <noscript>
          <style>{".preloader{display:none}"}</style>
        </noscript>
      </head>
      <body>
        <BrandGradientDefs />
        <Preloader />
        <MenuProvider>
          <a
            href="#main"
            className="sr-only z-[60] rounded-[var(--radius-btn)] bg-ink px-4 py-3 text-on-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Header settings={settings} groups={groups} searchItems={searchItems} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer settings={settings} services={services} />
          <Dock menu={settings.menu} button={settings.headerButton} />
          <ScrollTop />
          <MenuOverlay
            menu={settings.menu}
            button={settings.headerButton}
            wordmark={<Logo logo={settings.logoOnDark ?? settings.logo} name={settings.siteTitle} tone="dark" />}
            searchItems={searchItems}
            groups={groups}
            email={settings.email}
            socialLinks={settings.socialLinks}
          />
          <Reveal />
          <Cursor />
        </MenuProvider>
      </body>
    </html>
  );
}
