/* Shop Settings Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { createDocument, type DocumentPatch } from "../store/collectionStore";
import { activeZones } from "../settings/shippingApi";
import type { ShopSettings } from "../types";
import settingsSeed from "@/data/settings.json";

/**
 * One settings document: shop details, contact and socials, stock alerts,
 * the exchange window and display currencies. The storefront reads it
 * everywhere (header, footer, cart); the admin edits it under Settings.
 * Exchange rates move to a daily feed on the API; until then they show their date.
 */
const settings = createDocument<ShopSettings>("settings", settingsSeed as ShopSettings);

/** The document plus the live delivery zones. */
export function getSettings({ signal }: RequestOptions = {}) {
  return mockApi<ShopSettings>(() => ({ ...settings.get(), zones: activeZones() }), 100, signal);
}

/** Read synchronously by other services (checkout, inventory alerts). */
export const readSettings = () => settings.get();

export function updateSettings(patch: DocumentPatch<ShopSettings>) {
  return mockApi<ShopSettings>(() => {
    assertCan("settings", "edit");
    // Zones are edited on their own; never save the read-only copy back.
    const { zones: _zones, ...rest } = patch;
    const doc = settings.update(rest);
    logActivity({ module: "settings", action: "update", summary: `Updated settings (${Object.keys(patch).join(", ")})` });
    return { ...doc, zones: activeZones() };
  });
}
