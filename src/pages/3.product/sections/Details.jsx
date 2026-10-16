/* Product Details */
import { Link } from "react-router-dom";

import Accordion from "@/components/ui/Accordion";
import { useCurrency } from "@/store/context/CurrencyContext";
import { usePageCopy, useSettings } from "@/store/tanstackStore/queries/site";
import { fill, shopTokens } from "@/utils/fill";

// The details (open), fit and sizing, care, and delivery and exchanges.
// Care is per product; fees and the exchange window come from the settings.
export default function Details({ product }) {
  const { money } = useCurrency();
  const { data: s } = useSettings();
  const { data: copy } = usePageCopy("product");
  const tokens = shopTokens(s, money);

  // Product copy first; the shop-wide panel is added once settings load.
  const items = [
    {
      title: "The details",
      body: (
        <>
          <ul>{product.details.map((d) => <li key={d}>{d}</li>)}</ul>
          {product.fabric && <p className="mt-2.5">{product.fabric}</p>}
        </>
      ),
    },
    {
      title: "Fit and sizing",
      body: (
        <>
          {product.fitNote && <p>{product.fitNote}</p>}
          <p>{copy?.fitHelp} <Link to="/size-guide" className="text-brand-600 underline">Open the size guide</Link></p>
        </>
      ),
    },
    product.care && { title: "Care", body: <p>{product.care}</p> },
  ].filter(Boolean);
  if (s && copy) {
    items.push({
      title: "Delivery and exchanges",
      body: (
        <>
          <p>{fill(copy.delivery, tokens)} <Link to="/delivery" className="text-brand-600 underline">Delivery details</Link></p>
          <p>{fill(copy.exchanges, tokens)} <Link to="/returns" className="text-brand-600 underline">Exchanges policy</Link></p>
        </>
      ),
    });
  }

  // "The details" opens by default.
  return <Accordion items={items} defaultOpen={0} />;
}
