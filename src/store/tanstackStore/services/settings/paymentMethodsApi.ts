/* Payment Methods Service */
import { http } from "../api/client";
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { PaymentMethodOption } from "../types";

/**
 * How a shopper can pay, on the API. The admin switches each on or off and
 * edits what checkout says about it; taking the money is the payment
 * gateway's job.
 */
export function listPaymentMethods({ signal }: RequestOptions = {}) {
  return http.get<PaymentMethodOption[]>(routes.shop.paymentMethods, { signal });
}

/* Admin (realm: admin) */

export const paymentMethodsCrud = httpCrud<PaymentMethodOption>(routes.adminSales.paymentMethods, { module: "settings", noun: "payment method", label: (m) => m.label });
export const listAllPaymentMethods = paymentMethodsCrud.list;
