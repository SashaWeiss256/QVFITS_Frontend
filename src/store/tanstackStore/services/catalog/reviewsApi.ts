/* Reviews Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import type { Review } from "../types";
import { REVIEWS } from "@/data/shop";

/**
 * Published reviews only. The three seeded quotes are the shop's own, quoted
 * verbatim; nothing is invented. With the API, customers post reviews and the
 * admin approves them before they show.
 */
export function listReviews({ signal }: RequestOptions = {}) {
  return mockApi<Review[]>(() => REVIEWS, 100, signal);
}
