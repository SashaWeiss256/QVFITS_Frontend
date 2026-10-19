/* Admin Team, Roles And Activity */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listActivity } from "../../services/admin/activityApi";
import { setupStatus } from "../../services/auth/adminAuthApi";
import { inviteStaff, listPermissionModules, listRoles, listStaff, removeStaff, rolesCrud, updateStaff } from "../../services/team/staffApi";
import type { ActivityEntry, Id, Role, StaffMember } from "../../services/types";
import { adminRoot } from "../keys";
import { collectionQueries, crudResource, type CollectionResource } from "./collection";

export const staffQueries = collectionQueries<StaffMember>("staff", listStaff, { label: "the team" });
export const activityQueries = collectionQueries<ActivityEntry>("activity", listActivity, { label: "the activity log" });

export const staffResource: CollectionResource<StaffMember, never, Partial<StaffMember>> = {
  queries: staffQueries,
  update: updateStaff,
  remove: removeStaff,
  noun: "Team member",
};

export const rolesResource = crudResource<Role>("roles", rolesCrud, { noun: "Role", list: listRoles, alsoInvalidates: [staffQueries.all()] });

export const permissionModuleQueries = {
  list: () => queryOptions({ queryKey: [...adminRoot, "permission-modules"] as const, queryFn: ({ signal }) => listPermissionModules({ signal }), staleTime: Infinity }),
};

// Whether the shop still needs its first owner. Never cached: it closes for good the moment one is made.
export const adminSetupQueries = {
  status: () => queryOptions({ queryKey: [...adminRoot, "setup"] as const, queryFn: ({ signal }) => setupStatus({ signal }), staleTime: 0, gcTime: 0, meta: { label: "the setup status" } }),
};
export const useAdminSetup = () => useQuery(adminSetupQueries.status());

// Only for someone who may read the log; pass can("activity").
export const useActivity = (enabled = true) => useQuery({ ...activityQueries.list(), enabled });
export const usePermissionModules = () => useQuery(permissionModuleQueries.list());

// An invite adds a team member and a line in the activity log.
export const useInviteStaff = () =>
  useMutation({
    mutationFn: (input: Pick<StaffMember, "name" | "email" | "roleId">) => inviteStaff(input),
    meta: { invalidates: [staffQueries.all(), activityQueries.all()], success: "Invite created" },
  });

export type { Id };
