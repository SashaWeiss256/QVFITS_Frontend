/* Team Service (realm: admin) */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan, sessionAdmin } from "../auth/adminSession";
import { adminCrud } from "../store/adminCrud";
import type { NewRow } from "../store/collectionStore";
import type { Role, StaffMember } from "../types";
import { PERMISSION_MODULES, publicStaff, roles, staff, type StaffRecord } from "./teamStore";

/**
 * The people who can sign in to the admin, their roles, and the permission
 * matrix. Only someone with Team access (the owner, by default) can change
 * any of it, and nobody can lock the shop out of its last owner.
 */

export const listStaff = ({ signal }: RequestOptions = {}) =>
  mockApi(() => {
    assertCan("team", "view");
    return staff.list().map(publicStaff);
  }, 150, signal);

export const listRoles = ({ signal }: RequestOptions = {}) => mockApi(() => roles.list(), 120, signal);
export const listPermissionModules = ({ signal }: RequestOptions = {}) => mockApi(() => PERMISSION_MODULES, 50, signal);

const activeOwners = (except?: Id) => staff.list().filter((s) => s.roleId === "owner" && s.status === "active" && s.id !== except).length;

/** An invite: the person is added as `invited` and gets a link to set a password. */
export function inviteStaff(input: Pick<StaffMember, "name" | "email" | "roleId">) {
  return mockApi(() => {
    assertCan("team", "edit");
    const email = input.email.trim().toLowerCase();
    if (staff.list().some((s) => s.email === email)) throw new ApiError("Someone on the team already uses that email.", 409);
    if (!roles.get(input.roleId)) throw new ApiError("Pick a role.", 422);
    const token = Math.random().toString(36).slice(2, 10);
    const member = staff.create({
      name: input.name.trim(), email, roleId: input.roleId, overrides: {}, status: "invited", lastSeenAt: null,
      createdAt: new Date().toISOString(), inviteToken: token,
    } as NewRow<StaffRecord>);
    logActivity({ module: "team", action: "create", entityId: member.id, summary: `Invited ${member.name} as ${roles.get(input.roleId)?.name}` });
    // Honest seam: no email goes out until the API sends one, so the link is handed back to share by hand.
    return { member: publicStaff(member), inviteLink: `${window.location.origin}/admin/invite?token=${token}` };
  });
}

export function updateStaff(id: Id, patch: Partial<Pick<StaffMember, "name" | "roleId" | "overrides" | "status">>) {
  return mockApi(() => {
    assertCan("team", "edit");
    const member = staff.get(id);
    if (!member) throw new ApiError("That person is no longer on the team.", 404);
    const losingOwner = member.roleId === "owner" && ((patch.roleId && patch.roleId !== "owner") || (patch.status && patch.status !== "active"));
    if (losingOwner && activeOwners(id) === 0) throw new ApiError("The shop needs at least one active owner.", 409);
    if (id === sessionAdmin()?.id && patch.status && patch.status !== "active") throw new ApiError("You cannot suspend yourself.", 409);
    const updated = staff.update(id, patch)!;
    logActivity({ module: "team", action: "update", entityId: id, summary: `Updated ${updated.name}` });
    return publicStaff(updated);
  });
}

export function removeStaff(id: Id) {
  return mockApi(() => {
    assertCan("team", "delete");
    const member = staff.get(id);
    if (!member) return;
    if (id === sessionAdmin()?.id) throw new ApiError("You cannot remove yourself.", 409);
    if (member.roleId === "owner" && activeOwners(id) === 0) throw new ApiError("The shop needs at least one active owner.", 409);
    staff.remove(id);
    logActivity({ module: "team", action: "delete", entityId: id, summary: `Removed ${member.name} from the team` });
  });
}

export const rolesCrud = adminCrud(roles, {
  module: "team",
  noun: "role",
  label: (r: Role) => r.name,
  prepare: (data, existing) => {
    if (existing?.id === "owner" && data.permissions) throw new ApiError("The owner always has full access.", 409);
    return existing ? data : { description: "", permissions: {}, ...data, system: false };
  },
  beforeRemove: (r) => {
    if (r.system) throw new ApiError("Owner, Manager and Showroom staff come with the shop and cannot be deleted.", 409);
    const using = staff.list().filter((s) => s.roleId === r.id).length;
    if (using) throw new ApiError(`${using} ${using === 1 ? "person has" : "people have"} this role. Give them another first.`, 409);
  },
});
