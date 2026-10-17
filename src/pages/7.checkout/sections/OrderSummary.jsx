/* Order Summary */
import { useCurrency } from "@/store/context/CurrencyContext";
import { zoneOf } from "@/utils/delivery";

// The running total beside every step, with the bar to free delivery.
export default function OrderSummary({ bag, region = "kampala", children }) {
  const { money, currency } = useCurrency();
  const zone = zoneOf(bag.settings, region);
  const threshold = zone?.freeOver ?? bag.settings?.freeShippingOver ?? 0;
  const left = threshold - bag.subtotal;
  // Guard against a zero threshold before settings load.
  const pct = threshold ? Math.min(100, (bag.subtotal / threshold) * 100) : 0;

  return (
    <div>
      <div className="summary">
        <h2 className="sub-h">Order summary</h2>
        {/* Free delivery means nothing for a collection, so hide the bar. */}
        {!zone?.collect && (
          <>
            <div className="ship-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
              <div className="ship-bar__fill" style={{ width: `${pct}%` }} />
            </div>
            <p className={left > 0 ? "text-[.82rem] text-ink-3" : "text-[.82rem] font-semibold text-success"}>
              {left > 0 ? `${money(left)} away from free delivery` : "Free delivery unlocked"}
            </p>
          </>
        )}
        <div className="sum-row"><span>Subtotal</span><span>{money(bag.subtotal)}</span></div>
        <div className="sum-row">
          <span>Delivery{zone ? ` (${zone.name})` : ""}</span>
          <span>{bag.delivery === 0 ? "Free" : money(bag.delivery)}</span>
        </div>
        {bag.kitSaving > 0 && (
          <div className="sum-row text-success"><span>Kit saving</span><span>-{money(bag.kitSaving)}</span></div>
        )}
        {bag.discount > 0 && (
          <div className="sum-row text-success"><span>Discount{bag.discountCode ? ` (${bag.discountCode})` : ""}</span><span>-{money(bag.discount)}</span></div>
        )}
        <div className="sum-row sum-row--total"><span>Total</span><span>{money(bag.total)}</span></div>
        {currency?.code !== "UGX" && <p className="m-0 mt-1 text-[.78rem] text-ink-3">Shown in {currency?.code} as a guide. You pay in Ugandan shillings (UGX).</p>}
      </div>
      {/* Each step passes its own call to action. */}
      {children}
    </div>
  );
}
