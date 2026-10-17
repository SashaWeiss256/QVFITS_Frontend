/* Payments */
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { paymentMethodsResource, transactionsResource, useCollection } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";

/**
 * Money in and out, each tied to its order: a payment when an order is
 * paid (by staff now, by the payment gateway later), a refund when a
 * return is refunded. Nothing is added or changed here, so the books
 * always match the orders; open a row to see its order.
 */
export default function Payments() {
  const tx = useCollection(transactionsResource);
  const methods = useCollection(paymentMethodsResource);
  const { moneyBase } = useCurrency();
  const navigate = useNavigate();
  const label = (id) => (id === "cash" ? "Cash" : methods.items.find((m) => m.id === id)?.short ?? id);

  const done = tx.items.filter((t) => t.status === "succeeded");
  const inflow = done.filter((t) => t.type === "payment").reduce((n, t) => n + t.amount, 0);
  const outflow = done.filter((t) => t.type === "refund").reduce((n, t) => n + t.amount, 0);

  const columns = [
    { key: "createdAt", label: "When", sort: (t) => t.createdAt, render: (t) => formatDateTime(t.createdAt) },
    { key: "orderRef", label: "Order", render: (t) => <strong className="font-display">{t.orderRef}</strong> },
    { key: "type", label: "Type", render: (t) => (t.type === "refund" ? "Refund" : "Payment") },
    { key: "method", label: "Method", render: (t) => label(t.method) },
    { key: "reference", label: "Reference", render: (t) => t.reference || <span className="text-ink-4">None</span> },
    { key: "status", label: "Status", render: (t) => <StatusChip status={t.status} /> },
    { key: "amount", label: "Amount", align: "right", sort: (t) => t.amount, render: (t) => <span className={t.type === "refund" ? "text-warn" : ""}>{t.type === "refund" ? "-" : ""}{moneyBase(t.amount)}</span> },
  ];

  return (
    <>
      <PageHeader lede="Every payment in and refund out, in UGX, each tied to its order. Record payments and refunds on the order itself." />
      <section aria-label="Totals" className="mb-6 grid gap-px overflow-hidden rounded-r-lg border border-line bg-line sm:grid-cols-3">
        <StatCard label="Taken" icon={ArrowDownLeft} value={moneyBase(inflow)} note={`${done.filter((t) => t.type === "payment").length} payments`} />
        <StatCard label="Refunded" icon={ArrowUpRight} value={moneyBase(outflow)} note={`${done.filter((t) => t.type === "refund").length} refunds`} />
        <StatCard label="Net" icon={Scale} value={moneyBase(inflow - outflow)} />
      </section>
      <Panel>
        <DataTable
          filterDrawer
          rows={tx.items}
          loading={tx.isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(t) => `${t.orderRef} ${t.reference}`}
          searchLabel="Search order or reference"
          filters={[
            { id: "type", label: "Type", options: [{ value: "payment", label: "Payments" }, { value: "refund", label: "Refunds" }], test: (t, v) => t.type === v },
            { id: "method", label: "Method", options: [{ value: "cash", label: "Cash" }, ...methods.items.map((m) => ({ value: m.id, label: m.short }))], test: (t, v) => t.method === v },
            { id: "status", label: "Status", options: [{ value: "succeeded", label: "Succeeded" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }], test: (t, v) => t.status === v },
          ]}
          onRowClick={(t) => navigate(`/admin/orders?order=${t.orderId}`)}
          exportName="payments"
          exportRow={(t) => ({ date: t.createdAt, order: t.orderRef, type: t.type, method: t.method, reference: t.reference, status: t.status, amount: t.type === "refund" ? -t.amount : t.amount })}
          empty="No payments yet. Recording a payment on an order adds one."
        />
      </Panel>
    </>
  );
}
