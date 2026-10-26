/* Customers Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { Address, CartLine, Customer } from "../types";

/**
 * Shopper accounts on the API. A shopper reads and changes only their own
 * (realm: customer; the id arguments are kept so callers stay the same, the
 * API uses the signed-in account). Staff see everyone and may change only
 * their private notes and tags (realm: admin).
 */

const ME = { realm: "customer" } as const;
const A = routes.account;

/* Customer (realm: customer) */

export function getProfile(_id: Id, { signal }: RequestOptions = {}) {
  return http.get<Customer>(A.profile, { ...ME, signal });
}

// A shopper changes only their name and phone here; email changes go through a confirmation.
export function updateProfile(_id: Id, patch: Pick<Partial<Customer>, "name" | "phone">) {
  return http.patch<Customer>(A.profile, patch, ME);
}

export function saveAddresses(_id: Id, addresses: Address[]) {
  return http.put<Customer>(A.addresses, { addresses }, ME);
}

export function saveWishlist(_id: Id, wishlist: Id[]) {
  return http.put<Customer>(A.wishlist, { wishlist }, ME);
}

/** The bag and the recently viewed list follow the account, so another device has them too. */
export function saveBag(_id: Id, bag: CartLine[]) {
  return http.put<Customer>(A.bag, { bag }, ME);
}

export function saveRecentlyViewed(_id: Id, recentlyViewed: Id[]) {
  return http.put<Customer>(A.recentlyViewed, { recentlyViewed }, ME);
}

/* Admin (realm: admin) */

const ADMIN = { realm: "admin" } as const;

export function listCustomers({ signal }: RequestOptions = {}) {
  return http.get<Customer[]>(routes.adminSales.customers, { ...ADMIN, signal });
}

// Staff may change only the private notes and tags, never the shopper's own details.
export async function updateCustomer(id: Id, patch: Pick<Partial<Customer>, "notes" | "tags">) {
  const { notes, tags } = patch;
  const customer = await http.patch<Customer>(`${routes.adminSales.customers}/${id}`, { notes, tags }, ADMIN);
  logActivity({ module: "customers", action: "update", entityId: id, summary: `Updated customer ${customer.name}` });
  return customer;
}
