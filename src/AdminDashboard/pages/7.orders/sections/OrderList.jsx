/* Order List */
import { useState } from "react";
import { Store } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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
import RecordSale from "./RecordSale";
import OrderDrawer from "./OrderDrawer";

// Payment states shoppers and staff both use, for the filter.
const PAYMENT = [{ value: "unpaid", label: "Unpaid" }, { value: "part_paid", label: "Part paid" }, { value: "paid", label: "Paid" }, { value: "partially_refunded", label: "Part refunded" }, { value: "refunded", label: "Refunded" }];
// Where an order came from. Older orders have no source and count as the shop.
const SOURCE = [{ value: "web", label: "The shop" }, { value: "showroom", label: "Showroom" }, { value: "whatsapp", label: "WhatsApp" }, { value: "manual", label: "Entered by staff (older)" }];

/**
 * Every order, newest first: from the shop's checkout, and sales recorded
 * in the showroom or on WhatsApp. Open one to move it on; ?order=<id> opens
 * it from a link (Transactions, a return).
 */
export default function OrderList() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: settings } = useDocument(settingsResource);
  const methods = useCollection(paymentMethodsResource);
  const products = useCollection(productsResource);
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [params, setParams] = useSearchParams();
  // Which order is open lives in the address (?order=), so a link from Transactions or a return can open it.
  const openId = params.get("order");
  // Opening or closing replaces the address, so Back leaves the page instead of stepping through every order opened.
  const setOpenId = (id) => setParams((prev) => { const next = new URLSearchParams(prev); if (id) next.set("order", id); else next.delete("order"); return next; }, { replace: true });
  const [creating, setCreating] = useState(false);
  const open = orders.find((o) => o.id === openId) ?? null;
  // The delivery zones, for the Delivery filter.
  const zones = settings?.zones ?? [];

  // The table's columns: the order, when, who, how many pieces, its state, its payment and the total.
  const columns = [
    { key: "ref", label: "Order", sort: (o) => o.ref, render: (o) => <strong className="font-display">{o.ref}</strong> },
    { key: "createdAt", label: "Date", sort: (o) => o.createdAt, render: (o) => formatDate(o.createdAt) },
    { key: "name", label: "Customer", sort: (o) => o.name, render: (o) => <span>{o.name}<span className="block text-xs text-ink-3">{o.phone}{o.source && o.source !== "web" ? ` · ${SOURCE.find((x) => x.value === o.source)?.label}` : ""}</span></span> },
    { key: "items", label: "Items", render: (o) => o.lines.reduce((n, l) => n + l.qty, 0) },
    { key: "status", label: "Status", render: (o) => <StatusChip status={o.status} /> },
    { key: "paymentStatus", label: "Payment", render: (o) => <StatusChip status={o.paymentStatus} /> },
    { key: "total", label: "Total", align: "right", sort: (o) => o.total, render: (o) => moneyBase(o.total) },
  ];

  // Waiting for payment: the same number the sidebar badge shows.
  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <>
      {/* Page Header: Record a sale needs permission to take payments */}
      <PageHeader
        lede={`${orders.length} orders · ${pending} waiting for payment.`}
        action={can("orders", "payment") && <Button variant="ghost" onClick={() => setCreating(true)}><Store className="h-4 w-4" aria-hidden="true" /> Record a sale</Button>}
      />
      {/* Order Table: filters in a drawer, a row opens its order */}
      <Panel>
        <DataTable
          filterDrawer
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
            { id: "source", label: "From", options: SOURCE, test: (o, v) => (o.source ?? "web") === v },
          ]}
          onRowClick={(o) => setOpenId(o.id)}
          exportName="orders"
          exportRow={(o) => ({ ref: o.ref, date: o.createdAt.slice(0, 10), customer: o.name, phone: o.phone, status: o.status, payment: o.paymentStatus, method: o.payment, subtotal: o.subtotal, discount: o.discount, delivery: o.delivery, total: o.total })}
          empty="No orders yet."
        />
      </Panel>
      {/* Order Drawer: opened by a row or by a link */}
      {open && <OrderDrawer key={open.id} order={open} settings={settings} methods={methods.items} onClose={() => setOpenId(null)} />}
      {/* Record A Sale: showroom and WhatsApp sales, paid on the spot */}
      <RecordSale
        open={creating}
        onClose={() => setCreating(false)}
        products={products.items}
        settings={settings}
        onCreated={(o) => { setCreating(false); setOpenId(o.id); }}
      />
    </>
  );
}
