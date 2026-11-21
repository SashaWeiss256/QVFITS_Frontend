/* Admin Transactions */
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useCurrency } from "@/store/context/CurrencyContext";
import { paymentMethodsResource, transactionsResource, useCollection, useOrders } from "@/store/tanstackStore/queries/admin";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import Tabs from "@/AdminDashboard/components/Tabs";
import TxTotals from "./sections/TxTotals";
import { txColumns } from "./sections/txColumns";
import { TX_STATUS, abandonedFromOrders } from "./sections/txFields";

/**
 * Money in and out, each tied to its order: a payment when an order is
 * paid (by staff now, by the payment gateway later), a refund when a
 * return is refunded, and what never landed: failed, abandoned or reversed
 * at the gateway. Shop orders cancelled while unpaid show as abandoned until
 * the gateway reports those itself. Nothing is added or changed here, so the
 * books always match the orders; open a row to see its order. Deep link:
 * ?status=succeeded|pending|failed|abandoned|reversed.
 */
export default function AdminTransactions() {
  const tx = useCollection(transactionsResource);
  const methods = useCollection(paymentMethodsResource);
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { moneyBase } = useCurrency();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const methodLabel = (id) => (id === "cash" ? "Cash" : methods.items.find((m) => m.id === id)?.short ?? id);

  const all = useMemo(() => [...tx.items, ...abandonedFromOrders(orders, tx.items)], [tx.items, orders]);
  // Status lives in the URL so other pages can link straight to a tab; an unknown one means All.
  const status = params.get("status") in TX_STATUS ? params.get("status") : "all";
  const rows = status === "all" ? all : all.filter((t) => t.status === status);
  const tabs = [{ id: "all", label: "All", count: all.length }, ...Object.entries(TX_STATUS).map(([id, label]) => ({ id, label, count: all.filter((t) => t.status === id).length }))];
  const setStatus = (next) =>
    setParams((p) => {
      const out = new URLSearchParams(p);
      next === "all" ? out.delete("status") : out.set("status", next);
      return out;
    }, { replace: true });

  const loading = tx.isLoading || ordersLoading;

  return (
    <>
      <PageHeader lede="Every payment in and refund out, in UGX, each tied to its order, and every payment that failed or was abandoned. Record payments and refunds on the order itself." />
      <TxTotals rows={rows} money={moneyBase} loading={loading} />
      <Tabs tabs={tabs} value={status} onChange={setStatus} />
      <Panel>
        <DataTable
          filterDrawer
          rows={rows}
          loading={loading}
          columns={txColumns({ methodLabel, money: moneyBase })}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(t) => `${t.orderRef} ${t.reference} ${t.reason ?? ""}`}
          searchLabel="Search order, reference or reason"
          filters={[
            { id: "type", label: "Type", options: [{ value: "payment", label: "Payments" }, { value: "refund", label: "Refunds" }], test: (t, v) => t.type === v },
            { id: "method", label: "Method", options: [{ value: "cash", label: "Cash" }, ...methods.items.map((m) => ({ value: m.id, label: m.short }))], test: (t, v) => t.method === v },
          ]}
          onRowClick={(t) => navigate(`/admin/orders?order=${t.orderId}`)}
          exportName={status === "all" ? "payments" : `payments-${status}`}
          exportRow={(t) => ({ date: t.createdAt, order: t.orderRef, type: t.type, method: t.method, reference: t.reference, status: t.status, reason: t.reason ?? "", amount: t.type === "refund" ? -t.amount : t.amount })}
          empty={status === "all" ? "No payments yet. Recording a payment on an order adds one." : `No ${TX_STATUS[status].toLowerCase()} payments.`}
        />
      </Panel>
    </>
  );
}
