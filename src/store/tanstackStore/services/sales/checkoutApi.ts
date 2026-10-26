/* Checkout Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { accessToken } from "../api/tokens";
import type { CartLine, CheckoutInput, DeliveryRegion, Order, OrderLine, PaymentMethod } from "../types";

/**
 * Prices are always worked out by the API, never trusted from the browser,
 * and always in UGX whatever currency is on screen. Placing an order takes
 * its stock at once (so the last piece can't be sold twice); payment is
 * confirmed by staff or, later, the gateway's webhook, so an order starts
 * `pending` either way.
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

// The one place a bag is priced: sale prices, kit prices, the code and delivery, so what is shown is what is charged.
export function quote(lines: CartLine[], region: DeliveryRegion, code?: string, { signal, phone }: RequestOptions & { customerId?: Id; phone?: string } = {}) {
  return http.post<Quote>(routes.checkout.quote, { lines, region, code: code || undefined, phone }, { ...asShopper(), signal });
}

/**
 * Honest seam: no money moves online yet. The order is recorded as
 * `pending` with its stock held, and the page offers the WhatsApp hand-off.
 */
export function placeOrder(input: CheckoutInput, _customerId?: Id) {
  const { kitSaving: _kitSaving, ...form } = input;
  return http.post<Order>(routes.checkout.orders, { ...form, discountCode: form.discountCode || undefined }, asShopper());
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
