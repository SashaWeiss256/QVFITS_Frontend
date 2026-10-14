/* Checkout Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import type { CartLine, CheckoutInput, DeliveryRegion, Order, OrderLine, ShopSettings } from "../types";
import { getProductsByIds } from "../catalog/productsApi";
import { getSettings } from "../content/settingsApi";
import { findDiscount } from "./discountsApi";
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
}

function deliveryFee(settings: ShopSettings, region: DeliveryRegion, subtotal: number) {
  if (region === "pickup" || subtotal >= settings.freeShippingOver) return 0;
  return region === "upcountry" ? settings.upcountryDelivery : settings.kampalaDelivery;
}

export async function quote(lines: CartLine[], region: DeliveryRegion, code?: string, { signal }: RequestOptions = {}): Promise<Quote> {
  const [products, settings] = await Promise.all([
    getProductsByIds(lines.map((l) => l.productId), { signal }),
    getSettings({ signal }),
  ]);

  const priced: OrderLine[] = lines.flatMap((line) => {
    const p = products.find((x) => x.id === line.productId);
    if (!p) return [];
    const price = p.salePercent ? Math.round(p.price * (1 - p.salePercent / 100)) : p.price;
    return [{ ...line, name: p.name, price }];
  });

  const subtotal = priced.reduce((sum, l) => sum + l.price * l.qty, 0);
  const found = findDiscount(code);
  const discount = found ? Math.round((subtotal * found.percent) / 100) : 0;
  const delivery = deliveryFee(settings, region, subtotal);

  return { lines: priced, subtotal, delivery, discount, total: subtotal - discount + delivery, discountCode: found?.code };
}

function newRef() {
  return `QV-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

/**
 * Honest seam: with mocks on no money moves. The order is recorded as
 * `pending` and the page offers the WhatsApp hand-off to confirm it.
 */
export async function placeOrder(input: CheckoutInput, customerId?: Id): Promise<Order> {
  if (!input.lines.length) throw new ApiError("Your bag is empty.", 422);
  const priced = await quote(input.lines, input.region, input.discountCode);

  return mockApi(() =>
    orders.create({
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
      total: priced.total,
      payment: input.payment,
      status: "pending",
      createdAt: new Date().toISOString(),
    }),
  400);
}
