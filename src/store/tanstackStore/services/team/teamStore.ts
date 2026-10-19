/* Team Tables */
import type { PermissionModule } from "../types";
import permissionSeed from "@/data/permissions.json";

/**
 * The modules a role can be given and the actions each allows. The people
 * and roles themselves live on the API; the server keeps its own copy of
 * this list and of `data/roles.json`, so a change goes to both.
 */
export const PERMISSION_MODULES = permissionSeed as unknown as PermissionModule[];
