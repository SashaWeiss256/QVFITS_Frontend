/* Offers Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import offerSeed from "@/data/offers.json";

/**
 * What the shop is promoting right now: the promo bar strip, the sale, the
 * deal cards and the corner sticker. One document, so the admin's Offers
 * module can turn each on or off on its own.
 */
export interface Deal {
  id: string;
  live: boolean;
  tag: string;
  title: string;
  text: string;
  cta: string;
  /** Null opens WhatsApp. */
  href: string | null;
  tone: "brand" | "dark" | "teal" | (string & {});
}

export interface Sticker {
  live: boolean;
  tag: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  snoozeDays: number;
  delayMs: number;
}

export interface Offers {
  promoBar: string[];
  sale: { live: boolean; percentUpTo: number };
  deals: Deal[];
  sticker: Sticker;
}

const offers = createDocument<Offers>("offers", offerSeed as Offers);

export function getOffers({ signal }: RequestOptions = {}) {
  return mockApi(() => offers.get(), 100, signal);
}

export function updateOffers(patch: DocumentPatch<Offers>) {
  return mockApi(() => {
    assertCan("offers", "edit");
    const doc = offers.update(patch);
    logActivity({ module: "offers", action: "update", summary: `Updated offers (${Object.keys(patch).join(", ")})` });
    return doc;
  });
}
