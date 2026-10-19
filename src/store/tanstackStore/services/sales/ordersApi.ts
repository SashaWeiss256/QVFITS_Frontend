/* Orders Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
// Stock lives on the API now and only staff can change it there, so these mock orders no longer move it.
// Taking stock for an order, and putting it back on a cancellation or return, moves to the orders API (next phase).
import { readSettings } from "../content/settingsApi";
import { emailsForOrder, queueEmail } from "../notifications/outboxApi";
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
// Best sellers are counted from these (productsApi).

const digits = (phone: string) => phone.replace(/\D/g, "").slice(-9);

/** A guest's view of one order: the reference plus the phone it was placed with. */
/* Unpaid orders and customer messages */

const HOUR = 3_600_000;
const STATUS_WORDS: Partial<Record<OrderStatus, string>> = {
  paid: "We have your payment, thank you. We're getting it ready.",
  packed: "Your order is packed and waiting for the rider.",
  out_for_delivery: "Your order is on its way to you today.",
  delivered: "Your order was delivered. Enjoy it, and tell us how it fits.",
  cancelled: "Your order was cancelled, and nothing more is owed.",
  refunded: "Your refund is on its way back to you.",
};

/**
 * Tells the customer their order moved (gap O4). Honest seam: it waits in
 * the outbox until an email service is connected; staff can also send the
 * same words on WhatsApp from the order.
 */
export function notifyCustomer(order: Order, status: OrderStatus, extra = "") {
  const words = STATUS_WORDS[status];
  if (!words) return;
  queueEmail({ to: order.email || order.phone, kind: "order-update", ref: order.ref, subject: `Order ${order.ref}: ${status.replace(/_/g, " ")}`, body: `${words}${extra ? ` ${extra}` : ""}` });
}

/** When an unpaid order stops holding its pieces. */
export const holdsUntil = (order: Pick<Order, "createdAt">) => Date.parse(order.createdAt) + (readSettings().unpaidHoldHours ?? 48) * HOUR;

/**
 * Unpaid orders don't hold stock forever (gap S1): past the hold time set in
 * Settings, a pending order with nothing paid cancels itself and its pieces
 * go back on the shelf. Run on every read of orders, so it works without a
 * server job; the API runs it on a schedule.
 */
export function expireUnpaid() {
  const now = Date.now();
  for (const o of orders.list()) {
    if (o.status !== "pending" || o.paymentStatus !== "unpaid" || holdsUntil(o) > now) continue;
    const at = new Date(holdsUntil(o)).toISOString();
    const updated = orders.update(o.id, { status: "cancelled", history: [...o.history, { status: "cancelled", at, by: "The shop", note: "Not paid in time, so the pieces went back on the shelf." }] })!;
    notifyCustomer(updated, "cancelled", "It wasn't paid in time. You're welcome to order again.");
  }
}

/** A customer calls off an order they haven't paid for (gap O1). */
function cancelUnpaid(order: Order, by: string) {
  if (order.status !== "pending" || order.paymentStatus !== "unpaid") throw new ApiError("Only an order that hasn't been paid can be cancelled here. Message us about this one.", 409);
  const updated = orders.update(order.id, { status: "cancelled", history: [...order.history, { status: "cancelled", at: new Date().toISOString(), by, note: "Cancelled by the customer." }] })!;
  notifyCustomer(updated, "cancelled");
  return updated;
}

// A signed-in shopper may cancel only their own order, and only while nothing is paid (cancelUnpaid enforces that).
export function cancelMyOrder(customerId: Id, id: Id) {
  return mockApi(() => {
    const order = orders.get(id);
    if (!order || order.customerId !== customerId) throw new ApiError("We could not find that order.", 404);
    return cancelUnpaid(order, order.name);
  }, 300);
}

// A guest proves the order is theirs with its reference and the phone number it was placed with.
export function cancelGuestOrder(ref: string, phone: string) {
  return mockApi(() => {
    const order = orders.list().find((o) => o.ref.toLowerCase() === ref.trim().toLowerCase() && digits(o.phone) === digits(phone));
    if (!order) throw new ApiError("No order matches that reference and phone number.", 404);
    return cancelUnpaid(order, order.name);
  }, 300);
}

/** The messages sent about one order, for the order drawer. */
export function listOrderEmails(ref: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("orders", "view");
    return emailsForOrder(ref);
  }, 80, signal);
}

// Reference plus phone is the only key a guest has, so a wrong pair gets the same answer as an unknown order.
export function trackOrder(ref: string, phone: string, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    expireUnpaid();
    const order = orders.list().find((o) => o.ref.toLowerCase() === ref.trim().toLowerCase() && digits(o.phone) === digits(phone));
    if (!order) throw new ApiError("No order matches that reference and phone number.", 404);
    return order;
  }, 250, signal);
}

/* Customer (realm: customer) */

export function listMyOrders(customerId: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    expireUnpaid();
    return orders.list().filter((o) => o.customerId === customerId);
  }, 200, signal);
}

// Orders are read through the expiry sweep, so a hold that has run out shows as cancelled straight away.
export function getMyOrder(customerId: Id, id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => {
    expireUnpaid();
    const order = orders.get(id);
    if (!order || order.customerId !== customerId) throw new ApiError("We could not find that order.", 404);
    return order;
  }, 150, signal);
}

/* Admin (realm: admin) */

export function listOrders({ signal }: RequestOptions = {}) {
  return mockApi(() => {
    expireUnpaid();
    return orders.list();
  }, 200, signal);
}

// An order by id, or a 404 if it has gone.
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

/** What has come in on an order so far, from its succeeded payments. */
export function paidSoFar(orderId: Id) {
  return transactions.list().filter((t) => t.orderId === orderId && t.type === "payment" && t.status === "succeeded").reduce((n, t) => n + t.amount, 0);
}

/** Records whatever is still due, unless the order is already paid in full. */
function ensurePayment(order: Order, method: PaymentMethod, reference = "") {
  const due = order.total - paidSoFar(order.id);
  if (due > 0) recordTransaction({ orderId: order.id, orderRef: order.ref, type: "payment", method, amount: due, status: "succeeded", reference });
}

/**
 * Records money taken against an order (gaps M2, S2). The amount defaults to
 * what is still due and can never be more; a part payment leaves the order
 * "part paid" with its balance showing. A cancelled order takes no money:
 * its stock has gone back on the shelf, so the sale is recorded afresh.
 */
export function settlePayment(order: Order, { method, reference = "", amount }: { method: PaymentMethod; reference?: string; amount?: number }, by: string) {
  if (order.status === "cancelled") throw new ApiError("This order was cancelled and its pieces went back on the shelf. Record a new sale instead.", 409);
  const due = order.total - paidSoFar(order.id);
  if (due <= 0) throw new ApiError("This order is already paid in full.", 409);
  const take = amount === undefined ? due : Math.round(amount);
  if (!(take > 0)) throw new ApiError("Enter the amount taken.", 422);
  if (take > due) throw new ApiError(`That is more than the ${due.toLocaleString("en-UG")} UGX still due.`, 422);
  recordTransaction({ orderId: order.id, orderRef: order.ref, type: "payment", method, amount: take, status: "succeeded", reference });
  const full = take === due;
  const now = new Date().toISOString();
  if (full && order.status === "pending") notifyCustomer(order, "paid");
  return orders.update(order.id, {
    paymentStatus: full ? "paid" : "part_paid",
    payment: method,
    status: full && order.status === "pending" ? "paid" : order.status,
    history: full && order.status === "pending" ? [...order.history, { status: "paid", at: now, by, note: reference }] : order.history,
  })!;
}

// Each step is checked against NEXT_STATUS by the screens; the service applies it, restores stock on a cancel, and tells the customer.
export function updateOrderStatus(id: Id, status: OrderStatus, note?: string) {
  return mockApi(() => {
    // Marking paid by hand records money, so it needs the payment permission.
    const admin = assertCan("orders", status === "paid" ? "payment" : "edit");
    const order = find(id);
    if (order.status === status) return order;
    if (status === "paid") ensurePayment(order, order.payment);
    const updated = orders.update(id, {
      status,
      paymentStatus: status === "paid" ? "paid" : order.paymentStatus,
      history: [...order.history, { status, at: new Date().toISOString(), by: admin.name, note }],
    })!;
    notifyCustomer(updated, status);
    logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref} marked ${status.replace(/_/g, " ")}` });
    return updated;
  });
}

/** Payment confirmed by staff (mobile money on their phone, cash in the showroom), in full or in part. */
export function markOrderPaid(id: Id, { method, reference, amount }: { method: PaymentMethod; reference: string; amount?: number }) {
  return mockApi(() => {
    const admin = assertCan("orders", "payment");
    const order = find(id);
    const updated = settlePayment(order, { method, reference, amount }, admin.name);
    logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref}: payment of ${(amount ?? order.total).toLocaleString("en-UG")} UGX recorded (${method})` });
    return updated;
  });
}

// Staff notes are private to the dashboard and signed with the staff member's name.
export function addOrderNote(id: Id, text: string) {
  return mockApi(() => {
    const admin = assertCan("orders", "edit");
    const order = find(id);
    if (!text.trim()) throw new ApiError("Write the note first.", 422);
    const note = { id: `note_${Date.now().toString(36)}`, text: text.trim(), by: admin.name, at: new Date().toISOString() };
    return orders.update(id, { notes: [...order.notes, note] })!;
  });
}
