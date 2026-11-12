/* Shop Settings Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { DocumentPatch } from "../store/collectionStore";
import type { ShopSettings } from "../types";
import settingsSeed from "@/data/settings.json";

/**
 * One settings document on the API: shop details, contact and socials,
 * stock alerts, the exchange window, the unpaid hold and display currencies.
 * The storefront reads it everywhere (header, footer, cart); the admin edits
 * it under Settings. Exchange rates move to a daily feed later; until then
 * they show their date.
 */

// The last settings read, for the few screens that check one synchronously (the return window). The seed until the first read.
let latest = settingsSeed as ShopSettings;

/** The document plus the live delivery zones. */
export async function getSettings({ signal }: RequestOptions = {}) {
  latest = await http.get<ShopSettings>(routes.shop.settings, { signal });
  return latest;
}

/** The settings as last read; the API checks against its own copy whenever it matters. */
export const readSettings = () => latest;

export async function updateSettings(patch: DocumentPatch<ShopSettings>) {
  // Zones are edited on their own; never send the read-only copy back.
  const { zones: _zones, ...rest } = patch;
  latest = await http.patch<ShopSettings>(routes.adminSales.settings, rest, { realm: "admin" });
  const onlyVee = Object.keys(rest).every((k) => k === "assistant");
  logActivity({ module: onlyVee ? "vee" : "settings", action: "update", summary: `Updated settings (${Object.keys(rest).join(", ")})` });
  return latest;
}
