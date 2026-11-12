/* Payment Methods Service */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud, byPosition } from "../store/adminCrud";
import { createCollection } from "../store/collectionStore";
import type { PaymentMethodOption } from "../types";
import methodSeed from "@/data/payment-methods.json";

/**
 * How a shopper can pay. The admin switches each on or off and edits what
 * checkout says about it; taking the money is the payment gateway's job.
 */
const methods = createCollection<PaymentMethodOption>("payment-methods", methodSeed as PaymentMethodOption[], { idPrefix: "pay" });

export function listPaymentMethods({ signal }: RequestOptions = {}) {
  return mockApi(() => byPosition(methods.list()).filter((m) => m.active), 100, signal);
}

/* Admin (realm: admin) */

export const listAllPaymentMethods = ({ signal }: RequestOptions = {}) => mockApi(() => byPosition(methods.list()), 100, signal);

export const paymentMethodsCrud = adminCrud(methods, {
  module: "settings",
  noun: "payment method",
  label: (m) => m.label,
});
