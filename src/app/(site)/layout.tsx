import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "../globals.css";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Dock } from "@/components/site/Dock";
import { ScrollTop } from "@/components/site/ScrollTop";
import { MenuProvider } from "@/components/site/MenuContext";
import { MenuOverlay } from "@/components/site/MenuOverlay";
import { Reveal } from "@/components/motion/Reveal";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
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
  themeColor: "#e9e9e9",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const mark = `${settings.siteTitle.charAt(0)}.`;
  return (
    <html lang="en" className={interTight.variable}>
      <head>
        {/* Lets CSS hide media that fades in on scroll, only when JS runs. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <MenuProvider>
          <a
            href="#main"
            className="sr-only z-[60] rounded-[var(--radius-btn)] bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Header settings={settings} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer settings={settings} />
          <Dock menu={settings.menu} button={settings.headerButton} mark={mark} />
          <ScrollTop />
          <MenuOverlay
            menu={settings.menu}
            button={settings.headerButton}
            wordmark={settings.siteTitle}
          />
          <Reveal />
        </MenuProvider>
      </body>
    </html>
  );
}
