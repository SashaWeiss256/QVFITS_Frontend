/* Activity Log Service (realm: admin) */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import type { ActivityEntry } from "../types";

/**
 * Who changed what, and when, kept on the API. Every admin write records one
 * line here through `logActivity`; the API signs it with whoever is signed in
 * and keeps the newest 2000.
 */
export function logActivity(entry: Pick<ActivityEntry, "module" | "action" | "summary"> & { entityId?: ActivityEntry["entityId"] }) {
  // The change itself has already been saved; a log line that can't be written never undoes it.
  http.post(routes.adminSite.activity, { ...entry, entityId: entry.entityId ?? null }, { realm: "admin" }).catch(() => {});
}

export function listActivity({ signal }: RequestOptions = {}) {
  return http.get<ActivityEntry[]>(routes.adminSite.activity, { realm: "admin", signal });
}
