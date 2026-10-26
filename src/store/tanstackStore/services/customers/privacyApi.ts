/* Customer Privacy Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { logout } from "../auth/customerAuthApi";

/**
 * Uganda's Data Protection and Privacy Act 2019 (gap A6): a customer can
 * download what the shop holds about them, and close their account. The API
 * keeps orders for the books but no longer names the person, and deletes the
 * newsletter record for the address, consent history included.
 */

// Everything held about the shopper in one file: their profile, orders and returns, and their newsletter consent.
export async function downloadMyData(_customerId: Id) {
  const [data, newsletter] = await Promise.all([
    http.get<Record<string, unknown>>(routes.account.export, { realm: "customer" }),
    http.get<string | null>(routes.newsletter.mine, { realm: "customer" }),
  ]);
  return { ...data, newsletter };
}

// Orders stay for the books, without the name or contact details; then the shopper is signed out.
export async function deleteMyAccount(_customerId: Id) {
  await http.del(routes.account.profile, { realm: "customer" });
  await logout().catch(() => {});
}

/** Staff carry out a request made by phone or in the showroom. */
export async function eraseCustomer(customerId: Id) {
  await http.del(`${routes.adminSales.customers}/${customerId}`, { realm: "admin" });
  logActivity({ module: "customers", action: "delete", entityId: customerId, summary: "Closed a customer's account at their request" });
}
