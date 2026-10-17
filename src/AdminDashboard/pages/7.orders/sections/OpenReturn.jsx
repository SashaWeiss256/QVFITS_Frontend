/* Open A Return */
import { useState } from "react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { useOpenReturn } from "@/store/tanstackStore/queries/admin";

const REASONS = ["Wrong size", "Not as expected", "Faulty or damaged", "Changed my mind", "Something else"];

/**
 * Staff open a return for a customer at the counter or on the phone: which
 * pieces, why, and refund or exchange. It starts approved, since staff
 * have already agreed it, and carries on in Returns and refunds.
 */
export default function OpenReturn({ order, onDone }) {
  const open = useOpenReturn();
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState(REASONS[0]);
  const [resolution, setResolution] = useState("refund");
  const keyOf = (l) => `${l.productId}|${l.color}|${l.size}`;
  const lines = order.lines
    .filter((l) => (qty[keyOf(l)] ?? 0) > 0)
    .map((l) => ({ productId: l.productId, name: l.name, size: l.size, color: l.color, qty: qty[keyOf(l)], price: l.price }));

  const submit = () =>
    open.mutateAsync({ orderId: order.id, lines, reason, resolution }).then(onDone).catch(() => {});

  return (
    <div className="mt-3 grid gap-4 rounded-r-md bg-white p-4 shadow-sh-1">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 text-sm font-semibold">Pieces coming back</legend>
        <ul className="m-0 grid list-none gap-2 p-0">
          {order.lines.map((l) => (
            <li key={keyOf(l)} className="flex items-center justify-between gap-3 text-sm">
              <span>{l.name} <span className="text-ink-3">· {l.color} · {l.size}</span></span>
              <select className="input min-h-9 w-20 py-1" aria-label={`How many ${l.name}`} value={qty[keyOf(l)] ?? 0} onChange={(e) => setQty({ ...qty, [keyOf(l)]: Number(e.target.value) })}>
                {Array.from({ length: l.qty + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Why" options={REASONS.map((r) => ({ value: r, label: r }))} value={reason} onChange={(e) => setReason(e.target.value)} />
        <Field label="They want" options={[{ value: "refund", label: "A refund" }, { value: "exchange", label: "An exchange" }]} value={resolution} onChange={(e) => setResolution(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} loading={open.isPending} disabled={!lines.length}>Open return</Button>
      </div>
    </div>
  );
}
