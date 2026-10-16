/* Admin Team, Roles And Activity */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listActivity } from "../../services/admin/activityApi";
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

// Only for someone who may read the log; pass can("activity").
export const useActivity = (enabled = true) => useQuery({ ...activityQueries.list(), enabled });
export const usePermissionModules = () => useQuery(permissionModuleQueries.list());

export const useInviteStaff = () =>
  useMutation({
    mutationFn: (input: Pick<StaffMember, "name" | "email" | "roleId">) => inviteStaff(input),
    meta: { invalidates: [staffQueries.all(), activityQueries.all()], success: "Invite created" },
  });

export type { Id };
