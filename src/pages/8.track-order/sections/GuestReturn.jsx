/* Guest Return */
import { useState } from "react";

import { useGuestReturn } from "@/store/tanstackStore/queries/site";

const REASONS = ["Wrong size", "Not as expected", "Faulty or damaged", "Changed my mind", "Something else"];

/**
 * A return or exchange for a guest order (gap O2): the reference and phone
 * already matched, so they pick the pieces and why. It lands in the shop's
 * Returns and refunds queue like any other request.
 */
export default function GuestReturn({ order, refCode, phone }) {
  const send = useGuestReturn();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState(REASONS[0]);
  const [resolution, setResolution] = useState("exchange");
  const keyOf = (l) => `${l.productId}|${l.color}|${l.size}`;
  const lines = order.lines.filter((l) => (qty[keyOf(l)] ?? 0) > 0).map((l) => ({ productId: l.productId, name: l.name, size: l.size, color: l.color, qty: qty[keyOf(l)], price: l.price }));

  if (send.isSuccess) return <p role="status" className="mt-5 text-sm text-ink-2">Request sent. We'll be in touch on {phone} about how to send the pieces back.</p>;

  return (
    <div className="mt-5 border-t border-line pt-4">
      {!open ? (
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(true)}>Return or exchange</button>
      ) : (
        <div className="grid gap-3">
          <p className="m-0 font-semibold">Which pieces are coming back?</p>
          {order.lines.map((l) => (
            <label key={keyOf(l)} className="flex items-center justify-between gap-3 text-sm">
              <span>{l.name} · {l.color} · {l.size}</span>
              <select className="select min-h-10 w-20 py-1" value={qty[keyOf(l)] ?? 0} onChange={(e) => setQty({ ...qty, [keyOf(l)]: Number(e.target.value) })} aria-label={`How many ${l.name}`}>
                {Array.from({ length: l.qty + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          ))}
          <div className="field">
            <label htmlFor="gr-reason">Why</label>
            <select id="gr-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="gr-want">You'd like</label>
            <select id="gr-want" className="select" value={resolution} onChange={(e) => setResolution(e.target.value)}>
              <option value="exchange">An exchange</option>
              <option value="refund">A refund</option>
            </select>
          </div>
          {send.error && <p role="alert" className="m-0 text-sm font-semibold text-warn">{send.error.message}</p>}
          <button type="button" className="btn btn--primary justify-self-start" disabled={!lines.length || send.isPending} onClick={() => send.mutate({ ref: refCode, phone, input: { lines, reason, resolution } })}>Send request</button>
        </div>
      )}
    </div>
  );
}
