import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 10;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

/**
 * The home hero: an empty coast road at sunrise (made with AI). Our character flies off down the road
 * as the visitor scrolls, and turns to look at the visitor when the pointer moves.
 */
const HERO_IMAGE = {
  image: {
    url: "/home/hero-brand.jpg",
    width: 2560,
    height: 1440,
    alt: "A newly branded café terrace on a sunny seaside promenade",
  },
  phone: { url: "/home/hero-brand-phone.jpg", width: 1000, height: 1440 },
  character: true,
  after: "Brand, websites and apps, print, automation, social and video. All in one place.",
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "single", heroFull: true, heroImage: HERO_IMAGE }} />;
}
