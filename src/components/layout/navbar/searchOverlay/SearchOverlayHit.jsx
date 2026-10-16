/* Search Overlay Hit */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import { useCurrency } from "@/store/context/CurrencyContext";
import { anyInStock } from "@/utils/stockLevel";

export default function SearchOverlayHit({ product: p, onNavigate }) {
  const { money } = useCurrency();
  return (
    <Link className="search-ov__hit" to={`/product/${p.slug}`} onClick={onNavigate}>
      <Photo photo={p.photos[0]} label={p.name} />
      <strong>{p.name}</strong>
      <span>{money(p.price)}{anyInStock(p) ? "" : " · sold out"}</span>
    </Link>
  );
}
