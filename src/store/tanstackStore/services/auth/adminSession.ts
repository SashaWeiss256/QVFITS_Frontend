/* Admin Session And Permissions */
import { ApiError } from "../api/mock";
import { accessToken } from "../api/tokens";
import type { AdminUser, PermissionAction } from "../types";

/**
 * Who is signed in to the admin, and what they may do. The API decides both;
 * the admin it returns at sign-in (and on every refresh) is kept here for the
 * tab, so the services still on mocks can refuse what the API will refuse.
 */
const SESSION = "qvfits:admin:user";

/** Keep the signed-in admin for this tab, or forget them with null. */
export function rememberAdmin(admin: AdminUser | null) {
  try {
    if (admin) sessionStorage.setItem(SESSION, JSON.stringify(admin));
    else sessionStorage.removeItem(SESSION);
  } catch {
    // Storage unavailable: services fall back to treating the tab as signed out.
  }
}

/** The signed-in admin, or null. Synchronous, for services to check against. */
export function sessionAdmin(): AdminUser | null {
  if (!accessToken("admin")) return null;
  try {
    const saved = sessionStorage.getItem(SESSION);
    return saved ? (JSON.parse(saved) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function can(admin: AdminUser | null, module: string, action: PermissionAction = "view") {
  return Boolean(admin?.permissions[module]?.includes(action));
}

/** Throws the API's 403 unless the signed-in admin may do this. */
export function assertCan(module: string, action: PermissionAction) {
  const admin = sessionAdmin();
  if (!admin) throw new ApiError("Your session has ended. Sign in again.", 401);
  if (!can(admin, module, action)) throw new ApiError("Your role does not allow this. Ask the owner for access.", 403);
  return admin;
}
