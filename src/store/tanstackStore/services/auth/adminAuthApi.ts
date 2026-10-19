/* Admin Auth Service (realm: admin) */
import { http, setRefresher } from "../api/client";
import { routes } from "../api/routes";
import { accessToken, clearAccessToken, onTokenChange, setAccessToken } from "../api/tokens";
import type { AdminUser } from "../types";
import { rememberAdmin } from "./adminSession";

/**
 * The staff door, kept apart from shopper sign-in so 2FA and a stricter rate
 * limit can attach to it on the API. The access token lives in the tab; the
 * refresh token is an httpOnly cookie the API sets and the browser sends.
 */

interface AdminSession {
  admin: AdminUser;
  accessToken: string;
}

const AUTH = { realm: "admin", noRefresh: true } as const;

function begin({ admin, accessToken: token }: AdminSession) {
  rememberAdmin(admin);
  setAccessToken("admin", token);
  return admin;
}

/** Swap the refresh cookie for a new access token. False means the session is over. */
async function renew() {
  try {
    begin(await http.post<AdminSession>(routes.adminAuth.refresh, undefined, AUTH));
    return true;
  } catch {
    return false;
  }
}

// An expired access token is renewed from the cookie before a request gives up.
setRefresher("admin", renew);

// However the token goes (sign-out, the idle timer, a refused refresh), the remembered admin goes with it.
onTokenChange((realm, token) => {
  if (realm === "admin" && !token) rememberAdmin(null);
});

/** Whether the shop still needs its first owner. */
export function setupStatus({ signal }: { signal?: AbortSignal } = {}) {
  return http.get<{ open: boolean }>(routes.adminAuth.setup, { signal });
}

/** The one-time registration: the first admin becomes the owner and is signed straight in. */
export async function setupOwner(input: { name: string; email: string; password: string }) {
  return begin(await http.post<AdminSession>(routes.adminAuth.setup, input, AUTH));
}

export async function login({ email, password }: { email: string; password: string }) {
  return begin(await http.post<AdminSession>(routes.adminAuth.login, { email, password }, AUTH));
}

/** An invited team member sets their password and is signed straight in. */
export async function acceptInvite({ token, password }: { token: string; password: string }) {
  return begin(await http.post<AdminSession>(routes.adminAuth.acceptInvite, { token, password }, AUTH));
}

/**
 * The signed-in admin, read fresh so a role change applies at once. A tab
 * with no token is signed out, even if another tab is signed in.
 */
export async function currentAdmin() {
  if (!accessToken("admin")) return null;
  try {
    const admin = await http.get<AdminUser>(routes.adminAuth.me, { realm: "admin" });
    rememberAdmin(admin);
    return admin;
  } catch {
    // The transport already tried a refresh and dropped the token if it failed.
    return null;
  }
}

export async function logout() {
  try {
    await http.post(routes.adminAuth.logout, undefined, AUTH);
  } finally {
    // Signed out here even if the server couldn't be reached.
    clearAccessToken("admin");
  }
}
