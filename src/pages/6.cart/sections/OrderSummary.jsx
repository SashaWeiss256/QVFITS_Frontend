/* Order Summary */
import { useCurrency } from "@/store/context/CurrencyContext";

const AREA = { kampala: "Kampala", upcountry: "upcountry", pickup: "collection" };

// The running total beside every step, with the bar to free delivery.
export default function OrderSummary({ bag, region = "kampala", children }) {
  const { money } = useCurrency();
  const threshold = bag.settings?.freeShippingOver ?? 0;
  const left = threshold - bag.subtotal;
  const pct = threshold ? Math.min(100, (bag.subtotal / threshold) * 100) : 0;

  return (
    <div>
      <div className="summary">
        <h2 className="sub-h">Order summary</h2>
        {region !== "pickup" && (
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
          <span>Delivery ({AREA[region]})</span>
          <span>{bag.delivery === 0 ? "Free" : money(bag.delivery)}</span>
        </div>
        <div className="sum-row sum-row--total"><span>Total</span><span>{money(bag.total)}</span></div>
      </div>
      {children}
    </div>
  );
}
