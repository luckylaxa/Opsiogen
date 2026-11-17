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
    url: "/home/hero-launch.jpg",
    width: 2560,
    height: 1432,
    alt: "A green electric coupe on a show stand by the marina at night, under the brand's wall, banner and counter",
  },
  phone: { url: "/home/hero-launch-phone.jpg", width: 1000, height: 1440 },
  // The launch of a car brand we made up to show our work: it is ours, not a client.
  caption: "Vaelo is a concept brand we designed to show our work.",
  character: true,
  // Points on the brand items in the picture (left and top as a share of the wide picture).
  spots: [
    { x: 64.7, y: 15.7, title: "Logo", text: "A name and a mark people know at a glance." },
    { x: 80, y: 27, title: "Event stand", text: "The wall, the lights and the counter, all in one look.", side: "left" as const },
    { x: 92.8, y: 33, title: "Print", text: "Banners, brochures and posters, designed and ready to print.", side: "left" as const },
    { x: 32.4, y: 54.7, title: "Badge", text: "The mark made into a badge for the car itself." },
    { x: 13, y: 58, title: "Launch day", text: "Invitations, the welcome desk and every detail in the brand." },
  ],
  after: "Brand, websites and apps, print, automation, social and video. All in one place.",
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "single", heroFull: true, heroImage: HERO_IMAGE }} />;
}
