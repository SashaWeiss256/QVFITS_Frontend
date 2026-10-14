/* Price Tag */
import { useCurrency } from "@/store/context/CurrencyContext";
import { useOffers } from "@/store/tanstackStore/queries/site";
import { saleOf } from "@/utils/stockLevel";

// The price in the visitor's currency; struck through with the sale price
// beside it only when the sale is live and this piece is reduced.
export default function PriceTag({ product, qty = 1 }) {
  const { money } = useCurrency();
  const { data: offers } = useOffers();
  const sale = saleOf(product, offers?.sale);

  if (!sale) return <>{money(product.price * qty)}</>;
  return (
    <>
      <s>{money(sale.was * qty)}</s> <b>{money(sale.now * qty)}</b>
    </>
  );
}
