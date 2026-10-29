/* Offers Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { linkLookup, registerLinkSource } from "../catalog/attributesApi";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import type { Linked } from "../types";
import { withHrefs, withoutHrefs } from "@/utils/shopTargets";
import offerSeed from "@/data/offers.json";

/**
 * What the shop is promoting right now: the promo bar strip, the sale, the
 * deal cards and the corner sticker. One document, so the admin's Offers
 * module can turn each on or off on its own.
 */
export interface Deal extends Linked {
  id: string;
  live: boolean;
  tag: string;
  title: string;
  text: string;
  cta: string;
  /** No target and a null href opens WhatsApp. */
  tone: "brand" | "dark" | "teal" | (string & {});
}

export interface Sticker extends Linked {
  live: boolean;
  tag: string;
  title: string;
  text: string;
  cta: string;
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
registerLinkSource("offers", () => offers.get());

/** Offers as the shop reads them, every deal link with its href. */
export function getOffers({ signal }: RequestOptions = {}) {
  return mockApi(() => withHrefs(offers.get(), linkLookup()) as Offers, 100, signal);
}

/** Offers as stored, for the admin editor. */
export function getOffersForEdit({ signal }: RequestOptions = {}) {
  return mockApi(() => offers.get(), 100, signal);
}

export function updateOffers(patch: DocumentPatch<Offers>) {
  return mockApi(() => {
    assertCan("offers", "edit");
    const doc = offers.update(withoutHrefs(patch));
    logActivity({ module: "offers", action: "update", summary: `Updated offers (${Object.keys(patch).join(", ")})` });
    return doc;
  });
}
