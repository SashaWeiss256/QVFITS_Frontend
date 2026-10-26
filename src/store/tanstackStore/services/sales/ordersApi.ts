/* Orders Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { Order, OrderStatus, OutboxEmail, PaymentMethod } from "../types";

/**
 * Every order, guest or signed in, on the API. Checkout writes them
 * (checkoutApi), the customer reads their own, a guest tracks one by
 * reference and phone, and the admin moves it through its statuses with a
 * timeline of who did what. The API takes stock when an order is placed,
 * puts it back when one is cancelled or expires unpaid, and tells the
 * customer at each step (the outbox, until an email service is connected).
 */

const ADMIN = { realm: "admin" } as const;
const ME = { realm: "customer" } as const;
const G = routes.guestOrders;
const S = routes.adminSales;

/* Guests */

// Reference plus phone is the only key a guest has, so a wrong pair gets the same answer as an unknown order.
export function trackOrder(ref: string, phone: string, { signal }: RequestOptions = {}) {
  return http.post<Order>(G.track, { ref, phone }, { signal });
}

// A guest proves the order is theirs with its reference and the phone number it was placed with.
export function cancelGuestOrder(ref: string, phone: string) {
  return http.post<Order>(G.cancel, { ref, phone });
}

/* Customer (realm: customer) */

export function listMyOrders(_customerId: Id, { signal }: RequestOptions = {}) {
  return http.get<Order[]>(routes.account.orders, { ...ME, signal });
}

export function getMyOrder(_customerId: Id, id: Id, { signal }: RequestOptions = {}) {
  return http.get<Order>(`${routes.account.orders}/${id}`, { ...ME, signal });
}

// A signed-in shopper may cancel only their own order, and only while nothing is paid.
export function cancelMyOrder(_customerId: Id, id: Id) {
  return http.post<Order>(`${routes.account.orders}/${id}/cancel`, undefined, ME);
}

/* Admin (realm: admin) */

/** The order an admin may move each status to. Delivered orders end there. The API enforces the same. */
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

export function listOrders({ signal }: RequestOptions = {}) {
  return http.get<Order[]>(S.orders, { ...ADMIN, signal });
}

/** The messages sent about one order, for the order drawer. */
export function listOrderEmails(ref: string, { signal }: RequestOptions = {}) {
  return http.get<OutboxEmail[]>(`${S.orders}/emails/${encodeURIComponent(ref)}`, { ...ADMIN, signal });
}

// Marking paid records what is still due (payment permission); cancelling puts the stock back.
export async function updateOrderStatus(id: Id, status: OrderStatus, note?: string) {
  const order = await http.patch<Order>(`${S.orders}/${id}/status`, { status, note }, ADMIN);
  logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref} marked ${status.replace(/_/g, " ")}` });
  return order;
}

/** Payment confirmed by staff (mobile money on their phone, cash in the showroom), in full or in part. */
export async function markOrderPaid(id: Id, { method, reference, amount }: { method: PaymentMethod; reference: string; amount?: number }) {
  const order = await http.post<Order>(`${S.orders}/${id}/payments`, { method, reference, amount }, ADMIN);
  logActivity({ module: "orders", action: "update", entityId: id, summary: `${order.ref}: payment of ${(amount ?? order.total).toLocaleString("en-UG")} UGX recorded (${method})` });
  return order;
}

// Staff notes are private to the dashboard and signed with the staff member's name.
export function addOrderNote(id: Id, text: string) {
  return http.post<Order>(`${S.orders}/${id}/notes`, { text }, ADMIN);
}
