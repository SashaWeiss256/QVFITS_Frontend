/* Payments Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { Id, RequestOptions } from "../api/types";
import type { PaymentStatusView } from "../types";

/**
 * Online payment through Pesapal (MTN MoMo, Airtel Money, cards). Checkout
 * sends the shopper to Pesapal's page; Pesapal sends them back to
 * /order/:ref/payment?OrderTrackingId=…, which asks here where it stands.
 * Only the API decides a payment happened, by asking Pesapal itself.
 */

const P = routes.payments;

/** Where a payment stands, checked with Pesapal while it is still open. */
export function getPaymentStatus(ref: string, trackingId: string, { signal }: RequestOptions = {}) {
  return http.post<PaymentStatusView>(P.status, { ref, trackingId }, { signal });
}

/**
 * Open Pesapal again for what is still due. A guest proves the order is theirs
 * with the last attempt's tracking id (the return page) or the order's phone.
 */
export function retryPayment(key: { ref: string; trackingId: string } | { ref: string; phone: string }) {
  return http.post<{ redirectUrl: string }>(P.retry, key);
}

/** A signed-in shopper pays one of their own unpaid orders. */
export function payMyOrder(id: Id) {
  return http.post<{ redirectUrl: string }>(`${routes.account.orders}/${id}/pay`, undefined, { realm: "customer" });
}

/** Leave for Pesapal's page. A full page load, so the shop resumes cleanly when the shopper comes back. */
export function goToPesapal(redirectUrl: string) {
  window.location.assign(redirectUrl);
}

/** The methods Pesapal takes (as the API's ONLINE_METHODS); WhatsApp orders are confirmed by hand. */
export const ONLINE_METHODS = new Set(["mtn", "airtel", "card"]);
