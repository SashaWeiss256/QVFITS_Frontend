/* Transactions Service (realm: admin) */
import { routes } from "../api/routes";
import type { RequestOptions } from "../api/types";
import { httpCrud } from "../store/httpCrud";
import type { Transaction } from "../types";

/**
 * Money in and out, on the API: a payment per paid order and a refund per
 * refunded return. Later the payment gateway's webhook adds them too; staff
 * can also record one taken in the showroom.
 */
export const transactionsCrud = httpCrud<Transaction>(routes.adminSales.transactions, { module: "orders", noun: "transaction", label: (t) => `${t.type} on ${t.orderRef}` });

export const listTransactions = ({ signal }: RequestOptions = {}) => transactionsCrud.list({ signal });
