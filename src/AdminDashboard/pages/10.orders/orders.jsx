/* Admin Orders */
import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { paymentMethodsResource, productsResource, settingsResource, useCollection, useDocument, useOrders } from "@/store/tanstackStore/queries/admin";
import { formatDate } from "@/utils/format";
import { ORDER_STATUSES } from "@/utils/orderStatus";
import DataTable from "@/AdminDashboard/components/DataTable";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { ORDERS_TABS } from "@/AdminDashboard/lib/constants";
import ManualOrder from "./sections/ManualOrder";
import OrderDrawer from "./sections/OrderDrawer";

const PAYMENT = [{ value: "unpaid", label: "Unpaid" }, { value: "paid", label: "Paid" }, { value: "partially_refunded", label: "Part refunded" }, { value: "refunded", label: "Refunded" }];

/** Every order, guest or signed in, newest first. Open one to move it on. */
export default function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: settings } = useDocument(settingsResource);
  const methods = useCollection(paymentMethodsResource);
  const products = useCollection(productsResource);
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const open = orders.find((o) => o.id === openId) ?? null;
  const zones = settings?.zones ?? [];

  const columns = [
    { key: "ref", label: "Order", sort: (o) => o.ref, render: (o) => <strong className="font-display">{o.ref}</strong> },
    { key: "createdAt", label: "Date", sort: (o) => o.createdAt, render: (o) => formatDate(o.createdAt) },
    { key: "name", label: "Customer", sort: (o) => o.name, render: (o) => <span>{o.name}<span className="block text-xs text-ink-3">{o.phone}</span></span> },
    { key: "items", label: "Items", render: (o) => o.lines.reduce((n, l) => n + l.qty, 0) },
    { key: "status", label: "Status", render: (o) => <StatusChip status={o.status} /> },
    { key: "paymentStatus", label: "Payment", render: (o) => <StatusChip status={o.paymentStatus} /> },
    { key: "total", label: "Total", align: "right", sort: (o) => o.total, render: (o) => moneyBase(o.total) },
  ];

  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      <PageHeader
        title="Orders"
        lede={`${orders.length} orders · ${pending} waiting for payment.`}
        action={can("orders", "edit") && <Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden="true" /> New order</Button>}
      />
      <AdminNavTabs tabs={ORDERS_TABS} />
      <Panel>
        <DataTable
          rows={orders}
          loading={isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(o) => `${o.ref} ${o.name} ${o.phone} ${o.email ?? ""}`}
          searchLabel="Search reference, name or phone"
          filters={[
            { id: "status", label: "Status", options: ORDER_STATUSES.map((s) => ({ value: s.id, label: s.label })), test: (o, v) => o.status === v },
            { id: "payment", label: "Payment", options: PAYMENT, test: (o, v) => o.paymentStatus === v },
            { id: "zone", label: "Delivery", options: zones.map((z) => ({ value: z.id, label: z.name })), test: (o, v) => o.region === v },
            { id: "source", label: "Source", options: [{ value: "web", label: "The shop" }, { value: "manual", label: "Entered by staff" }], test: (o, v) => (o.source ?? "web") === v },
          ]}
          onRowClick={(o) => setOpenId(o.id)}
          exportName="orders"
          exportRow={(o) => ({ ref: o.ref, date: o.createdAt.slice(0, 10), customer: o.name, phone: o.phone, status: o.status, payment: o.paymentStatus, method: o.payment, subtotal: o.subtotal, discount: o.discount, delivery: o.delivery, total: o.total })}
          empty="No orders yet."
        />
      </Panel>
      {open && <OrderDrawer key={open.id} order={open} settings={settings} methods={methods.items} onClose={() => setOpenId(null)} />}
      <ManualOrder
        open={creating}
        onClose={() => setCreating(false)}
        products={products.items}
        settings={settings}
        methods={methods.items}
        onCreated={(o) => { setCreating(false); setOpenId(o.id); }}
      />
    </>
  );
}
