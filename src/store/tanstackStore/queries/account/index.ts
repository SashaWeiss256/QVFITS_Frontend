/* Account Queries (realm: customer) */
// The customer dashboard's door to data. Every key sits under
// ["customer", id], so signing out removes all of it at once.
import { useEffect } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, saveAddresses, updateProfile } from "../../services/customers/customersApi";
import { cancelMyOrder, getMyOrder, listMyOrders } from "../../services/sales/ordersApi";
import { deleteMyAccount, downloadMyData } from "../../services/customers/privacyApi";
import { setMyNewsletter, subscriptionOf } from "../../services/marketing/subscribersApi";
import { listMyReturns, requestReturn, returnWindow } from "../../services/sales/returnsApi";
import { listenLive } from "../../services/realtime/liveApi";
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

// An unpaid order the customer calls off: its pieces go back on the shelf (gap O1).
export const useCancelMyOrder = (id: Id) =>
  useMutation({
    mutationFn: (orderId: Id) => cancelMyOrder(id, orderId),
    meta: { invalidates: [customerRoot(id), [...adminRoot, "orders"], [...adminRoot, "products"], ["site", "catalog"]], success: "Order cancelled", handlesErrors: true },
  });

// Privacy (gap A6): a copy of their data, and closing the account.
export const useDownloadMyData = (id: Id) => useMutation({ mutationFn: () => downloadMyData(id) });
export const useDeleteMyAccount = (id: Id) => useMutation({ mutationFn: () => deleteMyAccount(id), meta: { handlesErrors: true } });

// The account's newsletter switch, by the account's email.
export const useNewsletterStatus = (id: Id, email?: string) =>
  useQuery({ queryKey: [...customerRoot(id), "newsletter", email], queryFn: () => subscriptionOf(email!), enabled: Boolean(email) });
export const useSetNewsletter = (id: Id) =>
  useMutation({
    // Always the account's own email: on sends the confirmation (double opt-in), off unsubscribes.
    mutationFn: ({ on }: { email: string; on: boolean; name?: string }) => setMyNewsletter(on),
    meta: { invalidates: [[...customerRoot(id), "newsletter"], [...adminRoot, "subscribers"], [...adminRoot, "outbox"]], handlesErrors: true },
  });

/** The shopper's orders refresh the moment the shop moves one (paid, packed, on its way). */
export function useLiveAccount(id?: Id) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!id) return;
    return listenLive("customer", { "order:updated": () => queryClient.invalidateQueries({ queryKey: [...customerRoot(id), "orders"] }) });
  }, [id, queryClient]);
}

export const useProfile = (id: Id) => useQuery(accountQueries.profile(id));
export const useMyOrders = (id: Id) => useQuery(accountQueries.orders(id));
export const useMyOrder = (id: Id, orderId?: Id) => useQuery(accountQueries.order(id, orderId));

// Every account query sits under the shopper's own key, so one invalidation refreshes the profile, orders and addresses.
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
