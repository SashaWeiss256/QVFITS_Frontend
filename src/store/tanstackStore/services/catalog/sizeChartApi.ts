/* Size Chart Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import type { SizeRow } from "../types";

/** Body measurements in cm per size, with UK / US / EU equivalents. */
export function getSizeChart({ signal }: RequestOptions = {}) {
  return http.get<SizeRow[]>(routes.catalog.sizeChart, { signal });
}

/* Admin (realm: admin) */

export async function saveSizeChart(rows: SizeRow[]) {
  const saved = await http.put<SizeRow[]>(routes.adminCatalog.sizeChart, { rows }, { realm: "admin" });
  logActivity({ module: "size-guide", action: "update", summary: "Updated the size chart" });
  return saved;
}
