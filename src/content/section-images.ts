import type { Img } from "@/lib/types";

/**
 * Photos for sections whose content is text only: the call to action cards and
 * the About page lists. They live in /public and are matched to items by
 * position. Set an entry to [] to show that section without photos again.
 */
const photo = (url: string, alt: string): Img => ({ url, width: 1600, height: 1200, alt });

/**
 * The call to action banners (0: main pages, 1: service and case study pages): the text goes on the left. Company
 * pictures, not people: the founders' photos made the site read like a personal portfolio (owner's partner, 21 Nov).
 * Both show our studio by the lake with our mark lit up inside.
 */
const STUDIO: Img = { url: "/home/hero.jpg", width: 2560, height: 1440, alt: "", hotspot: { x: 0.62, y: 0.5 } };
export const CTA_IMAGES: Img[] = [STUDIO, STUDIO];

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

/**
 * A photo card that can name its person: the name, designation and LinkedIn link show over the photo's foot,
 * on hover where the screen has a mouse, always on touch screens.
 */
export type CardPhoto = Img & { name?: string; role?: string; linkedin?: string };

/**
 * A text section shown as cards: its photos side by side, then the text (About us on the About page).
 * The About photos are half-body crops of the two call to action photos, with the heads the same size.
 */
export const CARD_IMAGES: Record<string, CardPhoto[]> = {
  // One photo of our office (the owner's, 21 Nov): the founders' photos made the site read like a personal portfolio.
  about: [
    {
      url: "/about/office-reception.jpg",
      width: 1536,
      height: 1024,
      alt: "Our office reception: a yellow wall, a wooden desk and plants",
      hotspot: { x: 0.45, y: 0.5 },
    },
  ],
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
