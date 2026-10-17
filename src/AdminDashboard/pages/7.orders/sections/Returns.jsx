/* Returns And Refunds */
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import StatusChip from "@/components/ui/StatusChip";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { NEXT_RETURN_STATUS, refundDue, useOrders, useReturns, useUpdateReturnStatus } from "@/store/tanstackStore/queries/admin";
import { formatDate, formatDateTime } from "@/utils/format";
import { statusLabel } from "@/utils/orderStatus";
import DataTable from "@/AdminDashboard/components/DataTable";
import Drawer from "@/AdminDashboard/components/Drawer";
import PageHeader from "@/AdminDashboard/components/PageHeader";
import Panel from "@/AdminDashboard/components/Panel";

// Every state a return can be in, for the filter.
const STATUSES = ["requested", "approved", "received", "refunded", "exchanged", "rejected"].map((s) => ({ value: s, label: statusLabel(s) }));
// What each button says for the state it moves a return to.
const ACTION = { approved: "Approve", rejected: "Reject", received: "Pieces received", refunded: "Refund", exchanged: "Exchange sent" };

/**
 * Requests from customers' order pages and Track an order, and returns
 * staff open at the counter. Approve, mark the pieces received (they go back
 * in stock), then refund or send the exchange. A refund gives back what was
 * actually paid for those pieces, less their share of any code or kit
 * saving, and is recorded against the order.
 */
export default function Returns() {
  const { data: returns = [], isLoading } = useReturns();
  const { data: orders = [] } = useOrders();
  // The refund amount staff typed; empty means the full amount due.
  const [amount, setAmount] = useState("");
  const update = useUpdateReturnStatus();
  const { can } = useAdminAuth();
  const { moneyBase } = useCurrency();
  const [openId, setOpenId] = useState(null);
  const [note, setNote] = useState("");
  const open = returns.find((r) => r.id === openId);
  const openOrder = open && orders.find((o) => o.id === open.orderId);
  // What the customer is owed, worked out by the same rule the service uses when it records the refund.
  const due = open && openOrder ? refundDue(open, openOrder) : 0;
  // The amount about to be refunded; anything below what is due needs a reason.
  const giving = amount === "" ? due : Number(amount);
  const short = giving < due;
  // The value of the returned lines at the prices paid.
  const value = (r) => r.lines.reduce((n, l) => n + l.price * l.qty, 0);

  // The table's columns.
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
      {/* Page Header: how many are waiting for a decision */}
      <PageHeader lede={`${returns.filter((r) => r.status === "requested").length} waiting for a decision.`} />
      {/* Returns Table: a row opens its drawer */}
      <Panel>
        <DataTable
          rows={returns}
          loading={isLoading}
          columns={columns}
          initialSort={{ key: "createdAt", dir: "desc" }}
          search={(r) => `${r.orderRef} ${r.name}`}
          filters={[{ id: "status", label: "Status", options: STATUSES, test: (r, v) => r.status === v }]}
          onRowClick={(r) => { setOpenId(r.id); setNote(""); setAmount(""); }}
          empty="No return requests. They arrive from customers' order pages and Track an order, or open one from an order."
        />
      </Panel>
      {/* Return Drawer: what was asked, the pieces, and the next steps allowed from this state */}
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
          <Link className="link-arrow text-sm" to={`/admin/orders?order=${open.orderId}`}>Open order {open.orderRef}</Link>
          {/* Decision: only the next steps allowed from this state are offered; Refund needs the refund permission and never more than is due */}
          {can("orders", "edit") && NEXT_RETURN_STATUS[open.status].length > 0 && (
            <div className="mt-4 grid gap-3 rounded-r-md bg-white p-4 shadow-sh-1">
              {NEXT_RETURN_STATUS[open.status].includes("refunded") && (
                <div className="grid gap-1">
                  <Field
                    label="Refund (UGX)"
                    inputMode="numeric"
                    value={amount}
                    placeholder={String(due)}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    hint={`Due: ${moneyBase(due)}, the pieces' price less their share of any code or kit saving. Enter less only with a reason below.`}
                    error={giving > due ? `No more than ${moneyBase(due)}` : undefined}
                  />
                </div>
              )}
              <Field label={short ? "Why less than the full amount" : "Note (optional)"} value={note} onChange={(e) => setNote(e.target.value)} hint="A refund's mobile money reference, or why it was rejected." />
              <div className="flex flex-wrap gap-2">
                {NEXT_RETURN_STATUS[open.status]
                  .filter((s) => s !== "refunded" || can("orders", "refund"))
                  .map((s) => (
                    <Button
                      key={s}
                      variant={s === "rejected" ? "danger" : "primary"}
                      loading={update.isPending && update.variables?.status === s}
                      disabled={s === "refunded" && (giving > due || (short && !note.trim()))}
                      onClick={() => update.mutate({ id: open.id, status: s, note: note || undefined, amount: s === "refunded" ? giving : undefined })}
                    >
                      {ACTION[s]}{s === "refunded" ? ` ${moneyBase(giving)}` : ""}
                    </Button>
                  ))}
              </div>
              {NEXT_RETURN_STATUS[open.status].includes("refunded") && !can("orders", "refund") && <p className="m-0 text-xs text-ink-3">Refunds need the Refund permission (Team and roles).</p>}
            </div>
          )}
        </Drawer>
      )}
    </>
  );
}
