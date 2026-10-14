/* Orders Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { createCollection } from "../store/collectionStore";
import type { Order, OrderStatus } from "../types";
import { orderSeed } from "@/data/orders";

/**
 * Every order, guest or signed in. Checkout writes here (checkoutApi), the
 * customer reads their own, a guest tracks one by reference and phone, and
 * the admin moves it through its statuses.
 */
export const orders = createCollection<Order>("orders", orderSeed as Order[], { idPrefix: "ord" });

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

export function updateOrderStatus(id: Id, status: OrderStatus) {
  return mockApi(() => orders.update(id, { status }));
}
