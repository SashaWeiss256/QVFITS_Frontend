/* Product Card (from Quivogue productCard()) */
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { useOffers, useFacets } from "@/store/tanstackStore/queries/site";
import { notify } from "@/store/tanstackStore/notices";
import { cn } from "@/utils/cn";
import { anyInStock, firstAvailable, saleOf } from "@/utils/stockLevel";
import Photo from "./Photo";
import PriceTag from "./PriceTag";

export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const wishlist = useWishlist();
  const { data: offers } = useOffers();
  const { data: facets } = useFacets();

  const sold = !anyInStock(p);
  const sale = saleOf(p, offers?.sale);
  const wished = wishlist.has(p.id);
  // Colour names map to swatches in the facets; grey until they load.
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "var(--line-2)";
  const href = `/product/${p.slug}`;

  // Adds the first colour and size in stock, then says which: the
  // shopper can change both in the bag. Without this a phone had no way to
  // add from the grid.
  const quickAdd = () => {
    const pick = firstAvailable(p);
    if (!pick) return notify(`${p.name} is sold out`);
    add({ productId: p.id, ...pick, qty: 1 });
    notify(`${p.name} (${pick.color}, ${pick.size}) added. Change size in your bag.`, { tone: "success" });
  };

  const toggleWish = () => {
    wishlist.toggle(p.id);
    notify(wished ? "Removed from your saved pieces" : `Saved ${p.name}`, { tone: "success" });
  };

  return (
    <article className="card">
      <div className="card__media">
        <button type="button" className={cn("heart", wished && "is-on")} onClick={toggleWish} aria-label={`Save ${p.name} to wishlist`} aria-pressed={wished}>
          <Heart className="h-[19px] w-[19px]" strokeWidth={1.9} aria-hidden="true" />
        </button>
        {/* The name link below is the keyboard stop; the photo link is for pointers only. */}
        <Link to={href} aria-label={p.name} tabIndex={-1}>
          <Photo photo={p.photos[0]} label={p.name} />
        </Link>
      </div>
      <div className="card__body">
        {/* One badge only: sold out beats sale, sale beats the product's own label. */}
        {sold ? <span className="badge badge--out">Sold out</span>
          : sale ? <span className="badge badge--sale">{sale.pct}% off</span>
          : p.badge ? <span className="badge">{p.badge}</span> : null}
        <span className="card__cat">{p.category}</span>
        <Link className="card__name" to={href}>{p.name}</Link>
        <div className="card__swatches">
          {p.colors.map((c) => <i key={c} className="sw" style={{ background: swatch(c) }} title={c} />)}
        </div>
        <div className="card__foot">
          <span className="card__price"><PriceTag product={p} /></span>
          {/* Sold out still links through so the shopper can see the piece. */}
          {sold ? (
            <Link className="card__add card__add--out" to={href}>Sold out</Link>
          ) : (
            <button type="button" className="card__add" onClick={quickAdd} aria-label={`Add ${p.name} to bag`}>Add</button>
          )}
        </div>
      </div>
    </article>
  );
}
