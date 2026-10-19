/* Team Service (realm: admin) */
import { http } from "../api/client";
import { mockApi } from "../api/mock";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { Role, StaffMember } from "../types";
import { PERMISSION_MODULES } from "./teamStore";

/**
 * The people who can sign in to the admin, their roles, and the permission
 * matrix. The API checks Team access, keeps the shop from losing its last
 * owner and lets only an owner make another. The activity log is still a
 * mock, so each change is written to it here once the API has accepted it.
 */

const ADMIN = { realm: "admin" } as const;

export const listStaff = ({ signal }: RequestOptions = {}) => http.get<StaffMember[]>(routes.team.staff, { ...ADMIN, signal });

export const listRoles = ({ signal }: RequestOptions = {}) => http.get<Role[]>(routes.team.roles, { ...ADMIN, signal });

// The modules are part of the code, not data, so they need no request.
export const listPermissionModules = ({ signal }: RequestOptions = {}) => mockApi(() => PERMISSION_MODULES, 0, signal);

/** An invite: the person is added as `invited` and gets a link to set a password. */
export async function inviteStaff(input: Pick<StaffMember, "name" | "email" | "roleId">) {
  const out = await http.post<{ member: StaffMember; inviteLink: string }>(routes.adminAuth.invite, input, ADMIN);
  logActivity({ module: "team", action: "create", entityId: out.member.id, summary: `Invited ${out.member.name}` });
  return out;
}

export async function updateStaff(id: Id, patch: Partial<Pick<StaffMember, "name" | "roleId" | "overrides" | "status">>) {
  const member = await http.patch<StaffMember>(`${routes.team.staff}/${id}`, patch, ADMIN);
  logActivity({ module: "team", action: "update", entityId: id, summary: `Updated ${member.name}` });
  return member;
}

export async function removeStaff(id: Id) {
  await http.del(`${routes.team.staff}/${id}`, ADMIN);
  logActivity({ module: "team", action: "delete", entityId: id, summary: "Removed someone from the team" });
}

/** Roles, shaped like an adminCrud so the Team page's resource stays the same. */
export const rolesCrud = {
  list: listRoles,

  async create(data: Partial<Role>) {
    const role = await http.post<Role>(routes.team.roles, data, ADMIN);
    logActivity({ module: "team", action: "create", entityId: role.id, summary: `Added role ${role.name}` });
    return role;
  },

  async update(id: Id, data: Partial<Role>) {
    // Only what a role may change; the id and the system flag belong to the server.
    const { name, description, permissions } = data;
    const role = await http.patch<Role>(`${routes.team.roles}/${id}`, { name, description, permissions }, ADMIN);
    logActivity({ module: "team", action: "update", entityId: id, summary: `Updated role ${role.name}` });
    return role;
  },

  async remove(id: Id) {
    await http.del(`${routes.team.roles}/${id}`, ADMIN);
    logActivity({ module: "team", action: "delete", entityId: id, summary: `Deleted role ${id}` });
  },
};
