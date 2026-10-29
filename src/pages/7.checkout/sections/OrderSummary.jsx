/* Order Summary */
import SubHeading from "@/components/storefront/SubHeading";
import SummaryRow from "@/components/storefront/SummaryRow";
import { useCurrency } from "@/store/context/CurrencyContext";
import { zoneOf } from "@/utils/delivery";
import { t } from "@/i18n/translate";

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
      <div className="bg-sand-100 p-[clamp(22px,3vw,34px)]">
        <SubHeading>{t("Order summary")}</SubHeading>
        {/* Free delivery means nothing for a collection, so hide the bar. */}
        {!zone?.collect && (
          <>
            <div className="mb-2.5 mt-1 h-[3px] overflow-hidden bg-line-2" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={t("Progress to free delivery")}>
              <div className="h-full bg-[image:var(--brand-grad)] transition-[width] duration-[600ms] ease-q" style={{ width: `${pct}%` }} />
            </div>
            <p className={left > 0 ? "text-[.82rem] text-ink-3" : "text-[.82rem] font-semibold text-success"}>
              {left > 0 ? `${money(left)} away from free delivery` : "Free delivery unlocked"}
            </p>
          </>
        )}
        <SummaryRow><span>{t("Subtotal")}</span><span>{money(bag.subtotal)}</span></SummaryRow>
        <SummaryRow>
          <span>Delivery{zone ? ` (${zone.name})` : ""}</span>
          <span>{bag.delivery === 0 ? "Free" : money(bag.delivery)}</span>
        </SummaryRow>
        {bag.kitSaving > 0 && (
          <SummaryRow className="text-success"><span>{t("Kit saving")}</span><span>{money(bag.kitSaving)} off</span></SummaryRow>
        )}
        {bag.discount > 0 && (
          <SummaryRow className="text-success"><span>Discount{bag.discountCode ? ` (${bag.discountCode})` : ""}</span><span>{money(bag.discount)} off</span></SummaryRow>
        )}
        <SummaryRow total><span>{t("Total")}</span><span>{money(bag.total)}</span></SummaryRow>
        {currency?.code !== "UGX" && <p className="m-0 mt-1 text-[.78rem] text-ink-3">Shown in {currency?.code} as a guide. You pay in Ugandan shillings (UGX).</p>}
      </div>
      {/* Each step passes its own call to action. */}
      {children}
    </div>
  );
}
