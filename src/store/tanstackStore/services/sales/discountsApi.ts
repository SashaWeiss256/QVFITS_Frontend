/* Discount Codes Service */
import { ApiError, mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { Discount, OrderLine, Product } from "../types";
import discountSeed from "@/data/discounts.json";

export const discounts = createCollection<Discount>("discounts", discountSeed as Discount[], { idPrefix: "dsc" });

/** What a code is worth on a bag, or why it does not apply. */
export interface DiscountResult {
  discount: Discount | null;
  amount: number;
  freeShipping: boolean;
  /** Shown under the code field when it does not apply. */
  reason?: string;
}

const NONE: DiscountResult = { discount: null, amount: 0, freeShipping: false };

/**
 * Checks a code against a priced bag: active, in date, under its usage
 * limit, over its minimum spend, and covering at least one line. Codes are
 * case-insensitive. The API runs the same checks on the server.
 */
export function applyDiscount(code: string | undefined, lines: OrderLine[], products: Product[], usedByCustomer = 0): DiscountResult {
  if (!code?.trim()) return NONE;
  const d = discounts.list().find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
  const fail = (reason: string) => ({ ...NONE, reason });
  if (!d || !d.active) return fail("That code is not valid.");
  const now = Date.now();
  if (d.startsAt && Date.parse(d.startsAt) > now) return fail("That code is not active yet.");
  if (d.endsAt && Date.parse(d.endsAt) < now) return fail("That code has expired.");
  if (d.usageLimit !== null && d.usedCount >= d.usageLimit) return fail("That code has been used up.");
  if (d.perCustomerLimit !== null && usedByCustomer >= d.perCustomerLimit) return fail("You have already used that code.");

  const covered = lines.filter((l) => {
    if (d.appliesTo.scope === "all") return true;
    if (d.appliesTo.scope === "products") return d.appliesTo.ids.includes(l.productId);
    const p = products.find((x) => x.id === l.productId);
    return Boolean(p && d.appliesTo.ids.includes(p.categoryId));
  });
  if (!covered.length) return fail("That code does not cover anything in your bag.");

  const base = covered.reduce((sum, l) => sum + l.price * l.qty, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  if (subtotal < d.minSpend) return fail(`Spend ${d.minSpend.toLocaleString("en-UG")} UGX or more to use that code.`);

  if (d.type === "free_shipping") return { discount: d, amount: 0, freeShipping: true };
  const amount = d.type === "fixed" ? Math.min(d.value, base) : Math.round((base * d.value) / 100);
  return { discount: d, amount, freeShipping: false };
}

/** Counts a use once the order is placed. */
export function markDiscountUsed(id: string) {
  const d = discounts.get(id);
  if (d) discounts.update(id, { usedCount: d.usedCount + 1 });
}

/* Admin (realm: admin) */

export const listDiscounts = ({ signal }: RequestOptions = {}) => mockApi(() => discounts.list(), 150, signal);

export const discountsCrud = adminCrud(discounts, {
  module: "discounts",
  noun: "discount code",
  label: (d) => d.code,
  prepare: (data, existing, all) => {
    const next = { ...data };
    if (next.code !== undefined) {
      // Stored in capitals for display; matching ignores case anyway.
      next.code = next.code.trim().toUpperCase().replace(/\s+/g, "");
      if (!next.code) throw new ApiError("Give the code a name.", 422);
      if (all.some((d) => d.code === next.code && d.id !== existing?.id)) throw new ApiError("Another discount already uses that code.", 409);
    }
    if (next.type === "percent" && next.value !== undefined && (next.value <= 0 || next.value > 100)) {
      throw new ApiError("A percentage has to be between 1 and 100.", 422);
    }
    if (existing) return next;
    return {
      description: "", type: "percent" as const, value: 10, minSpend: 0, startsAt: null, endsAt: null, usageLimit: null,
      perCustomerLimit: null, appliesTo: { scope: "all" as const, ids: [] }, active: true, ...next, usedCount: 0, createdAt: new Date().toISOString(),
    };
  },
});

/** A random, readable code: no 0/O or 1/I to misread over WhatsApp. */
export function randomCode(prefix = "QV") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return prefix + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
