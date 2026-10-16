/* Admin Returns And Exchanges */
import { useState } from "react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { NEXT_RETURN_STATUS, useReturns, useUpdateReturnStatus } from "@/store/tanstackStore/queries/admin";
import { formatDate, formatDateTime } from "@/utils/format";
import { statusLabel } from "@/utils/orderStatus";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";
import AdminNavTabs from "@/AdminDashboard/components/AdminNavTabs";
import { ORDERS_TABS } from "@/AdminDashboard/lib/constants";

const STATUSES = ["requested", "approved", "received", "refunded", "exchanged", "rejected"].map((s) => ({ value: s, label: statusLabel(s) }));
const ACTION = { approved: "Approve", rejected: "Reject", received: "Pieces received", refunded: "Refund", exchanged: "Exchange sent" };

/**
 * Requests from customers' order pages. Approve, then mark the pieces
 * received (they go back in stock), then refund (recorded as a transaction)
 * or send the exchange.
 */
export default function AdminReturns() {
  const { data: returns = [], isLoading } = useReturns();
  const update = useUpdateReturnStatus();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [openId, setOpenId] = useState(null);
  const [note, setNote] = useState("");
  const open = returns.find((r) => r.id === openId);
  const value = (r) => r.lines.reduce((n, l) => n + l.price * l.qty, 0);

  const columns = [
    { key: "orderRef", label: "Order", render: (r) => <strong className="font-display">{r.orderRef}</strong> },
    { key: "name", label: "Customer" },
    { key: "resolution", label: "Wants", render: (r) => (r.resolution === "refund" ? "Refund" : "Exchange") },
    { key: "reason", label: "Why" },
    { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
    { key: "value", label: "Value", align: "right", sort: value, render: (r) => moneyBase(value(r)) },
    { key: "createdAt", label: "Asked", sort: (r) => r.createdAt, render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Returns and exchanges" lede={`${returns.filter((r) => r.status === "requested").length} waiting for a decision.`} />
      <AdminNavTabs tabs={ORDERS_TABS} />
      <Panel>
        <DataTable
          rows={returns}
          loading={isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(r) => `${r.orderRef} ${r.name}`}
          filters={[{ id: "status", label: "Status", options: STATUSES, test: (r, v) => r.status === v }]}
          onRowClick={(r) => { setOpenId(r.id); setNote(""); }}
          empty="No return requests. They arrive from customers' order pages."
        />
      </Panel>
      {open && (
        <Drawer open onClose={() => setOpenId(null)} title={`Return on ${open.orderRef}`} subtitle={`${open.name} · asked ${formatDateTime(open.createdAt)}`}>
          <div className="mb-5 flex gap-2"><StatusChip status={open.status} /></div>
          <p className="text-sm"><strong>Wants:</strong> {open.resolution === "refund" ? "a refund" : "an exchange"}<br /><strong>Why:</strong> {open.reason}</p>
          <ul className="m-0 my-4 list-none p-0">
            {open.lines.map((l) => (
              <li key={`${l.productId}-${l.color}-${l.size}`} className="flex justify-between border-b border-line py-2 text-sm">
                <span>{l.name} · {l.color} · {l.size} ×{l.qty}</span><span>{moneyBase(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          {open.note && <p className="text-sm text-ink-3">Note: {open.note}</p>}
          {can("returns", "edit") && NEXT_RETURN_STATUS[open.status].length > 0 && (
            <div className="mt-4 grid gap-3 rounded-r-md bg-white p-4 shadow-sh-1">
              <Field label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} hint="A refund's mobile money reference, or why it was rejected." />
              <div className="flex flex-wrap gap-2">
                {NEXT_RETURN_STATUS[open.status].map((s) => (
                  <Button key={s} variant={s === "rejected" ? "danger" : "primary"} loading={update.isPending && update.variables?.status === s} onClick={() => update.mutate({ id: open.id, status: s, note: note || undefined })}>
                    {ACTION[s]}{s === "refunded" ? ` ${moneyBase(value(open))}` : ""}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Drawer>
      )}
    </>
  );
}
