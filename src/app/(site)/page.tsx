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
      // The brands we work with, right after the hero and the showreel (like Superside's logo row). A slim row, so it
      // sits close to the showreel and to the work below it: the band's own gap above, and below it the gap that
      // follows a band instead of a full section gap (19 Nov: less white space).
      after={<ClientLogos className="mt-[clamp(40px,calc(2vw+30px),72px)] -mb-[calc(var(--spacing-section)-var(--spacing-after-band))]" />}
    />
  );
}
