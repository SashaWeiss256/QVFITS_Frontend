/* Customer Privacy Service */
import { mockApi } from "../api/mock";
import type { Id } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { logout } from "../auth/customerAuthApi";
import { subscribers } from "../marketing/subscribersApi";
import { orders } from "../sales/ordersApi";
import { customers, eraseCustomerRecord, exportCustomerData } from "./customersApi";

/**
 * Uganda's Data Protection and Privacy Act 2019 (gap A6): a customer can
 * download what the shop holds about them, and close their account. Orders
 * are kept for the books but no longer name the person.
 */
function anonymise(customerId: Id) {
  for (const o of orders.list().filter((x) => x.customerId === customerId)) {
    orders.update(o.id, { customerId: undefined, name: "Closed account", phone: "", email: undefined, address: undefined, note: undefined });
  }
}

function eraseSubscription(email?: string) {
  const s = subscribers.list().find((x) => x.email === email);
  if (s) subscribers.remove(s.id);
}

export function downloadMyData(customerId: Id) {
  return mockApi(() => {
    const email = customers.get(customerId)?.email;
    return exportCustomerData(customerId, {
      orders: orders.list().filter((o) => o.customerId === customerId),
      newsletter: subscribers.list().find((s) => s.email === email) ?? null,
    });
  }, 300);
}

export async function deleteMyAccount(customerId: Id) {
  await mockApi(() => {
    const email = customers.get(customerId)?.email;
    eraseCustomerRecord(customerId, anonymise);
    eraseSubscription(email);
  }, 400);
  await logout();
}

/** Staff carry out a request made by phone or in the showroom. */
export function eraseCustomer(customerId: Id) {
  return mockApi(() => {
    assertCan("customers", "delete");
    const c = customers.get(customerId);
    eraseCustomerRecord(customerId, anonymise);
    eraseSubscription(c?.email);
    logActivity({ module: "customers", action: "delete", entityId: customerId, summary: `Closed ${c?.name ?? "a customer"}'s account at their request` });
  });
}
