/* Site Queries */
// The storefront's only door to data. One hook per resource; sections that
// share a hook share the cache entry.
import { useQuery } from "@tanstack/react-query";

import type { ProductFilters } from "../../services/types";
import { catalogQueries } from "./catalog";
import { contentQueries } from "./content";

export const useProducts = (filters?: ProductFilters) => useQuery(catalogQueries.products(filters));
export const useProductSearch = (q: string) => useQuery(catalogQueries.search(q));
export const useProduct = (slug?: string) => useQuery(catalogQueries.product(slug));
export const useProductsByIds = (ids: string[]) => useQuery(catalogQueries.byIds(ids));
export const useFacets = () => useQuery(catalogQueries.facets());
export const useRails = () => useQuery(catalogQueries.rails());
export const useLooks = () => useQuery(catalogQueries.looks());
export const useReviews = () => useQuery(catalogQueries.reviews());
export const useSizeChart = () => useQuery(catalogQueries.sizeChart());
export const useSettings = () => useQuery(contentQueries.settings());
export const useHomeContent = () => useQuery(contentQueries.home());
export const useOffers = () => useQuery(contentQueries.offers());

export { catalogQueries, contentQueries };
export { assistantGreeting, useAskAssistant, usePlaceOrder, useQuote, useSendMessage, useSubscribe, useTrackOrder } from "./forms";
export type { CartLine, DeliveryRegion, Order, PaymentMethod, Product, ProductFilters } from "../../services/types";
