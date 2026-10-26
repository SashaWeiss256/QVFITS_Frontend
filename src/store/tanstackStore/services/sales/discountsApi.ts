/* Discount Codes Service (realm: admin) */
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { Discount } from "../types";

/**
 * Discount codes on the API. Checkout checks a code there (active, in date,
 * under its limits, over its minimum spend); each code's use and what it did
 * are worked out from the orders on every read.
 */

/** A code with its use and what it did, for the admin. */
export type DiscountView = Discount & { orders: number; customers: number; revenue: number; given: number };

export const discountsCrud = httpCrud<DiscountView>(routes.adminSales.discounts, { module: "discounts", noun: "discount code", label: (d) => d.code });

export const listDiscounts = ({ signal }: RequestOptions = {}) => discountsCrud.list({ signal });

/** A random, readable code: no 0/O or 1/I to misread over WhatsApp. */
export function randomCode(prefix = "QV") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return prefix + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
