/* Admin Sales Resources */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listCustomers, removeCustomer, updateCustomer } from "../../services/customers/customersApi";
import { createManualOrder } from "../../services/sales/checkoutApi";
import { discountsCrud, listDiscounts, randomCode } from "../../services/sales/discountsApi";
import { addOrderNote, listOrders, markOrderPaid, NEXT_STATUS, updateOrderStatus } from "../../services/sales/ordersApi";
import { getOverview } from "../../services/sales/reportsApi";
import { listReturns, NEXT_RETURN_STATUS, returnWindow, updateReturnStatus } from "../../services/sales/returnsApi";
import { listTransactions, transactionsCrud } from "../../services/sales/transactionsApi";
import type { CheckoutInput, Customer, Discount, Id, Order, OrderStatus, PaymentMethod, ReturnRequest, ReturnStatus, Transaction } from "../../services/types";
import { adminRoot, siteRoot } from "../keys";
import { collectionQueries, crudResource, type CollectionResource } from "./collection";

// Each list gets the shared collection keys, so one invalidation refreshes every view of it.
export const orderQueries = collectionQueries<Order>("orders", listOrders, { label: "orders" });
export const customerQueries = collectionQueries<Customer>("customers", listCustomers, { label: "customers" });
export const returnQueries = collectionQueries<ReturnRequest>("returns", listReturns, { label: "returns" });

export const discountsResource = crudResource<Discount>("discounts", discountsCrud, { noun: "Discount code", label: "discount codes", list: listDiscounts, alsoInvalidates: [] });
export const transactionsResource = crudResource<Transaction>("transactions", transactionsCrud, { noun: "Transaction", list: listTransactions, alsoInvalidates: [] });

export const customersResource: CollectionResource<Customer, never, Pick<Partial<Customer>, "notes" | "tags">> = {
  queries: customerQueries,
  update: updateCustomer,
  remove: removeCustomer,
  noun: "Customer",
};

// Derived from orders, stock and the inboxes, so most sales writes refresh it.
export const overviewQueries = {
  overview: (days = 30) =>
    queryOptions({
      queryKey: [...adminRoot, "overview", days] as const,
      queryFn: ({ signal }) => getOverview(days, { signal }),
      meta: { label: "the overview" },
    }),
};

export const useOrders = () => useQuery(orderQueries.list());
export const useCustomers = () => useQuery(customerQueries.list());
export const useReturns = () => useQuery(returnQueries.list());
export const useOverview = (days = 30, enabled = true) => useQuery({ ...overviewQueries.overview(days), enabled });

// An order change can move money, stock and the overview, so all of them refetch.
const orderWrite = [orderQueries.all(), transactionsResource.queries.all(), [...adminRoot, "overview"], [...adminRoot, "products"], [...adminRoot, "activity"], siteRoot];

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status, note }: { id: Id; status: OrderStatus; note?: string }) => updateOrderStatus(id, status, note),
    meta: { invalidates: orderWrite, success: "Order updated" },
  });
export const useMarkOrderPaid = () =>
  useMutation({
    mutationFn: ({ id, method, reference }: { id: Id; method: PaymentMethod; reference: string }) => markOrderPaid(id, { method, reference }),
    meta: { invalidates: orderWrite, success: "Payment recorded" },
  });
export const useAddOrderNote = () =>
  useMutation({ mutationFn: ({ id, text }: { id: Id; text: string }) => addOrderNote(id, text), meta: { invalidates: [orderQueries.all()], success: "Note added" } });
export const useCreateManualOrder = () =>
  useMutation({
    mutationFn: ({ input, customerId }: { input: CheckoutInput; customerId?: Id }) => createManualOrder(input, customerId),
    meta: { invalidates: orderWrite, success: "Order created" },
  });
export const useUpdateReturnStatus = () =>
  useMutation({
    mutationFn: ({ id, status, note }: { id: Id; status: ReturnStatus; note?: string }) => updateReturnStatus(id, status, note),
    meta: { invalidates: [returnQueries.all(), ...orderWrite], success: "Return updated" },
  });

export { NEXT_RETURN_STATUS, NEXT_STATUS, randomCode, returnWindow };
