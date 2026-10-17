/* Admin Sales Resources */
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { listCustomers, updateCustomer } from "../../services/customers/customersApi";
import { eraseCustomer } from "../../services/customers/privacyApi";
import { recordSale } from "../../services/sales/checkoutApi";
import { discountsCrud, listDiscounts, randomCode } from "../../services/sales/discountsApi";
import { addOrderNote, listOrders, markOrderPaid, NEXT_STATUS, updateOrderStatus } from "../../services/sales/ordersApi";
import { getOverview, getReports, type ReportRange } from "../../services/sales/reportsApi";
import { listOrderEmails } from "../../services/sales/ordersApi";
import { listReturns, NEXT_RETURN_STATUS, openReturn, refundDue, returnWindow, updateReturnStatus } from "../../services/sales/returnsApi";
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
  // A privacy request: the account goes, its orders stay without the name (gap A6).
  remove: eraseCustomer,
  noun: "Customer",
  alsoInvalidates: [[...adminRoot, "orders"], [...adminRoot, "subscribers"], [...adminRoot, "overview"]],
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
// The shell polls it (every 60s) so a new order is noticed while the admin is open (gap O5).
export const useOverview = (days = 30, enabled = true, refetchInterval: number | false = false) => useQuery({ ...overviewQueries.overview(days), enabled, refetchInterval });

// Reports are read for a period; any order write refreshes them through the overview key's parent.
export const useReports = (range: ReportRange) =>
  useQuery({
    queryKey: [...adminRoot, "overview", "reports", range] as const,
    queryFn: ({ signal }) => getReports(range, { signal }),
    meta: { label: "the reports" },
  });

// An order change can move money, stock and the overview, so all of them refetch.
const orderWrite = [orderQueries.all(), transactionsResource.queries.all(), [...adminRoot, "overview"], [...adminRoot, "products"], [...adminRoot, "stock-movements"], [...adminRoot, "activity"], [...adminRoot, "outbox"], siteRoot];

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status, note }: { id: Id; status: OrderStatus; note?: string }) => updateOrderStatus(id, status, note),
    meta: { invalidates: orderWrite, success: "Order updated" },
  });
export const useMarkOrderPaid = () =>
  useMutation({
    mutationFn: ({ id, method, reference, amount }: { id: Id; method: PaymentMethod; reference: string; amount?: number }) => markOrderPaid(id, { method, reference, amount }),
    meta: { invalidates: orderWrite, success: "Payment recorded" },
  });
export const useAddOrderNote = () =>
  useMutation({ mutationFn: ({ id, text }: { id: Id; text: string }) => addOrderNote(id, text), meta: { invalidates: [orderQueries.all()], success: "Note added" } });
// The messages sent to the customer about one order (outbox), for the drawer.
export const useOrderEmails = (ref?: string) =>
  useQuery({ queryKey: [...adminRoot, "outbox", "order", ref], queryFn: ({ signal }) => listOrderEmails(ref!, { signal }), enabled: Boolean(ref) });

export const useRecordSale = () =>
  useMutation({
    mutationFn: ({ input, source, method, reference, customerId }: { input: CheckoutInput; source: "showroom" | "whatsapp"; method: PaymentMethod; reference?: string; customerId?: Id }) =>
      recordSale(input, { source, method, reference }, customerId),
    meta: { invalidates: orderWrite, success: "Sale recorded" },
  });
export const useOpenReturn = () =>
  useMutation({
    mutationFn: (input: Parameters<typeof openReturn>[0]) => openReturn(input),
    meta: { invalidates: [returnQueries.all(), ...orderWrite], success: "Return opened" },
  });
export const useUpdateReturnStatus = () =>
  useMutation({
    mutationFn: ({ id, status, note, amount }: { id: Id; status: ReturnStatus; note?: string; amount?: number }) => updateReturnStatus(id, status, note, amount),
    meta: { invalidates: [returnQueries.all(), ...orderWrite], success: "Return updated" },
  });

export { NEXT_RETURN_STATUS, NEXT_STATUS, randomCode, refundDue, returnWindow };
