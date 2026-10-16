/* Shipping Zones Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud, byPosition } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { ShippingZone } from "../types";
import zoneSeed from "@/data/shipping-zones.json";

/**
 * Where the shop delivers and what each place costs. Checkout offers the
 * active zones; the fee is waived at or over the zone's `freeOver`, or the
 * shop-wide threshold in settings when the zone has none of its own.
 */
export const zones = createCollection<ShippingZone>("shipping-zones", zoneSeed as ShippingZone[], { idPrefix: "zone" });

export function listShippingZones({ signal }: RequestOptions = {}) {
  return mockApi(activeZones, 100, signal);
}

export const activeZones = () => byPosition(zones.list()).filter((z) => z.active);

/** The fee for a zone and subtotal, worked out the same way the API will. */
export function feeFor(zoneId: string, subtotal: number, shopFreeOver: number) {
  const zone = zones.get(zoneId);
  if (!zone) return 0;
  return subtotal >= (zone.freeOver ?? shopFreeOver) ? 0 : zone.fee;
}

/* Admin (realm: admin) */

export const listAllShippingZones = ({ signal }: RequestOptions = {}) => mockApi(() => byPosition(zones.list()), 100, signal);

export const shippingCrud = adminCrud(zones, {
  module: "settings",
  noun: "delivery zone",
  label: (z) => z.name,
  prepare: (data, existing, all) => (existing ? data : { active: true, freeOver: null, collect: false, description: "", etaDays: "", ...data, position: all.length }),
});
