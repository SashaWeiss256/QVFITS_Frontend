/* Account Queries (realm: customer) */
// The customer dashboard's door to data. Every key sits under
// ["customer", id], so signing out removes all of it at once.
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { getProfile, saveAddresses, updateProfile } from "../../services/customers/customersApi";
import { getMyOrder, listMyOrders } from "../../services/sales/ordersApi";
import type { Address, Customer, Id } from "../../services/types";
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
  order: (id: Id, orderId?: Id) =>
    queryOptions({
      queryKey: [...customerRoot(id), "orders", orderId] as const,
      queryFn: ({ signal }) => getMyOrder(id, orderId!, { signal }),
      enabled: Boolean(orderId),
    }),
};

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
