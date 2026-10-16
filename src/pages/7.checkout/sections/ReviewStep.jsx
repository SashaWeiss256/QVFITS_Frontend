/* Review Order (step 3) */
import { PAYMENTS } from "./checkoutSchema";

// One last look before placing the order. Honest seam: online payment is not
// switched on yet, so the order is recorded and the team confirms payment.
export default function ReviewOrder({ bag, details, money, address, onPlace, onBack, placing, error }) {
  const payLabel = PAYMENTS.find((p) => p.id === details.payment)?.label;

  return (
    <div className="info-card">
      <h2 className="sub-h mb-1.5">One last look</h2>
      <p className="text-[.9rem] text-ink-3">
        Placing the order reserves your reference. Online payment switches on soon; until then our team confirms stock, total and payment with you directly.
      </p>
      <div className="mt-[18px] border-t border-line pt-3.5">
        {bag.rows.map(({ line, product, total }) => (
          <div key={`${line.productId}-${line.size}-${line.color}`} className="sum-row">
            <span>{product.name} · {line.color} · {line.size} ×{line.qty}</span>
            <span>{money(total)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-line pt-3.5">
        <div className="sum-row"><span>Name</span><span>{details.name}</span></div>
        <div className="sum-row"><span>Phone</span><span>{details.phone}</span></div>
        <div className="sum-row">
          <span>{details.region === "pickup" ? "Collection" : "Delivery"}</span>
          <span className="max-w-[60%] text-right">{details.region === "pickup" ? `From the showroom, ${address}` : details.address}</span>
        </div>
        <div className="sum-row"><span>Payment</span><span className="text-right">{payLabel}</span></div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-warn">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <button type="button" className="btn btn--primary" onClick={onPlace} disabled={placing}>{placing ? "Placing order…" : "Place order"}</button>
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={placing}>Back to delivery</button>
      </div>
    </div>
  );
}
