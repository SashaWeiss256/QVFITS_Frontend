/* Team Tables */
import { createCollection } from "../store/collectionStore";
import type { PermissionModule, Role, StaffMember } from "../types";
import permissionSeed from "@/data/permissions.json";
import roleSeed from "@/data/roles.json";
import staffSeed from "@/data/staff.json";

/**
 * The staff, their roles and the modules a role can be given. Kept apart
 * from the services that use them so the session check can read them
 * without a circular import. Passwords are a mock-only field.
 */
export type StaffRecord = StaffMember & { password?: string };

export const staff = createCollection<StaffRecord>("staff", staffSeed as unknown as StaffRecord[], { idPrefix: "adm" });
export const roles = createCollection<Role>("roles", roleSeed as unknown as Role[], { idPrefix: "role" });
export const PERMISSION_MODULES = permissionSeed as unknown as PermissionModule[];

/** A staff member as screens see them: never the password. */
export function publicStaff({ password: _password, ...member }: StaffRecord): StaffMember {
  return member;
}
