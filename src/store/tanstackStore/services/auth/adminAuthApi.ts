/* Admin Auth Service (realm: admin) */
import { ApiError, mockApi } from "../api/mock";
import { accessToken, clearAccessToken, setAccessToken } from "../api/tokens";
import type { AdminUser } from "../types";
import { adminSeed } from "@/data/admins";

/**
 * The staff door, kept apart from shopper sign-in so 2FA and a stricter rate
 * limit can attach to it on the API. Mock mode only: the check reads a
 * development fixture and the token is a fake.
 */

const SESSION = "qvfits:mock:admin";

export function login({ email, password }: { email: string; password: string }) {
  return mockApi(() => {
    const record = (adminSeed as (AdminUser & { password: string })[]).find(
      (a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password,
    );
    if (!record) throw new ApiError("Email or password is incorrect.", 401);
    const { password: _password, ...admin } = record;
    sessionStorage.setItem(SESSION, JSON.stringify(admin));
    setAccessToken("admin", `mock.admin.${admin.id}.${Date.now().toString(36)}`);
    return admin as AdminUser;
  }, 400);
}

/** An invited team member sets their password. Live with the API's invites. */
export function acceptInvite(_input: { token: string; password: string }) {
  return mockApi<never>(() => {
    throw new ApiError("Invites start working when the shop's server is live.", 503);
  }, 300);
}

export function currentAdmin() {
  return mockApi<AdminUser | null>(() => {
    if (!accessToken("admin")) return null;
    const raw = sessionStorage.getItem(SESSION);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }, 0);
}

export function logout() {
  return mockApi(() => {
    clearAccessToken("admin");
    sessionStorage.removeItem(SESSION);
  }, 0);
}
