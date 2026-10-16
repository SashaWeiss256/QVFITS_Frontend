/* Checkout Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { getProductsByIds, moveStock, variantStock } from "../catalog/productsApi";
import { colors } from "../catalog/attributesApi";
import { readSettings } from "../content/settingsApi";
import { feeFor } from "../settings/shippingApi";
import type { CartLine, CheckoutInput, DeliveryRegion, Order, OrderLine } from "../types";
import { applyDiscount, markDiscountUsed } from "./discountsApi";
import { orders } from "./ordersApi";

/**
 * Prices are always worked out here, never trusted from the browser, and
 * always in UGX whatever currency is on screen. With the API this becomes
 * `POST checkout/quote` and `POST checkout/orders`; payment is confirmed by
 * the gateway's webhook, so an order starts `pending` either way.
 */

export interface Quote {
  lines: OrderLine[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  discountCode?: string;
  /** Why a typed code did not apply, for the code field. */
  discountReason?: string;
}

const usesOf = (customerId: Id | undefined, code: string | undefined) =>
  customerId && code ? orders.list().filter((o) => o.customerId === customerId && o.discountCode === code.toUpperCase()).length : 0;

export async function quote(lines: CartLine[], region: DeliveryRegion, code?: string, { signal, customerId }: RequestOptions & { customerId?: Id } = {}): Promise<Quote> {
  const products = await getProductsByIds(lines.map((l) => l.productId), { signal });

  const priced: OrderLine[] = lines.flatMap((line) => {
    const p = products.find((x) => x.id === line.productId);
    if (!p) return [];
    const price = p.salePercent ? Math.round(p.price * (1 - p.salePercent / 100)) : p.price;
    const colorId = colors.list().find((c) => c.name === line.color)?.id;
    return [{ ...line, name: p.name, price, colorId }];
  });

  const subtotal = priced.reduce((sum, l) => sum + l.price * l.qty, 0);
  const applied = applyDiscount(code, priced, products, usesOf(customerId, code));
  const delivery = applied.freeShipping ? 0 : feeFor(region, subtotal - applied.amount, readSettings().freeShippingOver);

  return {
    lines: priced,
    subtotal,
    delivery,
    discount: applied.amount,
    total: subtotal - applied.amount + delivery,
    discountCode: applied.discount?.code,
    discountReason: applied.reason,
  };
}

function newRef() {
  return `QV-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

/**
 * Honest seam: with mocks on no money moves. The order is recorded as
 * `pending`, its stock is held, and the page offers the WhatsApp hand-off.
 */
export async function placeOrder(input: CheckoutInput, customerId?: Id, { source = "web", by = "Checkout" }: { source?: Order["source"]; by?: string } = {}): Promise<Order> {
  if (!input.lines.length) throw new ApiError("Your bag is empty.", 422);
  const products = await getProductsByIds(input.lines.map((l) => l.productId));
  for (const l of input.lines) {
    const p = products.find((x) => x.id === l.productId);
    const colorId = colors.list().find((c) => c.name === l.color)?.id ?? l.color;
    if (!p) throw new ApiError("A piece in your bag is no longer sold. Remove it to carry on.", 409);
    const left = variantStock(p, colorId, l.size);
    if (left < l.qty) throw new ApiError(`${p.name} in ${l.color}, ${l.size} has ${left} left. Lower the quantity to carry on.`, 409);
  }
  const priced = await quote(input.lines, input.region, input.discountCode, { customerId });

  return mockApi(() => {
    const createdAt = new Date().toISOString();
    const order = orders.create({
      ref: newRef(),
      customerId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      region: input.region,
      address: input.address,
      note: input.note,
      lines: priced.lines,
      subtotal: priced.subtotal,
      delivery: priced.delivery,
      discount: priced.discount,
      discountCode: priced.discountCode,
      total: priced.total,
      payment: input.payment,
      paymentStatus: "unpaid",
      status: "pending",
      history: [{ status: "pending", at: createdAt, by }],
      notes: [],
      source,
      createdAt,
    });
    priced.lines.forEach((l) => moveStock(l.productId, l.colorId ?? l.color, l.size, -l.qty));
    if (priced.discountCode) {
      const d = applyDiscount(priced.discountCode, priced.lines, products).discount;
      if (d) markDiscountUsed(d.id);
    }
    return order;
  }, 400);
}

/* Admin (realm: admin) */

/** An order taken on WhatsApp or in the showroom, priced the same way as the shop. */
export async function createManualOrder(input: CheckoutInput, customerId?: Id) {
  const admin = assertCan("orders", "edit");
  const order = await placeOrder(input, customerId, { source: "manual", by: admin.name });
  logActivity({ module: "orders", action: "create", entityId: order.id, summary: `Entered order ${order.ref} for ${order.name}` });
  return order;
}
