/* Review Order (step 3) */
import InfoCard from "@/components/storefront/InfoCard";
import SubHeading from "@/components/storefront/SubHeading";
import SummaryRow from "@/components/storefront/SummaryRow";
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
    <InfoCard>
      <SubHeading className="mb-1.5">{t("One last look")}</SubHeading>
      <p className="text-[.9rem] text-ink-3">
        Placing the order reserves your reference. Online payment switches on soon; until then our team confirms stock, total and payment with you directly.
      </p>
      {/* Lines */}
      <div className="mt-[18px] border-t border-line pt-3.5">
        {bag.rows.map(({ line, product, total }) => (
          <SummaryRow key={`${line.productId}-${line.size}-${line.color}`}>
            <span>{product.name} · {line.color} · {line.size} ×{line.qty}</span>
            <span>{money(total)}</span>
          </SummaryRow>
        ))}
      </div>
      {/* Delivery and Payment */}
      <div className="mt-4 border-t border-line pt-3.5">
        <SummaryRow><span>Name</span><span>{details.name}</span></SummaryRow>
        <SummaryRow><span>Phone</span><span>{details.phone}</span></SummaryRow>
        <SummaryRow>
          <span>{collect ? "Collection" : "Delivery"}</span>
          <span className="max-w-[60%] text-right">{collect ? `From the showroom, ${address}` : details.address}</span>
        </SummaryRow>
        {eta && <SummaryRow><span>{collect ? "Ready" : "Arrives in"}</span><span>{eta.replace(/^Ready /, "")}</span></SummaryRow>}
        <SummaryRow><span>Payment</span><span className="text-right">{payLabel}</span></SummaryRow>
        {details.news && details.email && <SummaryRow><span>Newsletter</span><span>We&apos;ll email {details.email} to confirm</span></SummaryRow>}
      </div>
      {/* Prices may show in another currency; the charge is always UGX (gap F4). */}
      {currency?.code !== "UGX" && (
        <SummaryRow total className="mt-3">
          <span>{t("You pay")}</span>
          <span>{moneyBase(bag.total)}<span className="block text-right text-xs font-normal text-ink-3">about {money(bag.total)}</span></span>
        </SummaryRow>
      )}
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-warn">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {/* Both buttons lock while placing so the order can't be sent twice. */}
        <button type="button" className="btn btn--primary" onClick={onPlace} disabled={placing}>{placing ? "Placing order…" : "Place order"}</button>
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={placing}>{t("Back to delivery")}</button>
      </div>
    </InfoCard>
  );
}
