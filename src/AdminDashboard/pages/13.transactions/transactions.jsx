/* Admin Transactions */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Modal from "@/components/ui/Modal";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { paymentMethodsResource, transactionsResource, useCollection, useOrders } from "@/store/tanstackStore/queries/admin";
import { formatDateTime } from "@/utils/format";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import StatCard from "@/AdminDashboard/components/StatCard";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { ORDERS_TABS } from "@/AdminDashboard/lib/constants";

/**
 * Money in and out: a payment for each paid order, a refund for each
 * refunded return. With the payment gateway live these arrive by webhook;
 * until then they are recorded from the order or added here by hand.
 */
export default function AdminTransactions() {
  const tx = useCollection(transactionsResource);
  const methods = useCollection(paymentMethodsResource);
  const { data: orders = [] } = useOrders();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [adding, setAdding] = useState(null);
  const label = (id) => methods.items.find((m) => m.id === id)?.short ?? id;

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

  const save = async () => {
    const order = orders.find((o) => o.id === adding.orderId);
    await tx.create({ ...adding, orderRef: order.ref, amount: Number(adding.amount) || order.total });
    setAdding(null);
  };

  return (
    <>
      <PageHeader
        title="Transactions"
        lede="Every payment in and refund out, in UGX."
        action={can("transactions", "edit") && <Button onClick={() => setAdding({ orderId: "", type: "payment", method: methods.items[0]?.id ?? "mtn", amount: "", reference: "", status: "succeeded" })}><Plus className="h-4 w-4" aria-hidden="true" /> Record one</Button>}
      />
      <AdminNavTabs tabs={ORDERS_TABS} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Taken" value={moneyBase(inflow)} />
        <StatCard label="Refunded" value={moneyBase(outflow)} />
        <StatCard label="Net" value={moneyBase(inflow - outflow)} />
      </div>
      <Panel>
        <DataTable
          rows={tx.items}
          loading={tx.isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(t) => `${t.orderRef} ${t.reference}`}
          searchLabel="Search order or reference"
          filters={[
            { id: "type", label: "Type", options: [{ value: "payment", label: "Payments" }, { value: "refund", label: "Refunds" }], test: (t, v) => t.type === v },
            { id: "method", label: "Method", options: methods.items.map((m) => ({ value: m.id, label: m.short })), test: (t, v) => t.method === v },
            { id: "status", label: "Status", options: [{ value: "succeeded", label: "Succeeded" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }], test: (t, v) => t.status === v },
          ]}
          rowActions={(t) => [
            { label: "Mark succeeded", onClick: () => tx.update(t.id, { status: "succeeded" }), hidden: t.status === "succeeded" || !can("transactions", "edit") },
            { label: "Mark failed", onClick: () => tx.update(t.id, { status: "failed" }), hidden: t.status === "failed" || !can("transactions", "edit") },
          ]}
          exportName="transactions"
          exportRow={(t) => ({ date: t.createdAt, order: t.orderRef, type: t.type, method: t.method, reference: t.reference, status: t.status, amount: t.type === "refund" ? -t.amount : t.amount })}
          empty="No transactions yet. Recording a payment on an order adds one."
        />
      </Panel>
      <Modal
        isOpen={Boolean(adding)}
        onClose={() => setAdding(null)}
        title="Record a transaction"
        size="sm"
        footer={<div className="flex justify-end gap-2.5"><Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button><Button onClick={save} loading={tx.isSaving} disabled={!adding?.orderId}>Save</Button></div>}
      >
        {adding && (
          <div className="grid gap-4">
            <Field label="Order" options={[{ value: "", label: "Pick an order" }, ...orders.map((o) => ({ value: o.id, label: `${o.ref} · ${o.name} · ${moneyBase(o.total)}` }))]} value={adding.orderId} onChange={(e) => setAdding({ ...adding, orderId: e.target.value })} />
            <Field label="Type" options={[{ value: "payment", label: "Payment in" }, { value: "refund", label: "Refund out" }]} value={adding.type} onChange={(e) => setAdding({ ...adding, type: e.target.value })} />
            <Field label="Method" options={methods.items.map((m) => ({ value: m.id, label: m.label }))} value={adding.method} onChange={(e) => setAdding({ ...adding, method: e.target.value })} />
            <Field label="Amount (UGX)" inputMode="numeric" value={adding.amount} onChange={(e) => setAdding({ ...adding, amount: e.target.value.replace(/\D/g, "") })} hint="Leave empty for the order total." />
            <Field label="Reference" value={adding.reference} onChange={(e) => setAdding({ ...adding, reference: e.target.value })} />
          </div>
        )}
      </Modal>
    </>
  );
}
