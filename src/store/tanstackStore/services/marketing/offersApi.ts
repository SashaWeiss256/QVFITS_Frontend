/* Offers Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import { DEALS, PROMO_BAR, SALE, STICKER } from "@/data/shop";

/**
 * What the shop is promoting right now: the promo bar strip, the sale, the
 * deal cards and the corner sticker. One document, so the admin's Offers
 * module can turn each on or off on its own.
 */
export interface Offers {
  promoBar: string[];
  sale: { live: boolean; percentUpTo: number };
  deals: Record<string, unknown>[];
  sticker: Record<string, unknown>;
}

const offers = createDocument<Offers>("offers", {
  promoBar: PROMO_BAR,
  sale: SALE,
  deals: DEALS,
  sticker: STICKER,
});

export function getOffers({ signal }: RequestOptions = {}) {
  return mockApi(() => offers.get(), 100, signal);
}

export function updateOffers(patch: DocumentPatch<Offers>) {
  return mockApi(() => offers.update(patch));
}
