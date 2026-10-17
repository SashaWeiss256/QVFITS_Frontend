/* Return Or Exchange Request */
import { useState } from "react";

import StatusChip from "@/components/ui/StatusChip";
import { returnWindow, useMyReturns, useRequestReturn } from "@/store/tanstackStore/queries/account";

// The reasons offered; the shop reads them in the Returns queue.
const REASONS = ["Wrong size", "Not as expected", "Faulty or damaged", "Changed my mind", "Something else"];

/**
 * Under a delivered order: pick the pieces, say why, refund or exchange.
 * The request lands in the admin's Returns queue; once it exists, its
 * status shows here instead of the form.
 */
export default function ReturnRequest({ order, customerId }) {
  const { data: returns = [] } = useMyReturns(customerId);
  const request = useRequestReturn(customerId);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState([]);
  const [reason, setReason] = useState(REASONS[0]);
  const [resolution, setResolution] = useState("exchange");

  // One open request per order: while it exists its status shows instead of the form (a rejected one lets the shopper try again).
  const existing = returns.find((r) => r.orderId === order.id && r.status !== "rejected");
  if (existing) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-r-md bg-brand-50 px-4 py-3">
        <span className="text-sm">Your {existing.resolution} request</span>
        <StatusChip status={existing.status} />
      </div>
    );
  }

  // Returns are only taken for a set number of days after delivery (Settings, Exchange window); after that the reason is shown instead.
  const window = returnWindow(order);
  if (!window.open) return order.status === "delivered" ? <p className="mt-6 text-sm text-ink-3">{window.reason}</p> : null;

  // A line is identified by piece, size and colour, since the same piece can be in the order twice.
  const key = (l) => `${l.productId}|${l.size}|${l.color}`;
  const toggle = (l) => setPicked((p) => (p.includes(key(l)) ? p.filter((k) => k !== key(l)) : [...p, key(l)]));

  // Only the ticked lines are sent, trimmed to what the Returns queue needs; a refusal shows under the form.
  const submit = async (e) => {
    e.preventDefault();
    const lines = order.lines
      .filter((l) => picked.includes(key(l)))
      .map(({ productId, name, size, color, qty, price }) => ({ productId, name, size, color, qty, price }));
    await request.mutateAsync({ orderId: order.id, lines, reason, resolution }).catch(() => null);
  };

  if (!open) {
    return (
      <button type="button" className="btn btn--soft mt-6" onClick={() => setOpen(true)}>
        Return or exchange
      </button>
    );
  }

  {/* Return Form */}
  return (
    <form className="mt-6 border-t border-line pt-5" onSubmit={submit} noValidate>
      <h3 className="text-[1.05rem]">Return or exchange</h3>
      {/* Which pieces */}
      <fieldset className="mt-3 border-0 p-0">
        <legend className="mb-2 text-sm text-ink-3">Which pieces?</legend>
        {order.lines.map((l) => (
          <label key={key(l)} className="check-row">
            <input type="checkbox" checked={picked.includes(key(l))} onChange={() => toggle(l)} />
            {l.name} · {l.color} · {l.size}
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label htmlFor="retReason">Why?</label>
        <select id="retReason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      {/* Exchange or refund */}
      <fieldset className="field m-0 border-0 p-0">
        <legend className="mb-1.5 text-[.8rem] font-medium text-ink-3">What would you like?</legend>
        <label className="check-row"><input type="radio" checked={resolution === "exchange"} onChange={() => setResolution("exchange")} /> An exchange</label>
        <label className="check-row"><input type="radio" checked={resolution === "refund"} onChange={() => setResolution("refund")} /> A refund</label>
      </fieldset>
      {request.error && <p role="alert" className="mt-3 text-sm font-semibold text-warn">{request.error.message}</p>}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="submit" className="btn btn--primary" disabled={!picked.length || request.isPending}>Send request</button>
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
