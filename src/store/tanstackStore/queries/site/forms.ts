/* Site Forms And Checkout */
import { useMutation } from "@tanstack/react-query";

import { ask, greeting } from "../../services/assistant/fitAssistantApi";
import { sendMessage, type ContactMessage } from "../../services/content/contactApi";
import { subscribe } from "../../services/marketing/subscribersApi";
import { placeOrder, quote } from "../../services/sales/checkoutApi";
import { trackOrder } from "../../services/sales/ordersApi";
import type { CartLine, CheckoutInput, DeliveryRegion, Id } from "../../services/types";
import { adminRoot } from "../keys";

// Each form shows its own result and error inline, so none raises the
// app-wide notice.
const inline = { handlesErrors: true } as const;

export const useSendMessage = () =>
  useMutation({ mutationFn: (message: ContactMessage) => sendMessage(message), meta: inline });

export const useSubscribe = () =>
  useMutation({ mutationFn: (email: string) => subscribe(email), meta: { ...inline, invalidates: [[...adminRoot, "subscribers"]] } });

export const useQuote = () =>
  useMutation({
    mutationFn: ({ lines, region, code }: { lines: CartLine[]; region: DeliveryRegion; code?: string }) => quote(lines, region, code),
    meta: inline,
  });

export const usePlaceOrder = () =>
  useMutation({
    mutationFn: ({ input, customerId }: { input: CheckoutInput; customerId?: Id }) => placeOrder(input, customerId),
    meta: { ...inline, invalidates: [["customer"], [...adminRoot, "orders"]] },
  });

export const useTrackOrder = () =>
  useMutation({ mutationFn: ({ ref, phone }: { ref: string; phone: string }) => trackOrder(ref, phone), meta: inline });

export const useAskAssistant = () => useMutation({ mutationFn: (question: string) => ask(question), meta: inline });
export const assistantGreeting = greeting;
