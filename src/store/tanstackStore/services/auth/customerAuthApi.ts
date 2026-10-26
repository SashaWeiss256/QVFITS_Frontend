/* Customer Auth Service (realm: customer) */
import { http, setRefresher } from "../api/client";
import type { Guard } from "../api/guard";
import { routes } from "../api/routes";
import { accessToken, clearAccessToken, isRemembered, setAccessToken } from "../api/tokens";
import type { Customer } from "../types";
import { rememberDemoLink } from "../notifications/outboxApi";

/**
 * Shopper accounts on the API (auth/customer/*). The access token lives in
 * the tab, or in the browser when they stay signed in; the refresh token is
 * an httpOnly cookie the API sets. Signing up or in joins earlier guest
 * orders with the same email or phone to the account. Emails (confirm the
 * address, reset the password) wait in the outbox until an email service is
 * connected.
 */

interface CustomerSession {
  customer: Customer;
  accessToken: string;
  /** Outside production: the emailed link, so the flow can be tried without an inbox. */
  devLink?: string;
}

const AUTH = { realm: "customer", noRefresh: true } as const;

function begin({ customer, accessToken: token }: CustomerSession, remember: boolean) {
  setAccessToken("customer", token, { remember });
  return customer;
}

// An expired access token is renewed from the cookie, kept where the session already was.
setRefresher("customer", async () => {
  try {
    begin(await http.post<CustomerSession>(routes.customerAuth.refresh, undefined, AUTH), isRemembered("customer"));
    return true;
  } catch {
    return false;
  }
});

export async function login({ email, password, remember = true }: { email: string; password: string; remember?: boolean }) {
  return begin(await http.post<CustomerSession>(routes.customerAuth.login, { email, password, remember }, AUTH), remember);
}

// Signing up sends the confirmation email and signs the shopper in at once.
export async function signup({ name, email, password, phone, remember = true, guard }: { name: string; email: string; password: string; phone?: string; remember?: boolean; guard?: Guard }) {
  const session = await http.post<CustomerSession>(routes.customerAuth.signup, { name, email, password, phone: phone || undefined, remember, guard }, AUTH);
  if (session.devLink) rememberDemoLink(session.customer.email, "account-confirm", session.devLink);
  return begin(session, remember);
}

/** The sign-up email's link: the address is theirs. */
export function confirmEmail(token: string) {
  return http.post<Customer>(routes.customerAuth.confirmEmail, { token }, AUTH);
}

/**
 * A reset link by email, valid for an hour. The answer is the same whether or
 * not the address has an account, so nobody can use the form to find out who shops here.
 */
export async function requestPasswordReset(email: string, guard?: Guard) {
  const out = await http.post<{ sent: true; email: string; devLink?: string }>(routes.customerAuth.forgotPassword, { email, guard }, AUTH);
  if (out.devLink) rememberDemoLink(out.email, "password-reset", out.devLink);
  return { sent: out.sent, email: out.email };
}

// A used or expired link (one hour) is refused with a 410; a reset signs every device out.
export function resetPassword(token: string, password: string) {
  return http.post<{ email: string }>(routes.customerAuth.resetPassword, { token, password }, AUTH);
}

/** Who is signed in: nobody without a token; otherwise the API says (renewing an expired token first). */
export async function currentCustomer() {
  if (!accessToken("customer")) return null;
  try {
    return await http.get<Customer>(routes.customerAuth.me, { realm: "customer" });
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await http.post(routes.customerAuth.logout, undefined, AUTH);
  } finally {
    // Signed out here even if the server couldn't be reached.
    clearAccessToken("customer");
  }
}
