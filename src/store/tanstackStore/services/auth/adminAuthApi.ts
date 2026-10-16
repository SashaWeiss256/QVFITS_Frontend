/* Admin Auth Service (realm: admin) */
import { ApiError, mockApi } from "../api/mock";
import { clearAccessToken, setAccessToken } from "../api/tokens";
import { staff } from "../team/teamStore";
import type { AdminUser } from "../types";
import { SESSION, sessionAdmin, toAdminUser } from "./adminSession";

/**
 * The staff door, kept apart from shopper sign-in so 2FA and a stricter rate
 * limit can attach to it on the API. Mock mode only: passwords are checked
 * against the team table and the token is a fake.
 */

export function login({ email, password }: { email: string; password: string }) {
  return mockApi(() => {
    const record = staff.list().find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password);
    if (!record) throw new ApiError("Email or password is incorrect.", 401);
    if (record.status === "suspended") throw new ApiError("Your access has been paused. Ask the owner.", 403);
    if (record.status === "invited") throw new ApiError("Finish setting up your account from the invite link first.", 403);
    sessionStorage.setItem(SESSION, record.id);
    setAccessToken("admin", `mock.admin.${record.id}.${Date.now().toString(36)}`);
    staff.update(record.id, { lastSeenAt: new Date().toISOString() });
    return toAdminUser(record);
  }, 400);
}

/** An invited team member sets their password and is signed straight in. */
export function acceptInvite({ token, password }: { token: string; password: string }) {
  return mockApi(() => {
    const record = staff.list().find((s) => (s as { inviteToken?: string }).inviteToken === token && s.status === "invited");
    if (!record) throw new ApiError("This invite link has been used or has expired. Ask for a new one.", 404);
    const updated = staff.update(record.id, { password, status: "active", inviteToken: undefined, lastSeenAt: new Date().toISOString() } as never)!;
    sessionStorage.setItem(SESSION, updated.id);
    setAccessToken("admin", `mock.admin.${updated.id}.${Date.now().toString(36)}`);
    return toAdminUser(updated);
  }, 400);
}

export function currentAdmin() {
  return mockApi<AdminUser | null>(() => sessionAdmin(), 0);
}

export function logout() {
  return mockApi(() => {
    clearAccessToken("admin");
    sessionStorage.removeItem(SESSION);
  }, 0);
}
