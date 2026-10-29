/* Admin Session And Permissions */
import { ApiError } from "../api/mock";
import { accessToken } from "../api/tokens";
import { roles, staff, type StaffRecord } from "../team/teamStore";
import type { AdminUser, PermissionAction, PermissionMap } from "../types";

/**
 * Who is signed in to the admin, and what they may do. The mock keeps the
 * staff id in sessionStorage and works the permissions out fresh on every
 * call, so a role change applies at once. The API does the same check on the
 * server; this one exists so the mock refuses what the API will refuse.
 */
export const SESSION = "qvfits:mock:admin";

/** The role's permissions with the person's own overrides laid over them. */
export function permissionsFor(member: Pick<StaffRecord, "roleId" | "overrides">): PermissionMap {
  const role = roles.get(member.roleId);
  return { ...(role?.permissions ?? {}), ...(member.overrides ?? {}) };
}

export function toAdminUser(member: StaffRecord): AdminUser {
  return { id: member.id, name: member.name, email: member.email, role: member.roleId, permissions: permissionsFor(member) };
}

/** The signed-in admin, or null. Synchronous, for services to check against. */
export function sessionAdmin(): AdminUser | null {
  if (!accessToken("admin")) return null;
  const id = sessionStorage.getItem(SESSION);
  const member = id ? staff.get(id) : null;
  return member && member.status === "active" ? toAdminUser(member) : null;
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
