/* Home Content Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import type { FaqItem, Photo } from "../types";
import { photosFor } from "../catalog/productsApi";
import { CAMPAIGN, FAQ, HERO_SLIDES, MOVEMENTS, PRESS, SHOP_THE_FEED } from "@/data/shop";

/**
 * The editable copy on the storefront: hero slides, the campaign banner, the
 * movement tiles, the press row, the feed, and the FAQ. One document, so the
 * admin's Website module saves a section at a time without touching the rest.
 */
export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The round tag on the picture, e.g. "Sale". */
  sticker?: string;
}

export interface HomeContent {
  heroSlides: HeroSlide[];
  campaign: Record<string, unknown>;
  movements: { id: string; label: string; occasion: string }[];
  press: Record<string, unknown>;
  feed: Record<string, unknown>;
  faq: FaqItem[];
}

const content = createDocument<HomeContent>("content", {
  heroSlides: HERO_SLIDES,
  campaign: CAMPAIGN,
  movements: MOVEMENTS,
  press: PRESS,
  feed: SHOP_THE_FEED,
  faq: FAQ,
});

/**
 * The document as the storefront reads it: every slide, movement tile and the
 * campaign banner carry their photo's real dimensions, for an accurate srcset.
 */
export type HomeContentView = Omit<HomeContent, "heroSlides" | "movements" | "campaign"> & {
  heroSlides: (HeroSlide & { photo?: Photo })[];
  movements: (HomeContent["movements"][number] & { photo?: Photo })[];
  campaign: HomeContent["campaign"] & { photo?: Photo };
  /** The studio photo on the About page. */
  aboutPhoto?: Photo;
};

export function getContent({ signal }: RequestOptions = {}) {
  return mockApi<HomeContentView>(() => {
    const doc = content.get();
    return {
      ...doc,
      heroSlides: doc.heroSlides.map((s) => ({ ...s, photo: photosFor(s.id)[0] })),
      movements: doc.movements.map((m) => ({ ...m, photo: photosFor(`movement-${m.id}`)[0] })),
      campaign: { ...doc.campaign, photo: photosFor("banner-campaign")[0] },
      aboutPhoto: photosFor("about")[0],
    };
  }, 100, signal);
}

export function updateContent(patch: DocumentPatch<HomeContent>) {
  return mockApi(() => content.update(patch));
}
