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
  // Points on the brand items in the picture (left and top as a share of the wide picture).
  spots: [
    { x: 16.4, y: 18, title: "Logo", text: "A mark made to work on a sign, a cup and a screen." },
    { x: 24.5, y: 15.5, title: "Shopfront", text: "One colour and one look across the whole place." },
    { x: 27.3, y: 35, title: "Outdoor", text: "Parasols, awnings and signs that carry the brand outside." },
    { x: 12, y: 64.6, title: "Print", text: "Menus, brochures and cards, designed and ready to print.", side: "up" as const },
    { x: 8.6, y: 68.4, title: "Packaging", text: "The same brand on every cup and bag.", side: "down" as const },
  ],
  after: "Brand, websites and apps, print, automation, social and video. All in one place.",
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "single", heroFull: true, heroImage: HERO_IMAGE }} />;
}
