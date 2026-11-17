import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 10;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

/**
 * The home hero: our character flies along a coast road at sunrise beside a car from our concept
 * launch (made with AI), and turns to look at the visitor when the pointer moves.
 */
const HERO_IMAGE = {
  image: {
    url: "/home/hero-coast.jpg",
    width: 2560,
    height: 1432,
    alt: "A dark green electric coupe on a coast road at sunrise, with our round white character flying beside it",
  },
  phone: { url: "/home/hero-coast-phone.jpg", width: 1000, height: 1440 },
  character: true,
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "single", heroFull: true, heroImage: HERO_IMAGE }} />;
}
