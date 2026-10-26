/* Shipping Zones Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { ShippingZone } from "../types";

/**
 * Where the shop delivers and what each place costs, on the API. Checkout
 * offers the active zones; the API works out the fee (waived at or over the
 * zone's `freeOver`, or the shop-wide threshold when the zone has none).
 */

export function listShippingZones({ signal }: RequestOptions = {}) {
  return http.get<ShippingZone[]>(routes.shop.shippingZones, { signal });
}

/* Admin (realm: admin) */

export const shippingCrud = httpCrud<ShippingZone>(routes.adminSales.shippingZones, { module: "settings", noun: "delivery zone", label: (z) => z.name });
export const listAllShippingZones = shippingCrud.list;
