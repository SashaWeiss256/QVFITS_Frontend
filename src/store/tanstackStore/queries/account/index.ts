/* Account Queries (realm: customer) */
// The customer dashboard's door to data. Every key sits under
// ["customer", id], so signing out removes all of it at once.
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { getProfile, saveAddresses, updateProfile } from "../../services/customers/customersApi";
import { getMyOrder, listMyOrders } from "../../services/sales/ordersApi";
import { listMyReturns, requestReturn, returnWindow } from "../../services/sales/returnsApi";
import type { Address, Customer, Id, ReturnRequest } from "../../services/types";
import { adminRoot } from "../keys";
import { customerRoot } from "../keys";

export const accountQueries = {
  profile: (id: Id) =>
    queryOptions({
      queryKey: [...customerRoot(id), "profile"] as const,
      queryFn: ({ signal }) => getProfile(id, { signal }),
      meta: { label: "your profile" },
    }),
  orders: (id: Id) =>
    queryOptions({
      queryKey: [...customerRoot(id), "orders"] as const,
      queryFn: ({ signal }) => listMyOrders(id, { signal }),
      meta: { label: "your orders" },
    }),
  // Nested under "orders" so refreshing the list also refreshes an open order.
  order: (id: Id, orderId?: Id) =>
    queryOptions({
      queryKey: [...customerRoot(id), "orders", orderId] as const,
      queryFn: ({ signal }) => getMyOrder(id, orderId!, { signal }),
      enabled: Boolean(orderId),
    }),
  returns: (id: Id) =>
    queryOptions({ queryKey: [...customerRoot(id), "returns"] as const, queryFn: ({ signal }) => listMyReturns(id, { signal }) }),
};

export const useMyReturns = (id: Id) => useQuery(accountQueries.returns(id));

// A request shows in the admin's Returns queue straight away.
export const useRequestReturn = (id: Id) =>
  useMutation({
    mutationFn: (input: Pick<ReturnRequest, "orderId" | "lines" | "reason" | "resolution">) => requestReturn(id, input),
    meta: { invalidates: [customerRoot(id), [...adminRoot, "returns"]], success: "Request sent", handlesErrors: true },
  });

export { returnWindow };

export const useProfile = (id: Id) => useQuery(accountQueries.profile(id));
export const useMyOrders = (id: Id) => useQuery(accountQueries.orders(id));
export const useMyOrder = (id: Id, orderId?: Id) => useQuery(accountQueries.order(id, orderId));

export const useUpdateProfile = (id: Id) =>
  useMutation({
    mutationFn: (patch: Pick<Partial<Customer>, "name" | "phone">) => updateProfile(id, patch),
    meta: { invalidates: [customerRoot(id)], success: "Profile saved" },
  });

export const useSaveAddresses = (id: Id) =>
  useMutation({
    mutationFn: (addresses: Address[]) => saveAddresses(id, addresses),
    meta: { invalidates: [customerRoot(id)], success: "Addresses saved" },
  });
