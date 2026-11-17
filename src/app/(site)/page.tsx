import { CmsPage, cmsMetadata } from "@/components/CmsPage";

export const revalidate = 10;

export function generateMetadata() {
  return cmsMetadata("home", "/");
}

/** The home hero picture: an imagined studio (made with AI), not a real place. */
const HERO_IMAGE = {
  image: {
    url: "/home/hero.jpg",
    width: 2560,
    height: 1440,
    alt: "An imagined glass studio on a still lake at dusk, with a glowing rainbow ribbon ring inside",
  },
  phone: { url: "/home/hero-phone.jpg", width: 1000, height: 1440 },
  eyebrow: "Our AI studio",
  wordmark: "Opsiogen",
  scrollHint: "Scroll to explore",
  note: "This studio is virtual. We built it with AI, like the work inside.",
  secondButton: { label: "Our services", href: "/services" },
  stops: 7,
};

export default function HomePage() {
  return <CmsPage slug="home" layout={{ services: "directory", cta: "dual", heroFull: true, heroImage: HERO_IMAGE }} />;
}
