/* Offers Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { linkLookup } from "../catalog/attributesApi";
import type { DocumentPatch } from "../store/collectionStore";
import type { Linked } from "../types";
import { withHrefs, withoutHrefs } from "@/utils/shopTargets";

/**
 * What the shop is promoting right now: the promo bar strip, the sale, the
 * deal cards and the corner sticker. One document on the API, so the admin's
 * Offers module can turn each on or off on its own. A category or term a
 * deal links to can't be deleted until the link changes.
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

const ADMIN = { realm: "admin" } as const;

/** Offers as the shop reads them, every deal link with its href from the live catalogue. */
export async function getOffers({ signal }: RequestOptions = {}) {
  const [offers, lookup] = await Promise.all([http.get<Offers>(routes.site.offers, { signal }), linkLookup({ signal })]);
  return withHrefs(offers, lookup) as Offers;
}

/** Offers as stored, for the admin editor. */
export function getOffersForEdit({ signal }: RequestOptions = {}) {
  return http.get<Offers>(routes.adminSite.offers, { ...ADMIN, signal });
}

// Stored with targets only: an href is worked out on every read, so it never goes stale.
export async function updateOffers(patch: DocumentPatch<Offers>) {
  const doc = await http.patch<Offers>(routes.adminSite.offers, withoutHrefs(patch), ADMIN);
  logActivity({ module: "offers", action: "update", summary: `Updated offers (${Object.keys(patch).join(", ")})` });
  return doc;
}
