/* Search Overlay Hit */
import { Link } from "react-router-dom";

import Photo from "@/components/storefront/Photo";
import { useCurrency } from "@/store/context/CurrencyContext";
import { anyInStock } from "@/utils/stockLevel";

// One result: a portrait photo, the name in the serif, the price beneath.
export default function SearchOverlayHit({ product: p, onNavigate }) {
  const { money } = useCurrency();
  return (
    <Link className="group block" to={`/product/${p.slug}`} onClick={onNavigate}>
      {/* Photo */}
      <div className="aspect-[3/4] overflow-hidden">
        <Photo photo={p.photos[0]} label={p.name} className="transition-transform duration-[1.2s] ease-q group-hover:scale-[1.04]" />
      </div>
      {/* Name and price */}
      <strong className="mt-3 block font-display text-[1.05rem] font-normal leading-snug">{p.name}</strong>
      <span className="mt-0.5 block text-[0.85rem] text-ink-3">{money(p.price)}{anyInStock(p) ? "" : ", sold out"}</span>
    </Link>
  );
}
