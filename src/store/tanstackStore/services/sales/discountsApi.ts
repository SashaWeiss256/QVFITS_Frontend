/* Discount Codes Service */
import { mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Discount } from "../types";
import { discountSeed } from "@/data/orders";

export const discounts = createCollection<Discount>("discounts", discountSeed, { idPrefix: "dsc" });

/** The active discount for a code, or null. Codes are case-insensitive. */
export function findDiscount(code?: string) {
  if (!code) return null;
  return discounts.list().find((d) => d.active && d.code.toLowerCase() === code.trim().toLowerCase()) ?? null;
}

/* Admin (realm: admin) */

export function listDiscounts({ signal }: RequestOptions = {}) {
  return mockApi(() => discounts.list(), 150, signal);
}

export function createDiscount(data: NewRow<Discount>) {
  return mockApi(() => discounts.create({ ...data, code: data.code.toUpperCase() }));
}

export function updateDiscount(id: Id, patch: Partial<Discount>) {
  return mockApi(() => discounts.update(id, patch));
}

export function removeDiscount(id: Id) {
  return mockApi(() => discounts.remove(id));
}
