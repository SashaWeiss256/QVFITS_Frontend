/* Orders Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { moveStock } from "../catalog/productsApi";
import { createCollection } from "../store/collectionStore";
import type { Order, OrderStatus, PaymentMethod } from "../types";
import { recordTransaction, transactions } from "./transactionsApi";
import orderSeed from "@/data/orders.json";

/**
 * Every order, guest or signed in. Checkout writes here (checkoutApi), the
 * customer reads their own, a guest tracks one by reference and phone, and
 * the admin moves it through its statuses with a timeline of who did what.
 */
export const orders = createCollection<Order>("orders", orderSeed as unknown as Order[], { idPrefix: "ord" });

const digits = (phone: string) => phone.replace(/\D/g, "").slice(-9);

/** A guest's view of one order: the reference plus the phone it was placed with. */
export function trackOrder(ref: string, phone: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const order = orders.list().find((o) => o.ref.toLowerCase() === ref.trim().toLowerCase() && digits(o.phone) === digits(phone));
    if (!order) throw new ApiError("No order matches that reference and phone number.", 404);
    return order;
  }, 250, signal);
}

/* Customer (realm: customer) */

export function listMyOrders(customerId: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => orders.list().filter((o) => o.customerId === customerId), 200, signal);
}

export function getMyOrder(customerId: Id, id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    const order = orders.get(id);
    if (!order || order.customerId !== customerId) throw new ApiError("We could not find that order.", 404);
    return order;
  }, 150, signal);
}

/* Admin (realm: admin) */

export function listOrders({ signal }: RequestOptions = {}) {
  return mockApi(() => orders.list(), 200, signal);
}

function find(id: Id) {
  const order = orders.get(id);
  if (!order) throw new ApiError("That order no longer exists.", 404);
  return order;
}

/** The order an admin may move each status to. Delivered orders end there. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["packed", "cancelled"],
  packed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
  exchanged: [],
  refunded: [],
};

/** Records a payment, unless the order has one already. */
function ensurePayment(order: Order, method: PaymentMethod, reference = "") {
  const paid = transactions.list().some((t) => t.orderId === order.id && t.type === "payment" && t.status === "succeeded");
  if (!paid) recordTransaction({ orderId: order.id, orderRef: order.ref, type: "payment", method, amount: order.total, status: "succeeded", reference });
}

export function updateOrderStatus(id: Id, status: OrderStatus, note?: string) {
  return mockApi(() => {
    const admin = assertCan("orders", "edit");
    const order = find(id);
    if (order.status === status) return order;
    // Cancelling puts the pieces back on the shelf.
    if (status === "cancelled") order.lines.forEach((l) => moveStock(l.productId, l.colorId ?? l.color, l.size, l.qty));
    if (status === "paid") ensurePayment(order, order.payment);
    const updated = orders.update(id, {
      status,
      paymentStatus: status === "paid" ? "paid" : order.paymentStatus,
      history: [...order.history, { status, at: new Date().toISOString(), by: admin.name, note }],
    })!;
    logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref} marked ${status.replace(/_/g, " ")}` });
    return updated;
  });
}

/** Payment confirmed by staff (mobile money on their phone, cash in the showroom). */
export function markOrderPaid(id: Id, { method, reference }: { method: PaymentMethod; reference: string }) {
  return mockApi(() => {
    const admin = assertCan("orders", "edit");
    const order = find(id);
    ensurePayment(order, method, reference);
    const updated = orders.update(id, {
      paymentStatus: "paid",
      payment: method,
      status: order.status === "pending" ? "paid" : order.status,
      history: order.status === "pending" ? [...order.history, { status: "paid", at: new Date().toISOString(), by: admin.name, note: reference }] : order.history,
    })!;
    logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref} payment recorded` });
    return updated;
  });
}

export function addOrderNote(id: Id, text: string) {
  return mockApi(() => {
    const admin = assertCan("orders", "edit");
    const order = find(id);
    if (!text.trim()) throw new ApiError("Write the note first.", 422);
    const note = { id: `note_${Date.now().toString(36)}`, text: text.trim(), by: admin.name, at: new Date().toISOString() };
    return orders.update(id, { notes: [...order.notes, note] })!;
  });
}
