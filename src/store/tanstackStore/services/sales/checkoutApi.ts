/* Checkout Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { accessToken } from "../api/tokens";
import type { CartLine, CheckoutInput, DeliveryChoice, DeliveryRegion, Order, OrderLine, PaymentMethod } from "../types";

/**
 * Prices are always worked out by the API, never trusted from the browser,
 * and always in UGX whatever currency is on screen. Placing an order takes
 * its stock at once (so the last piece can't be sold twice); payment is
 * confirmed by staff (WhatsApp orders) or by Pesapal (MTN, Airtel and card,
 * services/sales/paymentsApi), so an order starts `pending` either way.
 */

export interface Quote {
  lines: OrderLine[];
  subtotal: number;
  /** Complete kits in the bag, priced as kits rather than piece by piece. */
  kitSaving: number;
  delivery: number;
  discount: number;
  total: number;
  discountCode?: string;
  /** Why a typed code did not apply, for the code field. */
  discountReason?: string;
}

// A signed-in shopper's token rides along so one-per-shopper codes count their account; a guest checks out without one.
const asShopper = () => (accessToken("customer") ? { realm: "customer" as const } : {});

/** Where it goes: the area's id alone (as before), or the area with its region and collection point. */
export type Destination = DeliveryRegion | (DeliveryChoice & { region: DeliveryRegion });

// The one place a bag is priced: sale prices, kit prices, the code and delivery, so what is shown is what is charged.
// The region and point ride along; an API that doesn't know them yet prices the area as before.
export function quote(lines: CartLine[], where: Destination, code?: string, { signal, phone }: RequestOptions & { customerId?: Id; phone?: string } = {}) {
  const to = typeof where === "string" ? { region: where } : where;
  return http.post<Quote>(
    routes.checkout.quote,
    { lines, region: to.region, zoneRegion: to.zoneRegion || undefined, fulfilment: to.fulfilment || undefined, collectionPoint: to.collectionPoint || undefined, code: code || undefined, phone },
    { ...asShopper(), signal },
  );
}

/**
 * The order is recorded as `pending` with its stock held. With online payment
 * on and an MTN, Airtel or card order, it comes back with
 * `onlinePayment.redirectUrl` (Pesapal's page); otherwise the page offers the
 * WhatsApp hand-off.
 */
export function placeOrder(input: CheckoutInput, _customerId?: Id) {
  const { kitSaving: _kitSaving, ...form } = input;
  // Only a collection carries a point; a delivery carries its address.
  const collect = form.fulfilment === "collect";
  return http.post<Order>(
    routes.checkout.orders,
    { ...form, zoneRegion: form.zoneRegion || undefined, fulfilment: form.fulfilment || undefined, collectionPoint: collect ? form.collectionPoint : undefined, discountCode: form.discountCode || undefined },
    asShopper(),
  );
}

/* Admin (realm: admin) */

/**
 * A sale paid on the spot, in the showroom or on WhatsApp: priced and
 * stock-checked exactly like a shop order, then settled at once.
 */
export async function recordSale(
  input: CheckoutInput,
  { source, method, reference = "" }: { source: "showroom" | "whatsapp"; method: PaymentMethod; reference?: string },
  customerId?: Id,
) {
  const { payment: _payment, kitSaving: _kitSaving, ...form } = input;
  const order = await http.post<Order>(routes.adminSales.sales, { input: form, source, method, reference, customerId }, { realm: "admin" });
  logActivity({ module: "orders", action: "create", entityId: order.id, summary: `Recorded a ${source} sale ${order.ref} for ${order.name}, paid by ${method}` });
  return order;
}
