/* Size Chart Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import type { SizeRow } from "../types";
import { SIZE_CHART } from "@/data/shop";

/** Body measurements in cm per size, with UK / US / EU equivalents. */
export function getSizeChart({ signal }: RequestOptions = {}) {
  return mockApi<SizeRow[]>(() => SIZE_CHART, 100, signal);
}
