/* Reviews Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { Review } from "../types";

/**
 * Reviews wait for the admin's approval before they show. The three seeded
 * quotes are the shop's own, quoted verbatim; nothing is invented.
 */

export function listReviews({ signal }: RequestOptions = {}) {
  return http.get<Review[]>(routes.catalog.reviews, { signal });
}

/** A shopper's review goes in as pending; the API limits how many one address can send. */
export function submitReview(input: Pick<Review, "name" | "text" | "stars" | "productId">) {
  return http.post<Review>(routes.catalog.reviews, input);
}

/* Admin (realm: admin) */

export const reviewsCrud = httpCrud<Review>(routes.adminCatalog.reviews, { module: "products", noun: "review", label: (r) => `from ${r.name}` });
