/* Reports Service (realm: admin) */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { orders } from "./ordersApi";

export interface Overview {
  revenue: number;
  orders: number;
  pending: number;
  averageOrder: number;
  byDay: { day: string; revenue: number }[];
}

const COUNTED = new Set(["paid", "packed", "out_for_delivery", "delivered"]);

/** Headline numbers for the admin overview, from paid orders only. */
export function getOverview({ signal }: RequestOptions = {}) {
  return mockApi<Overview>(() => {
    const all = orders.list();
    const paid = all.filter((o) => COUNTED.has(o.status));
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);
    const byDay = new Map<string, number>();
    for (const o of paid) {
      const day = o.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + o.total);
    }
    return {
      revenue,
      orders: paid.length,
      pending: all.filter((o) => o.status === "pending").length,
      averageOrder: paid.length ? Math.round(revenue / paid.length) : 0,
      byDay: [...byDay].sort(([a], [b]) => a.localeCompare(b)).map(([day, total]) => ({ day, revenue: total })),
    };
  }, 200, signal);
}
