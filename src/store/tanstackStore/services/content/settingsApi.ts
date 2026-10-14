/* Shop Settings Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import type { ShopSettings } from "../types";
import { CONFIG, CURRENCIES, RATES_UPDATED } from "@/data/shop";

/**
 * One settings document: shop details, delivery fees and display currencies.
 * The storefront reads it everywhere (header, footer, cart); the admin edits
 * it under Settings (realm: admin for updates once on HTTP). Exchange rates
 * move to a daily feed on the API; until then they show their date.
 */
const seed: ShopSettings = {
  brand: CONFIG.brand,
  wordmark: CONFIG.wordmark,
  tagline: CONFIG.tagline,
  blurb: CONFIG.blurb,
  address: CONFIG.address,
  addressNote: CONFIG.addressNote,
  mapsUrl: CONFIG.mapsUrl,
  phone: CONFIG.phone,
  whatsapp: CONFIG.whatsapp,
  email: CONFIG.email,
  instagram: CONFIG.instagram,
  instagramHandle: CONFIG.instagramHandle,
  tiktok: CONFIG.tiktok,
  tiktokHandle: CONFIG.tiktokHandle,
  opensAt: CONFIG.opensAt,
  currency: "UGX",
  freeShippingOver: CONFIG.freeShippingOver,
  kampalaDelivery: CONFIG.kampalaDelivery,
  upcountryDelivery: CONFIG.upcountryDelivery,
  exchangeDays: 7, // PLACEHOLDER: confirm the exchange window with the shop
  ratesUpdated: RATES_UPDATED,
  currencies: CURRENCIES as ShopSettings["currencies"],
};

const settings = createDocument<ShopSettings>("settings", seed);

export function getSettings({ signal }: RequestOptions = {}) {
  return mockApi(() => settings.get(), 100, signal);
}

export function updateSettings(patch: DocumentPatch<ShopSettings>) {
  return mockApi(() => settings.update(patch));
}
