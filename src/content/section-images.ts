import type { Img } from "@/lib/types";

/**
 * Photos for sections whose content is text only: the call to action cards and
 * the About page lists. They live in /public and are matched to items by
 * position. Set an entry to [] to show that section without photos again.
 */
const photo = (url: string, alt: string): Img => ({ url, width: 1600, height: 1200, alt });

/** The call to action banners (0: main pages, 1: service and case study pages): the subject sits on the right, text goes on the left. */
export const CTA_IMAGES: Img[] = [
  {
    url: "/cta/cta-banner-3.jpg",
    width: 1670,
    height: 942,
    alt: "",
    hotspot: { x: 0.74, y: 0.3 },
  },
  {
    url: "/cta/cta-banner-4.jpg",
    width: 1671,
    height: 940,
    alt: "",
    hotspot: { x: 0.77, y: 0.12 },
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

/**
 * A text section shown as cards: its photos side by side, then the text (About us on the About page).
 * The About photos are the two call to action photos, each framed on its person.
 */
export const CARD_IMAGES: Record<string, Img[]> = {
  about: [
    { ...CTA_IMAGES[0], alt: "A man in a black jacket and sunglasses on a green sofa, against a warm wood wall", hotspot: { x: 0.84, y: 0.3 } },
    { ...CTA_IMAGES[1], alt: "A man in a cream knitted shirt beside a green armchair, against a warm wood wall", hotspot: { x: 0.9, y: 0.2 } },
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
