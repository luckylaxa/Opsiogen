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
    url: "/home/hero-quay.jpg",
    width: 2560,
    height: 1440,
    alt: "A brand launch pavilion on a marina quay at sunset: a logo wall, flags, a welcome poster on an easel and a welcome desk",
  },
  phone: { url: "/home/hero-quay-phone.jpg", width: 1000, height: 1440 },
  // Stop 01, Brand: the launch pavilion of a brand we made up to show our work. It is ours, not a client; the car comes at a later stop.
  caption: "Vaelo is a concept brand we designed to show our work.",
  character: true,
  // Points on the brand items in the picture (left and top as a share of the wide picture).
  spots: [
    { x: 77.5, y: 33, title: "Logo", text: "A name and a mark people know at a glance.", side: "left" as const },
    { x: 53.5, y: 20, title: "Flags and signs", text: "The brand outdoors, readable from across the quay." },
    { x: 92.7, y: 52, title: "Event signs", text: "Welcome boards and posters in the brand's own voice.", side: "left" as const },
    { x: 15.6, y: 57.5, title: "Stationery", text: "Cards, brochures and letterheads in the same look." },
    { x: 82.8, y: 55.4, title: "Merchandise", text: "Bags, cups and gifts that carry the brand.", side: "left" as const },
  ],
  after: "Brand, websites and apps, print, automation, social and video. All in one place.",
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "single", heroFull: true, heroImage: HERO_IMAGE }} />;
}
