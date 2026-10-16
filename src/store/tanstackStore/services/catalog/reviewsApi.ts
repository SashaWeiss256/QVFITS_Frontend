/* Reviews Service */
import { ApiError, mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { Review } from "../types";
import reviewSeed from "@/data/reviews.json";

/**
 * Reviews wait for the admin's approval before they show. The three seeded
 * quotes are the shop's own, quoted verbatim; nothing is invented.
 */
const reviews = createCollection<Review>("reviews", reviewSeed as Review[], { idPrefix: "rev" });

export function listReviews({ signal }: RequestOptions = {}) {
  return mockApi(() => reviews.list().filter((r) => r.status === "approved"), 100, signal);
}

/** A shopper's review goes in as pending. */
export function submitReview(input: Pick<Review, "name" | "text" | "stars" | "productId">) {
  return mockApi(() => {
    if (!input.text?.trim()) throw new ApiError("Write a few words first.", 422);
    return reviews.create({ ...input, status: "pending", createdAt: new Date().toISOString() });
  }, 300);
}

/* Admin (realm: admin) */

export const reviewsCrud = adminCrud(reviews, {
  module: "reviews",
  noun: "review",
  label: (r) => `from ${r.name}`,
  prepare: (data, existing) => (existing ? data : { stars: 5, status: "approved" as const, productId: null, createdAt: new Date().toISOString(), ...data }),
});
