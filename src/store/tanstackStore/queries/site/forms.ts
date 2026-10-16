/* Site Forms And Checkout */
import { useMutation } from "@tanstack/react-query";

import { ask, greeting } from "../../services/assistant/fitAssistantApi";
import { sendMessage, type ContactInput } from "../../services/content/contactApi";
import { subscribe } from "../../services/marketing/subscribersApi";
import { placeOrder, quote } from "../../services/sales/checkoutApi";
import { trackOrder } from "../../services/sales/ordersApi";
import type { CartLine, CheckoutInput, DeliveryRegion, Id } from "../../services/types";
import { adminRoot } from "../keys";

// Each form shows its own result and error inline, so none raises the
// app-wide notice.
const inline = { handlesErrors: true } as const;

export const useSendMessage = () =>
  useMutation({ mutationFn: (message: ContactInput) => sendMessage(message), meta: { ...inline, invalidates: [[...adminRoot, "messages"]] } });

// A new sign-up should show in the admin's Newsletter list straight away.
export const useSubscribe = () =>
  useMutation({ mutationFn: (email: string) => subscribe(email), meta: { ...inline, invalidates: [[...adminRoot, "subscribers"]] } });

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

export const useAskAssistant = () => useMutation({ mutationFn: (question: string) => ask(question), meta: inline });
export const assistantGreeting = greeting;
