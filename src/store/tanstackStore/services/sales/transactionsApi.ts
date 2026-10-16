/* Transactions Service (realm: admin) */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { adminCrud } from "../store/adminCrud";
import { createCollection, type NewRow } from "../store/collectionStore";
import type { Transaction } from "../types";
import transactionSeed from "@/data/transactions.json";

/**
 * Money in and out: a payment per paid order and a refund per refunded
 * return. With the API these come from the payment gateway's webhook and
 * mobile money callbacks; staff can also record one taken in the showroom.
 */
export const transactions = createCollection<Transaction>("transactions", transactionSeed as Transaction[], { idPrefix: "txn" });

export function recordTransaction(data: Omit<NewRow<Transaction>, "createdAt"> & { createdAt?: string }) {
  return transactions.create({ ...data, createdAt: data.createdAt ?? new Date().toISOString() });
}

export const listTransactions = ({ signal }: RequestOptions = {}) => mockApi(() => transactions.list(), 150, signal);

export const transactionsCrud = adminCrud(transactions, {
  module: "transactions",
  noun: "transaction",
  label: (t) => `${t.type} on ${t.orderRef}`,
  prepare: (data, existing) => (existing ? data : { status: "succeeded" as const, reference: "", createdAt: new Date().toISOString(), ...data }),
});
