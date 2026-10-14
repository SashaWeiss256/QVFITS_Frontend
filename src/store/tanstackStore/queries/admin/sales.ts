/* Admin Sales Resources */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listCustomers } from "../../services/customers/customersApi";
import { createDiscount, listDiscounts, removeDiscount, updateDiscount } from "../../services/sales/discountsApi";
import { listOrders, updateOrderStatus } from "../../services/sales/ordersApi";
import { getOverview } from "../../services/sales/reportsApi";
import type { Customer, Discount, Id, Order, OrderStatus } from "../../services/types";
import type { NewRow } from "../../services/store/collectionStore";
import { adminRoot } from "../keys";
import { collectionQueries, type CollectionResource } from "./collection";

export const orderQueries = collectionQueries<Order>("orders", listOrders, { label: "orders" });
export const customerQueries = collectionQueries<Customer>("customers", listCustomers, { label: "customers" });
export const discountQueries = collectionQueries<Discount>("discounts", listDiscounts, { label: "discount codes" });

export const discountsResource: CollectionResource<Discount, NewRow<Discount>, Partial<Discount>> = {
  queries: discountQueries,
  create: createDiscount,
  update: (id: Id, data: Partial<Discount>) => updateDiscount(id, data),
  remove: removeDiscount,
  noun: "Discount code",
};

export const overviewQueries = {
  overview: () =>
    queryOptions({
      queryKey: [...adminRoot, "overview"] as const,
      queryFn: ({ signal }) => getOverview({ signal }),
      meta: { label: "the overview" },
    }),
};

export const useOrders = () => useQuery(orderQueries.list());
export const useCustomers = () => useQuery(customerQueries.list());
export const useOverview = () => useQuery(overviewQueries.overview());

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: Id; status: OrderStatus }) => updateOrderStatus(id, status),
    meta: { invalidates: [orderQueries.all(), overviewQueries.overview().queryKey], success: "Order updated" },
  });
