/* Customers Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { Address, CartLine, Customer } from "../types";
import customerSeed from "@/data/customers.json";

/** A stored customer. The password is a mock-only field; the API hashes it. */
export type CustomerRecord = Customer & { password?: string; resetToken?: string | null; resetExpires?: number | null; confirmToken?: string | null };

export const customers = createCollection<CustomerRecord>("customers", customerSeed as CustomerRecord[], { idPrefix: "cus" });

/** A customer as the UI sees it: never the password. */
export function publicCustomer({ password: _password, resetToken: _r, resetExpires: _e, confirmToken: _c, ...customer }: CustomerRecord): Customer {
  return customer;
}

function find(id: Id) {
  const customer = customers.get(id);
  if (!customer) throw new ApiError("We could not find your account.", 404);
  return customer;
}

/* Customer (realm: customer) */

export function getProfile(id: Id, { signal }: RequestOptions = {}) {
  return mockApi(() => publicCustomer(find(id)), 150, signal);
}

export function updateProfile(id: Id, patch: Pick<Partial<Customer>, "name" | "phone">) {
  return mockApi(() => publicCustomer(customers.update(id, patch) ?? find(id)));
}

export function saveAddresses(id: Id, addresses: Address[]) {
  return mockApi(() => publicCustomer(customers.update(id, { addresses }) ?? find(id)));
}

export function saveWishlist(id: Id, wishlist: Id[]) {
  return mockApi(() => publicCustomer(customers.update(id, { wishlist }) ?? find(id)), 100);
}

/** The bag and the recently viewed list follow the account, so another device has them too. */
export function saveBag(id: Id, bag: CartLine[]) {
  return mockApi(() => publicCustomer(customers.update(id, { bag }) ?? find(id)), 100);
}

export function saveRecentlyViewed(id: Id, recentlyViewed: Id[]) {
  return mockApi(() => publicCustomer(customers.update(id, { recentlyViewed }) ?? find(id)), 100);
}

/* Privacy (gap A6) */

/**
 * Everything the shop holds about a customer, as one file they can keep:
 * their profile, addresses, saved pieces, orders and newsletter consent.
 * The lookups for orders and the newsletter are passed in so this file
 * doesn't import them (they import customers).
 */
export function exportCustomerData(id: Id, extra: { orders: unknown[]; newsletter: unknown }) {
  const c = publicCustomer(find(id));
  return { exportedAt: new Date().toISOString(), account: c, orders: extra.orders, newsletter: extra.newsletter };
}

/**
 * Closes an account. Orders stay for the shop's books (the law needs them)
 * but lose the person: name, phone, email and address are blanked.
 */
export function eraseCustomerRecord(id: Id, anonymiseOrders: (customerId: Id) => void) {
  find(id);
  anonymiseOrders(id);
  customers.remove(id);
}

/* Admin (realm: admin) */

export function listCustomers({ signal }: RequestOptions = {}) {
  return mockApi(() => customers.list().map(publicCustomer), 200, signal);
}

// Staff edit notes and tags only; the shopper owns their name and addresses.
const crud = adminCrud(customers, {
  module: "customers",
  noun: "customer",
  label: (c) => c.name,
  prepare: (data) => ({ ...(data.notes !== undefined && { notes: data.notes }), ...(data.tags !== undefined && { tags: data.tags }) }),
});

export const updateCustomer = (id: Id, patch: Pick<Partial<Customer>, "notes" | "tags">) => crud.update(id, patch).then(publicCustomer);
export const removeCustomer = crud.remove;
