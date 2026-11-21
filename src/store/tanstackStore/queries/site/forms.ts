/* Site Forms And Checkout */
import { useMutation, useQuery } from "@tanstack/react-query";

import { ask, greeting, suggestOutfits } from "../../services/assistant/fitAssistantApi";
import { sendMessage, type ContactInput } from "../../services/content/contactApi";
import { confirmSubscription, getNewsletterConsent, subscribe, unsubscribe } from "../../services/marketing/subscribersApi";
import { latestEmail } from "../../services/notifications/outboxApi";
import type { SubscriberSource } from "../../services/types";
import { placeOrder, quote } from "../../services/sales/checkoutApi";
import { cancelGuestOrder, trackOrder } from "../../services/sales/ordersApi";
import { getPaymentStatus, goToPesapal, payMyOrder, retryPayment } from "../../services/sales/paymentsApi";
// For the UI: leaving for Pesapal after checkout, and which methods it takes.
export { goToPesapal, ONLINE_METHODS } from "../../services/sales/paymentsApi";
import { requestGuestReturn } from "../../services/sales/returnsApi";
import type { CartLine, CheckoutInput, DeliveryRegion, Id } from "../../services/types";
import { adminRoot } from "../keys";

// Each form shows its own result and error inline, so none raises the
// app-wide notice.
const inline = { handlesErrors: true } as const;

export const useSendMessage = () =>
  useMutation({ mutationFn: (message: ContactInput) => sendMessage(message), meta: { ...inline, invalidates: [[...adminRoot, "messages"]] } });

// A new sign-up should show in the admin's Newsletter list straight away.
export const useSubscribe = () =>
  useMutation({
    mutationFn: ({ email, source, name, customerId }: { email: string; source: SubscriberSource; name?: string; customerId?: Id }) => subscribe(email, { source, name, customerId }),
    meta: { ...inline, invalidates: [[...adminRoot, "subscribers"], [...adminRoot, "outbox"]] },
  });
export const useNewsletterConsent = () => useQuery({ queryKey: ["site", "newsletter-consent"], queryFn: ({ signal }) => getNewsletterConsent({ signal }), staleTime: 60_000 });

/**
 * Dev builds only: the link from the newest email of a kind to an address,
 * so the confirm and reset flows can be tried without an email service.
 */
export const demoEmailLink = (to: string, kind: Parameters<typeof latestEmail>[1]) => (import.meta.env.DEV ? latestEmail(to, kind)?.link ?? null : null);

// The emailed links: confirm and unsubscribe.
export const useConfirmSubscription = () =>
  useMutation({ mutationFn: (token: string) => confirmSubscription(token), meta: { ...inline, invalidates: [[...adminRoot, "subscribers"], [...adminRoot, "outbox"]] } });
export const useUnsubscribe = () => useMutation({ mutationFn: (token: string) => unsubscribe(token), meta: { ...inline, invalidates: [[...adminRoot, "subscribers"]] } });

// Prices the bag on the server side (delivery and any code), so the shown total matches the order.
export const useQuote = () =>
  useMutation({
    mutationFn: ({ lines, region, code, customerId }: { lines: CartLine[]; region: DeliveryRegion; code?: string; customerId?: Id }) =>
      quote(lines, region, code, { customerId }),
    meta: inline,
  });

// A new order refreshes the shopper's order history and the admin's order list.
export const usePlaceOrder = () =>
  useMutation({
    mutationFn: ({ input, customerId }: { input: CheckoutInput; customerId?: Id }) => placeOrder(input, customerId),
    // Stock moved too, so the shop's catalogue refetches.
    meta: { ...inline, invalidates: [["customer"], [...adminRoot, "orders"], [...adminRoot, "products"], ["site", "catalog"]] },
  });

// A mutation, not a query: it runs on submit with what was typed, and nothing is cached.
export const useTrackOrder = () =>
  useMutation({ mutationFn: ({ ref, phone }: { ref: string; phone: string }) => trackOrder(ref, phone), meta: inline });

// From Track an order: a guest cancels an unpaid order, or asks for a return (gaps O1, O2).
export const useCancelGuestOrder = () =>
  useMutation({ mutationFn: ({ ref, phone }: { ref: string; phone: string }) => cancelGuestOrder(ref, phone), meta: { ...inline, invalidates: [[...adminRoot, "orders"], ["site", "catalog"]] } });
export const useGuestReturn = () =>
  useMutation({
    mutationFn: ({ ref, phone, input }: { ref: string; phone: string; input: Parameters<typeof requestGuestReturn>[2] }) => requestGuestReturn(ref, phone, input),
    meta: { ...inline, invalidates: [[...adminRoot, "returns"]] },
  });

/*
 * Online payment (Pesapal). The return page asks where the payment stands
 * every few seconds while it is still open, for up to two minutes: a mobile
 * money prompt can take a moment to be approved. After that the shopper can
 * check again by hand.
 */
const POLL_MS = 3_000;
const POLL_FOR_MS = 2 * 60_000;
export const usePaymentStatus = (ref?: string, trackingId?: string) =>
  useQuery({
    queryKey: ["site", "payment", ref, trackingId],
    queryFn: ({ signal }) => getPaymentStatus(ref!, trackingId!, { signal }),
    enabled: Boolean(ref && trackingId),
    retry: 1,
    refetchInterval: (q) => (q.state.data?.status === "pending" && Date.now() - firstSeen(q.queryHash) < POLL_FOR_MS ? POLL_MS : false),
  });
// When each payment was first asked about, so polling stops after POLL_FOR_MS.
const seen = new Map<string, number>();
const firstSeen = (hash: string) => {
  if (!seen.has(hash)) seen.set(hash, Date.now());
  return seen.get(hash)!;
};

/**
 * Open Pesapal for what is still due, and go there: with the last attempt's
 * tracking id or the order's phone (a guest), or as the signed-in owner.
 */
export const usePayAgain = () =>
  useMutation({
    mutationFn: (key: { ref: string; trackingId: string } | { ref: string; phone: string } | { orderId: Id }) =>
      "orderId" in key ? payMyOrder(key.orderId) : retryPayment(key),
    onSuccess: ({ redirectUrl }) => goToPesapal(redirectUrl),
    meta: inline,
  });

export const useAskAssistant = () => useMutation({ mutationFn: (question: string) => ask(question), meta: inline });
export const assistantGreeting = greeting;
/** Outfits built around one piece (product page, bag): kits first, then colour-checked mixes. */
export const useStyleWith = (productId?: string) => useQuery({ queryKey: ["site", "style-with", productId], queryFn: () => suggestOutfits(productId as string), enabled: Boolean(productId), staleTime: 60_000 });
/** Clears what Vee remembers about this shopper (name, size, budget, colours). */
export { forgetMe as forgetAssistant } from "../../services/assistant/fitAssistantApi";
