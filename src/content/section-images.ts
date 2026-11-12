import type { Img } from "@/lib/types";

/**
 * Photos for sections whose content is text only: the call to action cards and
 * the About page lists. They live in /public and are matched to items by
 * position. Set an entry to [] to show that section without photos again.
 */
const photo = (url: string, alt: string): Img => ({ url, width: 1600, height: 1200, alt });

/** The single call to action, and the two closing cards on Home (first, second). */
export const CTA_IMAGES: Img[] = [
  photo("/cta/cta-1.jpg", "A laptop, phone, brochure and business cards from one brand, on a sand backdrop"),
  photo("/cta/cta-2.jpg", "Hands holding a tablet with a grid of service cards, on a terracotta backdrop"),
];

/** Promise list photos by section key, in item order. */
export const LIST_IMAGES: Record<string, Img[]> = {
  promises: [
    photo("/about/promise-1.jpg", "A website on a laptop, the same site on a phone and a printed brochure on a desk"),
    photo("/about/promise-2.jpg", "A hand on a laptop showing a newly launched website, beside a desk calendar"),
    photo("/about/promise-3.jpg", "A printed price sheet with three plans on a stone table, a hand holding a pen"),
    photo("/about/promise-4.jpg", "A hand holding a brass key in front of a laptop showing a website"),
  ],
  serve: [
    photo("/about/serve-1.jpg", "An engineer in a factory holding a tablet with a production dashboard"),
    photo("/about/serve-2.jpg", "Hands holding a phone with a shipment tracking screen at a container port"),
    photo("/about/serve-3.jpg", "A doctor in a clinic corridor checking a schedule on a tablet"),
    photo("/about/serve-4.jpg", "A bakery owner at the counter taking orders on a laptop"),
    photo("/about/serve-5.jpg", "A small team around a laptop planning their first product"),
  ],
};
