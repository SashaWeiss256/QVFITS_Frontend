/* Reports Service (realm: admin) */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { assertCan } from "../auth/adminSession";
import { listAllProducts } from "../catalog/productsApi";
import { readSettings } from "../content/settingsApi";
import { listMessages } from "../content/contactApi";
import { customers } from "../customers/customersApi";
import { listReturns } from "./returnsApi";
import { reviewsCrud } from "../catalog/reviewsApi";
import type { Order } from "../types";
import { orders } from "./ordersApi";

export interface Overview {
  days: number;
  revenue: number;
  orders: number;
  pending: number;
  averageOrder: number;
  newCustomers: number;
  /** The same numbers for the period before, for the "vs last" line. */
  previous: { revenue: number; orders: number };
  byDay: { day: string; revenue: number; orders: number }[];
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
  lowStock: { productId: string; name: string; size: string; color: string; stock: number }[];
  recentOrders: Order[];
  inbox: { returns: number; reviews: number; messages: number };
}

// Statuses that mean the money came in. Cancelled and refunded orders are left out.
const COUNTED = new Set(["paid", "packed", "out_for_delivery", "delivered", "exchanged"]);
const DAY = 86_400_000;

/** Headline numbers for the admin overview over the last `days`, from paid orders only. */
export async function getOverview(days = 30, { signal }: RequestOptions = {}): Promise<Overview> {
  assertCan("overview", "view");
  const [products, returns, reviews, messages] = await Promise.all([
    listAllProducts({ signal }),
    listReturns({ signal }),
    reviewsCrud.list({ signal }),
    listMessages({ signal }),
  ]);

  return mockApi(() => {
    const now = Date.now();
    const from = now - days * DAY;
    const prevFrom = from - days * DAY;
    const all = orders.list();
    const inRange = (o: Order, a: number, b: number) => Date.parse(o.createdAt) >= a && Date.parse(o.createdAt) < b;
    const paid = all.filter((o) => COUNTED.has(o.status) && inRange(o, from, now + DAY));
    const prev = all.filter((o) => COUNTED.has(o.status) && inRange(o, prevFrom, from));
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);

    // One bar per day in the range, empty days included, oldest first.
    const byDay = Array.from({ length: days }, (_, i) => {
      const day = new Date(from + (i + 1) * DAY).toISOString().slice(0, 10);
      const list = paid.filter((o) => o.createdAt.slice(0, 10) === day);
      return { day, revenue: list.reduce((s, o) => s + o.total, 0), orders: list.length };
    });

    const top = new Map<string, { productId: string; name: string; units: number; revenue: number }>();
    for (const o of paid) for (const l of o.lines) {
      const row = top.get(l.productId) ?? { productId: l.productId, name: l.name, units: 0, revenue: 0 };
      row.units += l.qty;
      row.revenue += l.qty * l.price;
      top.set(l.productId, row);
    }

    const threshold = readSettings().lowStockAt;
    const lowStock = products
      .filter((p) => p.status === "active")
      .flatMap((p) => p.variants.filter((v) => v.stock <= threshold).map((v) => ({ productId: p.id, name: p.name, size: v.size, color: v.colorId, stock: v.stock })))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8);

    return {
      days,
      revenue,
      orders: paid.length,
      pending: all.filter((o) => o.status === "pending").length,
      averageOrder: paid.length ? Math.round(revenue / paid.length) : 0,
      newCustomers: customers.list().filter((c) => Date.parse(c.createdAt) >= from).length,
      previous: { revenue: prev.reduce((s, o) => s + o.total, 0), orders: prev.length },
      byDay,
      topProducts: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      lowStock,
      recentOrders: [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
      inbox: {
        returns: returns.filter((r) => r.status === "requested").length,
        reviews: reviews.filter((r) => r.status === "pending").length,
        messages: messages.filter((m) => m.status === "new").length,
      },
    };
  }, 150, signal);
}
