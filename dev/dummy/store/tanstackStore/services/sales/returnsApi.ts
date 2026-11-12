/* Returns And Exchanges Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { moveStock } from "../catalog/productsApi";
import { readSettings } from "../content/settingsApi";
import { createCollection } from "../store/collectionStore";
import type { Order, ReturnRequest, ReturnStatus } from "../types";
import { notifyCustomer, orders } from "./ordersApi";
import { recordTransaction, transactions } from "./transactionsApi";
import returnSeed from "@/data/returns.json";

/**
 * A shopper asks from their order page (or staff log it from WhatsApp); the
 * admin approves, receives the pieces, then refunds or exchanges. Receiving
 * puts the stock back; a refund records the money going out.
 */
const returns = createCollection<ReturnRequest>("returns", returnSeed as ReturnRequest[], { idPrefix: "ret" });

const DAY = 86_400_000;

/** Whether an order can still be returned, and why not if it cannot. */
export function returnWindow(order: { status: string; history?: { status: string; at: string }[]; createdAt: string }) {
  if (order.status !== "delivered") return { open: false, reason: "Returns open once the order is delivered." };
  const delivered = order.history?.findLast((h) => h.status === "delivered")?.at ?? order.createdAt;
  const days = readSettings().exchangeDays;
  const open = Date.now() - Date.parse(delivered) <= days * DAY;
  return { open, reason: open ? "" : `The ${days}-day window for this order has closed. Message us and we will see what we can do.` };
}

type ReturnInput = Pick<ReturnRequest, "orderId" | "lines" | "reason" | "resolution">;

/** One request per order at a time; the lines must be on the order. */
function createReturn(order: Order, input: ReturnInput, extra: Partial<ReturnRequest> = {}) {
  if (!input.lines.length) throw new ApiError("Pick at least one piece to return.", 422);
  if (returns.list().some((r) => r.orderId === order.id && !["rejected", "refunded", "exchanged"].includes(r.status))) {
    throw new ApiError("There is already an open request for this order.", 409);
  }
  const now = new Date().toISOString();
  return returns.create({ ...input, orderRef: order.ref, customerId: order.customerId, name: order.name, status: "requested", createdAt: now, updatedAt: now, ...extra });
}

/* Customer (realm: customer) */

export function requestReturn(customerId: Id, input: ReturnInput) {
  return mockApi(() => {
    const order = orders.get(input.orderId);
    if (!order || order.customerId !== customerId) throw new ApiError("We could not find that order.", 404);
    const window = returnWindow(order);
    if (!window.open) throw new ApiError(window.reason, 422);
    return createReturn(order, input);
  }, 300);
}

/** A guest's request from Track an order: the reference and the phone on the order prove it is theirs. */
export function requestGuestReturn(ref: string, phone: string, input: Omit<ReturnInput, "orderId">) {
  return mockApi(() => {
    const digits = (s: string) => s.replace(/\D/g, "").slice(-9);
    const order = orders.list().find((o) => o.ref.toUpperCase() === ref.trim().toUpperCase() && digits(o.phone) === digits(phone));
    if (!order) throw new ApiError("We could not find an order with that reference and phone number.", 404);
    const window = returnWindow(order);
    if (!window.open) throw new ApiError(window.reason, 422);
    return createReturn(order, { ...input, orderId: order.id });
  }, 300);
}

// A shopper sees only the returns on their own account.
export function listMyReturns(customerId: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => returns.list().filter((r) => r.customerId === customerId), 150, signal);
}

/* Admin (realm: admin) */

export const listReturns = ({ signal }: RequestOptions = {}) => mockApi(() => returns.list(), 150, signal);

/**
 * Staff open a return for a customer at the counter or on the phone. The
 * window doesn't stop staff: they decide, and the request says who opened it.
 */
export function openReturn(input: ReturnInput) {
  return mockApi(() => {
    const admin = assertCan("orders", "edit");
    const order = orders.get(input.orderId);
    if (!order) throw new ApiError("That order no longer exists.", 404);
    if (!["delivered", "exchanged"].includes(order.status)) throw new ApiError("Returns open once the order is delivered.", 422);
    const ret = createReturn(order, input, { status: "approved", note: `Opened by ${admin.name}` });
    logActivity({ module: "orders", action: "create", entityId: ret.id, summary: `Opened a return on ${order.ref}` });
    return ret;
  });
}

/**
 * What a return should give back (gap M1): each returned piece's price less
 * its share of the order's discount and kit saving, spread by value, so a
 * code is never refunded twice. Delivery comes back only when the whole
 * order is returned as faulty. Never more than is left of what was paid.
 */
export function refundDue(ret: ReturnRequest, order: Order) {
  const goods = ret.lines.reduce((n, l) => n + l.price * l.qty, 0);
  const off = (order.discount ?? 0) + (order.kitSaving ?? 0);
  const share = order.subtotal ? Math.round((off * goods) / order.subtotal) : 0;
  const whole = ret.lines.reduce((n, l) => n + l.qty, 0) === order.lines.reduce((n, l) => n + l.qty, 0);
  const delivery = whole && /faulty|damaged/i.test(ret.reason) ? order.delivery : 0;
  const paid = transactions.list().filter((t) => t.orderId === order.id && t.status === "succeeded").reduce((n, t) => n + (t.type === "refund" ? -t.amount : t.amount), 0);
  return Math.max(0, Math.min(goods - share + delivery, paid));
}

/** What each status can move to. */
export const NEXT_RETURN_STATUS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["received", "rejected"],
  received: ["refunded", "exchanged"],
  rejected: [],
  refunded: [],
  exchanged: [],
};

// Moves a return along its allowed path. Marking it refunded records the money out, at the amount due unless staff lower it with a reason.
export function updateReturnStatus(id: Id, status: ReturnStatus, note?: string, amount?: number) {
  return mockApi(() => {
    // A refund moves money, so it has its own permission (gap M3).
    assertCan("orders", status === "refunded" ? "refund" : "edit");
    const ret = returns.get(id);
    if (!ret) throw new ApiError("That request no longer exists.", 404);
    if (!NEXT_RETURN_STATUS[ret.status].includes(status)) throw new ApiError(`A ${ret.status} request cannot be marked ${status}.`, 409);
    const order = orders.get(ret.orderId);
    let refunded = 0;

    if (status === "received") ret.lines.forEach((l) => moveStock(l.productId, l.color, l.size, l.qty, "return", ret.orderRef));
    if (status === "refunded" && order) {
      const due = refundDue(ret, order);
      const give = amount === undefined ? due : Math.round(amount);
      if (give > due) throw new ApiError(`The most this return can refund is ${due.toLocaleString("en-UG")} UGX.`, 422);
      if (give < due && !note?.trim()) throw new ApiError("Say why the refund is less than the full amount.", 422);
      recordTransaction({ orderId: order.id, orderRef: order.ref, type: "refund", method: order.payment, amount: give, status: "succeeded", reference: note ?? "" });
      refunded = give;
      notifyCustomer(order, "refunded", `${give.toLocaleString("en-UG")} UGX to your ${order.payment === "cash" ? "hand at the showroom" : "mobile money"}.`);
      const all = ret.lines.reduce((n, l) => n + l.qty, 0) === order.lines.reduce((n, l) => n + l.qty, 0);
      orders.update(order.id, { paymentStatus: all ? "refunded" : "partially_refunded", status: all ? "refunded" : order.status });
    }
    if (status === "exchanged" && order) orders.update(order.id, { status: "exchanged" });

    const updated = returns.update(id, { status, note: note ?? ret.note, updatedAt: new Date().toISOString() })!;
    logActivity({ module: "orders", action: "update", entityId: id, summary: status === "refunded" ? `Refunded ${refunded.toLocaleString("en-UG")} UGX on ${ret.orderRef}` : `Return on ${ret.orderRef} marked ${status}` });
    return updated;
  });
}
