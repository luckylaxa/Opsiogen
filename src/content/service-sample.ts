import type { Img } from "@/lib/types";

/**
 * The sample service page (Superside-style layout), tried on one service
 * before it goes to all of them. Its pictures live here until the layout is
 * approved and they move into the CMS.
 */
export const SAMPLE_SERVICE = "ai-product-design";

const img = (url: string, width: number, height: number, alt: string): Img => ({ url, width, height, alt });

export type SampleAssets = {
  cards: Img[];
  /** Wider pictures for the cards that span two columns from desktop up, by card index. */
  wide: Record<number, Img>;
  why: Img;
  banner: Img;
};

export const SAMPLE_ASSETS: Record<string, SampleAssets> = {
  "ai-product-design": {
    /** One per What we do item, in order: text sits on the quiet top of each. */
    cards: [
      img("/services/ai-product-design/card-product.jpg", 1400, 1400, "A product dashboard on a laptop and an app on a phone"),
      img("/services/ai-product-design/card-audit.jpg", 1400, 1400, "A product screen marked with numbered issues and a list of fixes"),
      img("/services/ai-product-design/card-redesign.jpg", 1400, 1400, "A cluttered old screen beside its clean redesign"),
      img("/services/ai-product-design/card-prototype.jpg", 1400, 1400, "Three app screens linked as a clickable prototype"),
      img("/services/ai-product-design/card-system.jpg", 1400, 1400, "A design system sheet with colours, type, buttons and inputs"),
      img("/services/ai-product-design/card-handoff.jpg", 1400, 1400, "An app screen with measurements beside its specs"),
    ],
    wide: {
      0: img("/services/ai-product-design/card-product-wide.jpg", 2400, 1100, "A product dashboard on a laptop and an app on a phone"),
      5: img("/services/ai-product-design/card-handoff-wide.jpg", 2400, 1100, "An app screen with measurements beside its specs"),
    },
    why: img("/work/samples/sample-1.jpg", 1400, 1400, "An app screen on a phone"),
    banner: img("/work/samples/sample-banner.jpg", 2400, 1350, "A website on a laptop and a phone"),
  },
};
