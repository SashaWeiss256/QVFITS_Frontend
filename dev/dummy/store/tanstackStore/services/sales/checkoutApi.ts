/* Checkout Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { getLiveKit, getProductsByIds, moveStock, variantStock } from "../catalog/productsApi";
import { colors } from "../catalog/attributesApi";
import { readSettings } from "../content/settingsApi";
import { settlePayment } from "./ordersApi";
import { feeFor } from "../settings/shippingApi";
import type { CartLine, CheckoutInput, DeliveryRegion, Order, OrderLine, PaymentMethod } from "../types";
import { applyDiscount } from "./discountsApi";
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
  /** Complete kits in the bag, priced as kits rather than piece by piece. */
  kitSaving: number;
  delivery: number;
  discount: number;
  total: number;
  discountCode?: string;
  /** Why a typed code did not apply, for the code field. */
  discountReason?: string;
}

/**
 * Lines added from a kit carry its id. Each complete set of the kit's pieces
 * in the bag is charged the kit's price; a set that is broken up (a piece
 * removed) falls back to the pieces' own prices.
 */
function kitSavingOf(priced: OrderLine[]) {
  let saving = 0;
  for (const kitId of new Set(priced.map((l) => l.kitId).filter(Boolean) as string[])) {
    const kit = getLiveKit(kitId);
    if (!kit) continue;
    const tagged = priced.filter((l) => l.kitId === kitId);
    // How many of one piece are in the bag; a kit counts as complete only when every one of its pieces is there.
    const qtyOf = (id: string) => tagged.filter((l) => l.productId === id).reduce((n, l) => n + l.qty, 0);
    const sets = Math.min(...kit.kitItems.map(qtyOf));
    if (!Number.isFinite(sets) || sets < 1) continue;
    const separate = kit.kitItems.reduce((n, id) => n + (tagged.find((l) => l.productId === id)?.price ?? 0), 0);
    saving += Math.max(0, separate - kit.price) * sets;
  }
  return saving;
}

// The one place a bag is priced: sale prices, kit prices, the code and delivery are all worked out here, never on the screen, so what is shown is what is charged.
export async function quote(lines: CartLine[], region: DeliveryRegion, code?: string, { signal, customerId, phone }: RequestOptions & { customerId?: Id; phone?: string } = {}): Promise<Quote> {
  const products = await getProductsByIds(lines.map((l) => l.productId), { signal });

  const priced: OrderLine[] = lines.flatMap((line) => {
    const p = products.find((x) => x.id === line.productId);
    if (!p) return [];
    const price = p.salePercent ? Math.round(p.price * (1 - p.salePercent / 100)) : p.price;
    const colorId = colors.list().find((c) => c.name === line.color)?.id;
    return [{ ...line, name: p.name, price, colorId }];
  });

  const subtotal = priced.reduce((sum, l) => sum + l.price * l.qty, 0);
  const kitSaving = kitSavingOf(priced);
  const applied = applyDiscount(code, priced, products, { customerId, phone });
  // A code never takes the goods below nothing; delivery is always charged on its own.
  const discount = Math.min(applied.amount, subtotal - kitSaving);
  const delivery = applied.freeShipping ? 0 : feeFor(region, subtotal - kitSaving - discount, readSettings().freeShippingOver);

  return {
    lines: priced,
    subtotal,
    kitSaving,
    delivery,
    discount,
    total: subtotal - kitSaving - discount + delivery,
    discountCode: applied.discount?.code,
    discountReason: applied.reason,
  };
}

// The reference a shopper quotes: QV- and six characters, short enough to read out on a call.
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
  // The phone counts a guest's earlier uses of the code too (gap A5).
  const priced = await quote(input.lines, input.region, input.discountCode, { customerId, phone: input.phone });

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
      kitSaving: priced.kitSaving,
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
    priced.lines.forEach((l) => moveStock(l.productId, l.colorId ?? l.color, l.size, -l.qty, "order", order.ref));
    return order;
  }, 400);
}

/* Admin (realm: admin) */

/**
 * A sale paid on the spot, in the showroom or on WhatsApp: priced and
 * stock-checked exactly like a shop order, then settled at once with a
 * payment against it, so the books and the stock always match. Online
 * orders only ever come from checkout.
 */
export async function recordSale(
  input: CheckoutInput,
  { source, method, reference = "" }: { source: "showroom" | "whatsapp"; method: PaymentMethod; reference?: string },
  customerId?: Id,
) {
  const admin = assertCan("orders", "payment");
  const order = await placeOrder({ ...input, payment: method }, customerId, { source, by: admin.name });
  const paid = settlePayment(order, { method, reference }, admin.name);
  logActivity({ module: "orders", action: "create", entityId: order.id, summary: `Recorded a ${source} sale ${order.ref} for ${order.name}, paid by ${method}` });
  return paid;
}
