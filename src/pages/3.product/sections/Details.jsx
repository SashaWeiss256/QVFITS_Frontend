/* Product Details */
import { Link } from "react-router-dom";

import Accordion from "@/components/ui/Accordion";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";

// The details (open), fit and sizing, and delivery and exchanges. Fees and
// the exchange window come from the shop settings, as on the policy pages.
export default function ProductDetails({ product }) {
  const { money } = useCurrency();
  const { data: s } = useSettings();

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
          <p>Not sure? The <Link to="/size-guide" className="text-brand-600 underline">size guide</Link> has the full measurement chart, or Vee will work it out from your measurements.</p>
        </>
      ),
    },
    {
      title: "Care",
      body: <p>Cold wash, inside out, no fabric softener. Hang to dry, never tumble. Rinse swimwear in fresh water after chlorine or salt.</p>,
    },
  ];
  if (s) {
    items.push({
      title: "Delivery and exchanges",
      body: (
        <>
          <p>Kampala {money(s.kampalaDelivery)}, upcountry {money(s.upcountryDelivery)}, free over {money(s.freeShippingOver)}. Or collect from the showroom. <Link to="/delivery" className="text-brand-600 underline">Delivery details</Link></p>
          <p>Exchange within {s.exchangeDays} days, unworn with tags; swimwear with the liner intact. <Link to="/returns" className="text-brand-600 underline">Exchanges policy</Link></p>
        </>
      ),
    });
  }

  return <Accordion items={items} defaultOpen={0} />;
}
