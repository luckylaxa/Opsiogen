import { CmsPage, cmsMetadata } from "@/components/CmsPage";
import { ClientLogos } from "@/components/sections/ClientLogos";

export const revalidate = 10;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

/**
 * The home hero: the big centred heading and its button on the page's own white or black, with soft pools
 * of colour behind it and our character beside it. A press on the character sends out a new colour.
 */
export default function HomePage() {
  return (
    <CmsPage
      slug="home"
      layout={{ services: "directory", cta: "single", heroFull: true, heroGlow: true }}
      // The brands we work with, right after the hero and the showreel (like Superside's logo row).
      after={<ClientLogos className="mt-after-band" />}
    />
  );
}
