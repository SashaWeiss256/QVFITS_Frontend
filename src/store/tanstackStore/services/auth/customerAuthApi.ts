/* Customer Auth Service (realm: customer) */
import { ApiError, mockApi } from "../api/mock";
import { assertHuman, type Guard } from "../api/guard";
import { accessToken, clearAccessToken, sessionStore, setAccessToken } from "../api/tokens";
import type { Customer } from "../types";
import { customers, publicCustomer, type CustomerRecord } from "../customers/customersApi";
import { queueEmail } from "../notifications/outboxApi";
import { orders } from "../sales/ordersApi";

/**
 * Shopper accounts. Mock mode only: passwords are checked against the
 * collection store and the token is a fake. qvfits-api replaces all of this
 * with `auth/customer/*` (docs/05-backend-integration.md). Emails (confirm
 * the address, reset the password) wait in the admin's outbox until an
 * email service is connected.
 */

const SESSION = "qvfits:mock:customer";
const normal = (email: string) => String(email).trim().toLowerCase();
const digits = (phone?: string) => (phone ?? "").replace(/\D/g, "").slice(-9);
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
const HOUR = 3_600_000;
const RESET_COOLDOWN = 60_000;

function startSession(customer: Customer, remember: boolean) {
  window.sessionStorage.removeItem(SESSION);
  window.localStorage.removeItem(SESSION);
  sessionStore("customer", remember).setItem(SESSION, customer.id);
  setAccessToken("customer", `mock.customer.${customer.id}.${Date.now().toString(36)}`, { remember });
  return customer;
}

/**
 * Orders placed as a guest with the same email or phone join the account
 * (gap O3), so a shopper who signs up later sees everything they bought.
 */
function claimGuestOrders(c: CustomerRecord) {
  for (const o of orders.list()) {
    if (o.customerId) continue;
    if ((o.email && normal(o.email) === c.email) || (c.phone && digits(o.phone) === digits(c.phone))) orders.update(o.id, { customerId: c.id });
  }
}

function sendConfirm(c: CustomerRecord) {
  const t = token();
  customers.update(c.id, { confirmToken: t });
  queueEmail({ to: c.email, kind: "account-confirm", subject: "Confirm your QVFITS account", body: `Hi ${c.name.split(" ")[0]}, tap to confirm this is your email.`, link: `/account/confirm?token=${t}` });
}

export function login({ email, password, remember = true }: { email: string; password: string; remember?: boolean }) {
  return mockApi(() => {
    const record = customers.list().find((c) => c.email === normal(email) && c.password === password);
    if (!record) throw new ApiError("Email or password is incorrect.", 401);
    claimGuestOrders(record);
    return startSession(publicCustomer(record), remember);
  }, 400);
}

export function signup({ name, email, password, phone, remember = true, guard }: { name: string; email: string; password: string; phone?: string; remember?: boolean; guard?: Guard }) {
  return mockApi(() => {
    assertHuman(guard);
    if (customers.list().some((c) => c.email === normal(email))) {
      throw new ApiError("An account with that email already exists. Sign in instead.", 409);
    }
    // One account per phone, so order history and one-per-shopper codes stay with one person (gap A5).
    if (phone && customers.list().some((c) => c.phone && digits(c.phone) === digits(phone))) {
      throw new ApiError("An account already uses that phone number. Sign in, or reset its password.", 409);
    }
    const record = customers.create({
      name: name.trim(),
      email: normal(email),
      phone,
      password,
      addresses: [],
      wishlist: [],
      emailConfirmedAt: null,
      createdAt: new Date().toISOString(),
    });
    claimGuestOrders(record);
    sendConfirm(record);
    return startSession(publicCustomer(record), remember);
  }, 500);
}

/** The sign-up email's link: the address is theirs. */
export function confirmEmail(t: string) {
  return mockApi(() => {
    const record = customers.list().find((c) => c.confirmToken === t);
    if (!record) throw new ApiError("That link isn't valid any more. Sign in and we'll send a new one.", 404);
    return publicCustomer(customers.update(record.id, { emailConfirmedAt: new Date().toISOString(), confirmToken: null })!);
  }, 200);
}

/**
 * A reset link by email, valid for an hour (gap A1). The answer is the same
 * whether or not the address has an account, so nobody can use the form to
 * find out who shops here.
 */
export function requestPasswordReset(email: string, guard?: Guard) {
  return mockApi(() => {
    assertHuman(guard);
    const record = customers.list().find((c) => c.email === normal(email));
    if (record && !(record.resetExpires && record.resetExpires - HOUR + RESET_COOLDOWN > Date.now())) {
      const t = token();
      customers.update(record.id, { resetToken: t, resetExpires: Date.now() + HOUR });
      queueEmail({ to: record.email, kind: "password-reset", subject: "Reset your QVFITS password", body: "Tap to choose a new password. The link works for an hour. If you didn't ask, ignore this email.", link: `/reset-password?token=${t}` });
    }
    return { sent: true as const, email: normal(email) };
  }, 400);
}

export function resetPassword(t: string, password: string) {
  return mockApi(() => {
    if (password.length < 8) throw new ApiError("Use at least 8 characters.", 422);
    const record = customers.list().find((c) => c.resetToken === t);
    if (!record || !record.resetExpires || record.resetExpires < Date.now()) throw new ApiError("That link has expired. Ask for a new one.", 410);
    customers.update(record.id, { password, resetToken: null, resetExpires: null });
    return { email: record.email };
  }, 300);
}

export function currentCustomer() {
  return mockApi(() => {
    if (!accessToken("customer")) return null;
    const id = window.sessionStorage.getItem(SESSION) ?? window.localStorage.getItem(SESSION) ?? "";
    const record = customers.get(id);
    return record ? publicCustomer(record) : null;
  }, 0);
}

export function logout() {
  return mockApi(() => {
    clearAccessToken("customer");
    window.sessionStorage.removeItem(SESSION);
    window.localStorage.removeItem(SESSION);
  }, 0);
}
