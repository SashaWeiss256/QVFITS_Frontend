/* Customer Auth Service (realm: customer) */
import { ApiError, mockApi } from "../api/mock";
import { accessToken, clearAccessToken, setAccessToken } from "../api/tokens";
import type { Customer } from "../types";
import { customers, publicCustomer } from "../customers/customersApi";

/**
 * Shopper accounts. Mock mode only: passwords are checked against the
 * collection store and the token is a fake. qvfits-api replaces all of this
 * with `auth/customer/*` (docs/05-backend-integration.md).
 */

const SESSION = "qvfits:mock:customer";
const normal = (email: string) => String(email).trim().toLowerCase();

function startSession(customer: Customer) {
  sessionStorage.setItem(SESSION, customer.id);
  setAccessToken("customer", `mock.customer.${customer.id}.${Date.now().toString(36)}`);
  return customer;
}

export function login({ email, password }: { email: string; password: string }) {
  return mockApi(() => {
    const record = customers.list().find((c) => c.email === normal(email) && c.password === password);
    if (!record) throw new ApiError("Email or password is incorrect.", 401);
    return startSession(publicCustomer(record));
  }, 400);
}

export function signup({ name, email, password, phone }: { name: string; email: string; password: string; phone?: string }) {
  return mockApi(() => {
    if (customers.list().some((c) => c.email === normal(email))) {
      throw new ApiError("An account with that email already exists. Sign in instead.", 409);
    }
    const record = customers.create({
      name: name.trim(),
      email: normal(email),
      phone,
      password,
      addresses: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
    });
    return startSession(publicCustomer(record));
  }, 500);
}

/** Honest seam: no email is sent until the API can send one. */
export function requestPasswordReset(_email: string) {
  return mockApi(() => ({ sent: false as const }), 400);
}

export function currentCustomer() {
  return mockApi(() => {
    if (!accessToken("customer")) return null;
    const record = customers.get(sessionStorage.getItem(SESSION) ?? "");
    return record ? publicCustomer(record) : null;
  }, 0);
}

export function logout() {
  return mockApi(() => {
    clearAccessToken("customer");
    sessionStorage.removeItem(SESSION);
  }, 0);
}
