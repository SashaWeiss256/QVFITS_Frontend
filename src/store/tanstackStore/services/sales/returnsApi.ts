/* Returns And Exchanges Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { readSettings } from "../content/settingsApi";
import type { Order, ReturnRequest, ReturnStatus } from "../types";

/**
 * A shopper asks from their order page (or staff log it from WhatsApp); the
 * admin approves, receives the pieces, then refunds or exchanges. On the API:
 * receiving puts the stock back once, a refund records the money going out,
 * and returned pieces are priced as they were sold, never as sent.
 */

const DAY = 86_400_000;

/** Whether an order can still be returned, and why not if it cannot. The API checks the same window. */
export function returnWindow(order: { status: string; history?: { status: string; at: string }[]; createdAt: string }) {
  if (order.status !== "delivered") return { open: false, reason: "Returns open once the order is delivered." };
  const delivered = order.history?.findLast((h) => h.status === "delivered")?.at ?? order.createdAt;
  const days = readSettings().exchangeDays;
  const open = Date.now() - Date.parse(delivered) <= days * DAY;
  return { open, reason: open ? "" : `The ${days}-day window for this order has closed. Message us and we will see what we can do.` };
}

type ReturnInput = Pick<ReturnRequest, "orderId" | "lines" | "reason" | "resolution">;

// Only what the API reads from a returned line; it prices each piece from the order.
const asked = (lines: ReturnInput["lines"]) => lines.map(({ productId, size, color, qty }) => ({ productId, size, color, qty }));

/* Customer (realm: customer) */

export function requestReturn(_customerId: Id, input: ReturnInput) {
  return http.post<ReturnRequest>(routes.account.returns, { ...input, lines: asked(input.lines) }, { realm: "customer" });
}

/** A guest's request from Track an order: the reference and the phone on the order prove it is theirs. */
export function requestGuestReturn(ref: string, phone: string, input: Omit<ReturnInput, "orderId">) {
  return http.post<ReturnRequest>(routes.guestOrders.return, { ref, phone, ...input, lines: asked(input.lines) });
}

// A shopper sees only the returns on their own account.
export function listMyReturns(_customerId: Id, { signal }: RequestOptions = {}) {
  return http.get<ReturnRequest[]>(routes.account.returns, { realm: "customer", signal });
}

/* Admin (realm: admin) */

const ADMIN = { realm: "admin" } as const;

/** Each open request carries `refundDue`, worked out by the API from what was actually paid. */
export const listReturns = ({ signal }: RequestOptions = {}) => http.get<(ReturnRequest & { refundDue?: number })[]>(routes.adminSales.returns, { ...ADMIN, signal });

/** Staff open a return for a customer at the counter or on the phone; the window doesn't stop staff. */
export async function openReturn(input: ReturnInput) {
  const ret = await http.post<ReturnRequest>(routes.adminSales.returns, { ...input, lines: asked(input.lines) }, ADMIN);
  logActivity({ module: "orders", action: "create", entityId: ret.id, summary: `Opened a return on ${ret.orderRef}` });
  return ret;
}

/**
 * What a return would give back: each returned piece's price less its share
 * of the discount and kit saving, never more than was paid. The API works it
 * out (it sees the payments) and sends it with the request.
 */
export function refundDue(ret: ReturnRequest & { refundDue?: number }, _order: Order) {
  return ret.refundDue ?? 0;
}

/** What each status can move to. The API enforces the same. */
export const NEXT_RETURN_STATUS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ["approved", "rejected"],
  approved: ["received", "rejected"],
  received: ["refunded", "exchanged"],
  rejected: [],
  refunded: [],
  exchanged: [],
};

// A refund moves money, so it needs the refund permission; a lower amount needs a reason.
export async function updateReturnStatus(id: Id, status: ReturnStatus, note?: string, amount?: number) {
  const ret = await http.patch<ReturnRequest>(`${routes.adminSales.returns}/${id}/status`, { status, note, amount }, ADMIN);
  logActivity({ module: "orders", action: "update", entityId: id, summary: status === "refunded" ? `Refunded on ${ret.orderRef}` : `Return on ${ret.orderRef} marked ${status}` });
  return ret;
}
