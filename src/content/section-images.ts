import type { Img } from "@/lib/types";

/**
 * Photos for sections whose content is text only: the call to action cards and
 * the About page lists. They live in /public and are matched to items by
 * position. Set an entry to [] to show that section without photos again.
 */
const photo = (url: string, alt: string): Img => ({ url, width: 1600, height: 1200, alt });

/** The call to action banner: its subject sits on the right, text goes on the left. */
export const CTA_IMAGES: Img[] = [
  {
    url: "/cta/cta-banner-2.jpg",
    width: 2400,
    height: 1350,
    alt: "",
    hotspot: { x: 0.72, y: 0.4 },
  },
];

/** Promise list photos by section key, in item order. */
export const LIST_IMAGES: Record<string, Img[]> = {
  promises: [
    photo("/about/promise-1.jpg", "A laptop, a tablet and a phone standing together on green velvet"),
    photo("/about/promise-2.jpg", "A brass hourglass with sand running, on a rust backdrop"),
    photo("/about/promise-3.jpg", "Blank paper price tags on a small brass stand, on a blue backdrop"),
    photo("/about/promise-4.jpg", "A brass key on a leather fob, on plum velvet"),
  ],
  serve: [
    photo("/about/serve-1.jpg", "A brass counter bell on a teal backdrop"),
    photo("/about/serve-2.jpg", "A paper aeroplane about to take off, on a mustard backdrop"),
    photo("/about/serve-3.jpg", "A young plant in a blue pot, on a sky blue backdrop"),
    photo("/about/serve-4.jpg", "A brass door plate beside a brush with fresh paint, on a burgundy backdrop"),
  ],
};

/** A text section shown as a big card with a photo, by section key (About us on the About page). */
export const CARD_IMAGES: Record<string, Img> = {
  about: { url: "/about/studio.jpg", width: 1600, height: 1600, alt: "A studio lounge with a green sofa, a laptop and coffee on the table" },
};

/**
 * Phone versions of work cards whose mockup is wider than a phone card shows
 * (public/cards/<slug>-phone.jpg, 1200 x 1542). Projects not listed use the
 * wide card on every screen.
 */
export const CARD_PHONE: Record<string, { url: string; width: number; height: number }> = Object.fromEntries(
  ["norsecom", "rxlive", "afthab-tours", "meetingful", "bigtapp", "cabot-solutions"].map((slug) => [
    slug,
    { url: `/cards/${slug}-phone.jpg`, width: 1200, height: 1542 },
  ]),
);
