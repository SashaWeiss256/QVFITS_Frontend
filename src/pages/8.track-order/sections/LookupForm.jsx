/* Lookup Form */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import PaymentDue from "@/components/storefront/PaymentDue";
import StatusChip from "@/components/ui/StatusChip";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useCancelGuestOrder, useTrackOrder } from "@/store/tanstackStore/queries/site";
import GuestReturn from "./GuestReturn";
import { formatDate } from "@/utils/format";

// A guest finds an order by its reference and the phone it was placed with;
// both must match, so a reference alone reveals nothing.
export default function LookupForm() {
  const [params] = useSearchParams();
  // An order email links here with ?ref=, so only the phone is left to type.
  const [ref, setRef] = useState(() => params.get("ref") ?? "");
  const [phone, setPhone] = useState("");
  const track = useTrackOrder();
  const cancel = useCancelGuestOrder();
  const { moneyBase } = useCurrency();
  // A cancel returns the updated order; show that over the first lookup.
  const order = cancel.data ?? track.data;

  return (
    <div className="grid max-w-2xl gap-6">
      <form
        className="info-card"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          // Both fields are needed for a match, so don't send a half-filled lookup.
          if (ref.trim() && phone.trim()) track.mutate({ ref, phone });
        }}
      >
        <div className="field">
          <label htmlFor="tRef">Order reference</label>
          <input id="tRef" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="QV-XXXXXX" autoCapitalize="characters" />
        </div>
        <div className="field">
          <label htmlFor="tPhone">Phone number used for the order</label>
          <input id="tPhone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" />
        </div>
        {track.error && <p role="alert" className="mt-3 text-sm font-semibold text-warn">{track.error.message}</p>}
        <button type="submit" className="btn btn--primary mt-5" disabled={track.isPending}>{track.isPending ? "Looking…" : "Find my order"}</button>
      </form>

      {/* Result: amounts in UGX, as the order was quoted. */}
      {order && (
        <div className="info-card" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="sub-h m-0">Order {order.ref}</h2>
            <StatusChip status={order.status} />
          </div>
          <p className="text-sm text-ink-3">Placed {formatDate(order.createdAt)}</p>
          {order.lines.map((l) => (
            <div key={`${l.productId}-${l.size}-${l.color}`} className="sum-row"><span>{l.name} · {l.color} · {l.size} ×{l.qty}</span><span>{moneyBase(l.price * l.qty)}</span></div>
          ))}
          <div className="sum-row sum-row--total"><span>Total</span><span>{moneyBase(order.total)}</span></div>
          <PaymentDue order={order} onCancel={() => cancel.mutate({ ref, phone })} cancelling={cancel.isPending} />
          {cancel.error && <p role="alert" className="m-0 mt-2 text-sm font-semibold text-warn">{cancel.error.message}</p>}
          {["delivered", "exchanged"].includes(order.status) && <GuestReturn order={order} refCode={ref} phone={phone} />}
        </div>
      )}
    </div>
  );
}
