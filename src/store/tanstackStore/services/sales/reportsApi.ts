/* Reports Service (realm: admin) */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { assertCan } from "../auth/adminSession";
import { listAllProducts } from "../catalog/productsApi";
import { getSettings } from "../content/settingsApi";
import { listMessages } from "../content/contactApi";
import { listCustomers } from "../customers/customersApi";
import { listReturns } from "./returnsApi";
import { reviewsCrud } from "../catalog/reviewsApi";
import type { Order } from "../types";
import { listOrders } from "./ordersApi";
import { listTransactions } from "./transactionsApi";
import { categoriesCrud } from "../catalog/attributesApi";

export interface Overview {
  days: number;
  revenue: number;
  orders: number;
  pending: number;
  averageOrder: number;
  newCustomers: number;
  /** The same numbers for the period before, for the "vs last" line. */
  previous: { revenue: number; orders: number };
  /** Bars for the chart: a day each up to 45 days, a week each beyond, so every bar stays readable. `day` is the bucket's first day. */
  buckets: { day: string; end: string; revenue: number; orders: number }[];
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
  // Orders, customers and stock from the API (which expires unpaid orders as it lists them); messages are still a mock.
  const [products, returns, reviews, messages, all, customers, settings] = await Promise.all([
    listAllProducts({ signal }),
    listReturns({ signal }),
    reviewsCrud.list({ signal }),
    listMessages({ signal }),
    listOrders({ signal }),
    listCustomers({ signal }),
    getSettings({ signal }),
  ]);

  return mockApi(() => {
    const now = Date.now();
    const from = now - days * DAY;
    const prevFrom = from - days * DAY;
    const inRange = (o: Order, a: number, b: number) => Date.parse(o.createdAt) >= a && Date.parse(o.createdAt) < b;
    const paid = all.filter((o) => COUNTED.has(o.status) && inRange(o, from, now + DAY));
    const prev = all.filter((o) => COUNTED.has(o.status) && inRange(o, prevFrom, from));
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);

    // One bar per day in the range, empty days included, oldest first; weeks beyond 45 days.
    const perDay = Array.from({ length: days }, (_, i) => {
      const day = new Date(from + (i + 1) * DAY).toISOString().slice(0, 10);
      const list = paid.filter((o) => o.createdAt.slice(0, 10) === day);
      return { day, revenue: list.reduce((s, o) => s + o.total, 0), orders: list.length };
    });
    const width = days > 45 ? 7 : 1;
    const buckets = Array.from({ length: Math.ceil(days / width) }, (_, i) => {
      const chunk = perDay.slice(i * width, i * width + width);
      return { day: chunk[0].day, end: chunk[chunk.length - 1].day, revenue: chunk.reduce((s, d) => s + d.revenue, 0), orders: chunk.reduce((s, d) => s + d.orders, 0) };
    });

    const top = new Map<string, { productId: string; name: string; units: number; revenue: number }>();
    for (const o of paid) for (const l of o.lines) {
      const row = top.get(l.productId) ?? { productId: l.productId, name: l.name, units: 0, revenue: 0 };
      row.units += l.qty;
      row.revenue += l.qty * l.price;
      top.set(l.productId, row);
    }

    const threshold = settings.lowStockAt;
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
      newCustomers: customers.filter((c) => Date.parse(c.createdAt) >= from).length,
      previous: { revenue: prev.reduce((s, o) => s + o.total, 0), orders: prev.length },
      buckets,
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

/* Reports (after belioras 2.reports) */

export interface ReportRange {
  /** Inclusive, YYYY-MM-DD. Empty `from` means since the first order. */
  from: string;
  to: string;
}

export interface Reports {
  range: ReportRange;
  summary: { sales: number; orders: number; average: number; refunded: number; refundedCount: number; unpaid: number };
  sales: { month: string; orders: number; goods: number; discount: number; delivery: number; total: number }[];
  orders: { ref: string; date: string; customer: string; status: string; payment: string; source: string; pieces: number; code: string; discount: number; total: number }[];
  products: { name: string; category: string; units: number; revenue: number }[];
  codes: { code: string; orders: number; customers: number; discount: number; revenue: number }[];
  customers: { name: string; contact: string; orders: number; spent: number; first: string; isNew: boolean }[];
  stock: { category: string; pieces: number; units: number; low: number; out: number; value: number }[];
}

// The calendar day of a timestamp, as YYYY-MM-DD.
const dayOf = (iso: string) => iso.slice(0, 10);

/**
 * Every report for a period, from paid orders (cancelled and refunded ones
 * are left out of sales; refunds are counted on their own). Stock is as it
 * stands today, whatever the period.
 */
export async function getReports(range: ReportRange, { signal }: RequestOptions = {}): Promise<Reports> {
  assertCan("reports", "view");
  const [products, categories, all, money, settings] = await Promise.all([
    listAllProducts({ signal }),
    categoriesCrud.list({ signal }),
    listOrders({ signal }),
    listTransactions({ signal }),
    getSettings({ signal }),
  ]);
  return mockApi(() => {
    const inRange = (iso: string) => (!range.from || dayOf(iso) >= range.from) && dayOf(iso) <= range.to;
    const paid = all.filter((o) => COUNTED.has(o.status) && inRange(o.createdAt));
    // Adds one number up across a list of orders.
    const sum = (rows: Order[], pick: (o: Order) => number) => rows.reduce((n, o) => n + pick(o), 0);
    const refunds = money.filter((t) => t.type === "refund" && t.status === "succeeded" && inRange(t.createdAt));

    const months = new Map<string, Order[]>();
    for (const o of paid) months.set(o.createdAt.slice(0, 7), [...(months.get(o.createdAt.slice(0, 7)) ?? []), o]);
    const sales = [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, list]) => ({
        month,
        orders: list.length,
        goods: sum(list, (o) => o.subtotal),
        discount: sum(list, (o) => o.discount),
        delivery: sum(list, (o) => o.delivery),
        total: sum(list, (o) => o.total),
      }));

    const byProduct = new Map<string, { name: string; category: string; units: number; revenue: number }>();
    for (const o of paid) for (const l of o.lines) {
      const p = products.find((x) => x.id === l.productId);
      const row = byProduct.get(l.productId) ?? { name: l.name, category: p?.category ?? "", units: 0, revenue: 0 };
      row.units += l.qty;
      row.revenue += l.qty * l.price;
      byProduct.set(l.productId, row);
    }

    const byCode = new Map<string, { code: string; orders: number; who: Set<string>; discount: number; revenue: number }>();
    for (const o of paid) {
      if (!o.discountCode) continue;
      const row = byCode.get(o.discountCode) ?? { code: o.discountCode, orders: 0, who: new Set<string>(), discount: 0, revenue: 0 };
      row.orders += 1;
      row.who.add(o.customerId ?? o.phone);
      row.discount += o.discount;
      row.revenue += o.total;
      byCode.set(o.discountCode, row);
    }

    // A customer is their account, or their phone for a guest.
    const byCustomer = new Map<string, { name: string; contact: string; orders: number; spent: number; first: string }>();
    for (const o of all.filter((x) => COUNTED.has(x.status))) {
      const key = o.customerId ?? o.phone;
      const row = byCustomer.get(key) ?? { name: o.name, contact: o.email ?? o.phone, orders: 0, spent: 0, first: o.createdAt };
      if (o.createdAt < row.first) row.first = o.createdAt;
      if (inRange(o.createdAt)) {
        row.orders += 1;
        row.spent += o.total;
      }
      byCustomer.set(key, row);
    }

    const low = settings.lowStockAt;
    const stock = categories.map((c) => {
      const pieces = products.filter((p) => p.categoryId === c.id && p.status !== "archived");
      const variants = pieces.flatMap((p) => p.variants.map((v) => ({ ...v, price: p.price })));
      return {
        category: c.name,
        pieces: pieces.length,
        units: variants.reduce((n, v) => n + v.stock, 0),
        low: variants.filter((v) => v.stock > 0 && v.stock <= low).length,
        out: variants.filter((v) => v.stock === 0).length,
        value: variants.reduce((n, v) => n + v.stock * v.price, 0),
      };
    });

    const total = sum(paid, (o) => o.total);
    return {
      range,
      summary: {
        sales: total,
        orders: paid.length,
        average: paid.length ? Math.round(total / paid.length) : 0,
        refunded: refunds.reduce((n, t) => n + t.amount, 0),
        refundedCount: refunds.length,
        unpaid: all.filter((o) => o.status === "pending" && inRange(o.createdAt)).length,
      },
      sales,
      orders: all
        .filter((o) => inRange(o.createdAt))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((o) => ({
          ref: o.ref,
          date: dayOf(o.createdAt),
          customer: o.name,
          status: o.status,
          payment: o.payment,
          source: o.source ?? "web",
          pieces: o.lines.reduce((n, l) => n + l.qty, 0),
          code: o.discountCode ?? "",
          discount: o.discount,
          total: o.total,
        })),
      products: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue),
      codes: [...byCode.values()].map(({ who, ...r }) => ({ ...r, customers: who.size })).sort((a, b) => b.orders - a.orders),
      customers: [...byCustomer.values()]
        .filter((c) => c.orders > 0)
        .map((c) => ({ ...c, first: dayOf(c.first), isNew: inRange(c.first) }))
        .sort((a, b) => b.spent - a.spent),
      stock,
    };
  }, 200, signal);
}
