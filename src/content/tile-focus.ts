/**
 * Where each service picture is anchored across its width, 0 (left) to 1 (right).
 * On phones the cards are 460px tall, as tall as the work cards, so a 4:3 picture
 * shows only about 58% of its width; these keep the device in view. Keys: the
 * service slug (its card on Home and Services) or "slug/tile title" (What we do).
 * Pictures not listed keep their default anchor.
 */
export const TILE_FOCUS: Record<string, number> = {
  "ai-product-design": 1,
  "ai-mvps-business-apps": 0.85,
  "ai-automation": 1,
  "ai-social-media-marketing": 0.85,
  "ai-print-collateral": 0.85,
  "ai-brand-services": 0.7,
  "ai-websites/Website revamps": 1,
  "ai-product-design/Product design": 0.84,
  "ai-product-design/UX audits": 0.9,
  "ai-product-design/Redesign and iteration": 1,
  "ai-product-design/Prototypes and validation": 1,
  "ai-product-design/Design systems": 0.6,
  "ai-product-design/Developer-ready handoff": 0.85,
  "ai-social-media-marketing/Content calendar": 1,
  "digital-marketing/Lead generation campaigns": 0.5,
  "digital-marketing/Analytics and reporting": 1,
  "ai-print-collateral/Brochures and catalogues": 1,
  "ai-print-collateral/Event collateral and booths": 0.85,
  "ai-brand-services/Brand strategy and messaging": 1,
  "ai-brand-services/Logo and visual identity": 1,
  "ai-brand-services/Brand refresh": 1,
  "ai-video-production/Motion graphics and animation": 0.9,
  "ai-video-production/AI video": 0.6,
  "ai-video-production/Concepts and scripts": 1,
};

/**
 * A tall version of a service card made for phones, where the picture would otherwise be
 * cut on both sides (a flat layout recomposed from the same picture, nothing generated).
 */
export const PHONE_CARDS: Record<string, { url: string; width: number; height: number }> = {
  "ai-websites": { url: "/services/ai-websites/card-phone.jpg", width: 1074, height: 1380 },
};

/**
 * Tall phone versions of What we do tiles (1074 x 1380, the device whole and straight-on), keyed
 * by "slug/tile title". Pages listed here show these below 640px instead of a slice of the 4:3 tile.
 */
const tilePhones = (slug: string, tiles: Record<string, string>) =>
  Object.fromEntries(Object.entries(tiles).map(([title, file]) => [`${slug}/${title}`, `/services/${slug}/${file}-phone.jpg`]));
export const TILE_PHONES: Record<string, string> = {
  ...tilePhones("ai-mvps-business-apps", {
    "MVPs and prototypes": "tile-mvp",
    "AI-powered features": "tile-ai",
    "Customer and partner portals": "tile-portal",
    Dashboards: "tile-dashboard",
    "Booking and intake systems": "tile-booking",
    "Internal tools and trackers": "tile-internal",
  }),
};
