/* Site Catalog Queries */
import { queryOptions } from "@tanstack/react-query";

import { getFacets } from "../../services/catalog/categoriesApi";
import { getRails, listLooks } from "../../services/catalog/collectionsApi";
import { getProduct, getProductsByIds, listProducts } from "../../services/catalog/productsApi";
import { listReviews } from "../../services/catalog/reviewsApi";
import { getSizeChart } from "../../services/catalog/sizeChartApi";
import type { ProductFilters } from "../../services/types";
import { siteRoot } from "../keys";

export const catalogQueries = {
  all: () => [...siteRoot, "catalog"] as const,
  products: (filters: ProductFilters = {}) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "products", filters] as const,
      queryFn: ({ signal }) => listProducts(filters, { signal }),
      meta: { label: "the shop" },
    }),
  /** Header search: runs from the second letter. */
  search: (q: string) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "search", q] as const,
      queryFn: ({ signal }) => listProducts({ q }, { signal }),
      enabled: q.length >= 2,
    }),
  product: (slug?: string) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "product", slug] as const,
      queryFn: ({ signal }) => getProduct(slug!, { signal }),
      enabled: Boolean(slug),
      meta: { label: "this piece" },
    }),
  byIds: (ids: string[]) =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "by-ids", ids] as const,
      queryFn: ({ signal }) => getProductsByIds(ids, { signal }),
      enabled: ids.length > 0,
    }),
  facets: () =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "facets"] as const,
      queryFn: ({ signal }) => getFacets({ signal }),
      staleTime: Infinity,
    }),
  rails: () =>
    queryOptions({ queryKey: [...catalogQueries.all(), "rails"] as const, queryFn: ({ signal }) => getRails({ signal }) }),
  looks: () =>
    queryOptions({ queryKey: [...catalogQueries.all(), "looks"] as const, queryFn: ({ signal }) => listLooks({ signal }) }),
  reviews: () =>
    queryOptions({ queryKey: [...catalogQueries.all(), "reviews"] as const, queryFn: ({ signal }) => listReviews({ signal }) }),
  sizeChart: () =>
    queryOptions({
      queryKey: [...catalogQueries.all(), "size-chart"] as const,
      queryFn: ({ signal }) => getSizeChart({ signal }),
      staleTime: Infinity,
    }),
};
