/* Review Order (step 3) */
import { useCurrency } from "@/store/context/CurrencyContext";
import { usePaymentMethods } from "@/store/tanstackStore/queries/site";
import { zoneEta } from "@/utils/delivery";
import { t } from "@/i18n/translate";

// One last look before placing the order. Honest seam: online payment is not
// switched on yet, so the order is recorded and the team confirms payment.
export default function ReviewStep({ bag, details, money, address, onPlace, onBack, placing, error }) {
  const { data: methods = [] } = usePaymentMethods();
  const payLabel = methods.find((p) => p.id === details.payment)?.label;
  const collect = bag.zone?.collect;
  const eta = zoneEta(bag.zone);
  const { currency, moneyBase } = useCurrency();

  return (
    <div className="info-card">
      <h2 className="sub-h mb-1.5">{t("One last look")}</h2>
      <p className="text-[.9rem] text-ink-3">
        Placing the order reserves your reference. Online payment switches on soon; until then our team confirms stock, total and payment with you directly.
      </p>
      {/* Lines */}
      <div className="mt-[18px] border-t border-line pt-3.5">
        {bag.rows.map(({ line, product, total }) => (
          <div key={`${line.productId}-${line.size}-${line.color}`} className="sum-row">
            <span>{product.name} · {line.color} · {line.size} ×{line.qty}</span>
            <span>{money(total)}</span>
          </div>
        ))}
      </div>
      {/* Delivery and Payment */}
      <div className="mt-4 border-t border-line pt-3.5">
        <div className="sum-row"><span>Name</span><span>{details.name}</span></div>
        <div className="sum-row"><span>Phone</span><span>{details.phone}</span></div>
        <div className="sum-row">
          <span>{collect ? "Collection" : "Delivery"}</span>
          <span className="max-w-[60%] text-right">{collect ? `From the showroom, ${address}` : details.address}</span>
        </div>
        {eta && <div className="sum-row"><span>{collect ? "Ready" : "Arrives in"}</span><span>{eta.replace(/^Ready /, "")}</span></div>}
        <div className="sum-row"><span>Payment</span><span className="text-right">{payLabel}</span></div>
        {details.news && details.email && <div className="sum-row"><span>Newsletter</span><span>We&apos;ll email {details.email} to confirm</span></div>}
      </div>
      {/* Prices may show in another currency; the charge is always UGX (gap F4). */}
      {currency?.code !== "UGX" && (
        <div className="sum-row sum-row--total mt-3">
          <span>{t("You pay")}</span>
          <span>{moneyBase(bag.total)}<span className="block text-right text-xs font-normal text-ink-3">about {money(bag.total)}</span></span>
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-warn">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {/* Both buttons lock while placing so the order can't be sent twice. */}
        <button type="button" className="btn btn--primary" onClick={onPlace} disabled={placing}>{placing ? "Placing order…" : "Place order"}</button>
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={placing}>{t("Back to delivery")}</button>
      </div>
    </div>
  );
}
