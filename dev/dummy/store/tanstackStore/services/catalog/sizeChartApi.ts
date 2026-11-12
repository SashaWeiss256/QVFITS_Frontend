/* Size Chart Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import { createDocument } from "../store/collectionStore";
import type { SizeRow } from "../types";
import sizeChartSeed from "@/data/size-chart.json";

/** Body measurements in cm per size, with UK / US / EU equivalents. */
const chart = createDocument<{ rows: SizeRow[] }>("size-chart", { rows: sizeChartSeed as SizeRow[] });

export function getSizeChart({ signal }: RequestOptions = {}) {
  return mockApi(() => chart.get().rows, 100, signal);
}

/* Admin (realm: admin) */

export function saveSizeChart(rows: SizeRow[]) {
  return mockApi(() => {
    assertCan("size-guide", "edit");
    const doc = chart.update({ rows });
    logActivity({ module: "size-guide", action: "update", summary: "Updated the size chart" });
    return doc.rows;
  });
}
