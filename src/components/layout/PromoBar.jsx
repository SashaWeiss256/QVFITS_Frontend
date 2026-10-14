/* Promo Bar */
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOffers, useSettings } from "@/store/tanstackStore/queries/site";

// The strip above the header. Its lines come from Offers in the admin, with
// {{freeShipping}} and {{phone}} filled from the shop settings.
export default function PromoBar() {
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const { money } = useCurrency();

  const lines = (offers?.promoBar ?? []).map((line) =>
    line
      .replace("{{freeShipping}}", settings ? money(settings.freeShippingOver) : "")
      .replace("{{phone}}", settings?.phone ?? ""),
  );
  if (!lines.length) return null;

  return <div className="promo">{lines.join("\u00a0\u00a0·\u00a0\u00a0")}</div>;
}
