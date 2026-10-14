/* Customers Service */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { createCollection } from "../store/collectionStore";
import type { Address, Customer } from "../types";
import { customerSeed } from "@/data/customers";

/** A stored customer. The password is a mock-only field; the API hashes it. */
export type CustomerRecord = Customer & { password?: string };

export const customers = createCollection<CustomerRecord>("customers", customerSeed as CustomerRecord[], { idPrefix: "cus" });

/** A customer as the UI sees it: never the password. */
export function publicCustomer({ password: _password, ...customer }: CustomerRecord): Customer {
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

/* Admin (realm: admin) */

export function listCustomers({ signal }: RequestOptions = {}) {
  return mockApi(() => customers.list().map(publicCustomer), 200, signal);
}
