/* Product Card */
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { useOffers, useFacets, useSettings } from "@/store/tanstackStore/queries/site";
import { notify } from "@/store/tanstackStore/notices";
import { cn } from "@/utils/cn";
import { anyInStock, firstAvailable, saleOf } from "@/utils/stockLevel";
import Photo from "./Photo";
import PriceTag from "./PriceTag";
import { t } from "@/i18n/translate";

/**
 * The product card, in the luxury register: a tall photograph and very few
 * words under it. Hovering a laptop shows the second photo and a quiet "Add
 * to bag" bar along the foot of the picture; on a phone the bar is always
 * there. One label at most (sold out, then sale, then the product's own),
 * small in the photo's corner. The heart saves the piece.
 */
export default function ProductCard({ product: p }) {
  const { add } = useCart();
  const wishlist = useWishlist();
  const { data: offers } = useOffers();
  const { data: facets } = useFacets();

  const { data: settings } = useSettings();
  const sold = !anyInStock(p);
  // Nearly gone across every size: worth saying, under the Settings threshold.
  const left = Object.values(p.stock).reduce((n, x) => n + x, 0);
  const low = !sold && left <= (settings?.lowStockAt ?? 2);
  const sale = saleOf(p, offers?.sale);
  const wished = wishlist.has(p.id);
  // Colour names map to swatches in the facets; grey until they load.
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "var(--color-line-2)";
  const href = `/product/${p.slug}`;
  const label = sold ? "Sold out" : sale ? `${sale.pct}% off` : p.badge;

  // Adds the first colour and size in stock, then says which: the shopper
  // can change both in the bag.
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
    <article className="group/card relative">
      {/* Picture: the first photo, the second on hover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-sand-100">
        {/* The name link below is the keyboard stop; the photo link is for pointers only. */}
        <Link to={href} aria-label={p.name} tabIndex={-1} className="absolute inset-0">
          <Photo photo={p.photos[0]} label={p.name} className="transition-transform duration-[1.4s] ease-q group-hover/card:scale-[1.03]" />
          {p.photos[1] && (
            <Photo photo={p.photos[1]} label="" className="!absolute inset-0 opacity-0 transition-opacity duration-700 ease-q group-hover/card:opacity-100" />
          )}
        </Link>

        {/* Label: one at most */}
        {label && (
          <span className={cn("absolute left-3 top-3 px-2 py-1 text-[0.72rem] font-medium leading-none", sold ? "bg-ink text-cream" : sale ? "bg-brand-600 text-cream" : "bg-cream/90 text-ink")}>
            {label}
          </span>
        )}

        {/* Save: on a cream disc, so the heart reads on light and dark photos alike */}
        <button
          type="button"
          className={cn(
            "absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-cream/90 shadow-sh-1 backdrop-blur-sm transition-colors hover:bg-cream",
            wished ? "text-brand-600" : "text-ink-2 hover:text-ink",
          )}
          onClick={toggleWish}
          aria-label={`Save ${p.name} to wishlist`}
          aria-pressed={wished}
        >
          <Heart className={cn("h-[18px] w-[18px]", wished && "fill-current")} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Add to bag: slides up on hover, always there on touch */}
        {!sold && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${p.name} to bag`}
            className="absolute inset-x-3 bottom-3 min-h-11 bg-cream/95 text-[0.85rem] font-medium text-ink backdrop-blur transition-[opacity,transform,background-color] duration-500 ease-q hover:bg-ink hover:text-cream [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:translate-y-0 [@media(hover:hover)]:group-hover/card:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          >
            {t("Add to bag")}
          </button>
        )}
      </div>

      {/* Words: name, price, colours */}
      <div className="pt-4">
        <Link className="block py-1.5 font-display text-[1.1rem] leading-snug text-ink transition-colors hover:text-brand-600" to={href}>{p.name}</Link>
        <p className="mt-1 text-[0.88rem] text-ink-2 [&_s]:mr-1.5 [&_s]:text-ink-4 [&_b]:font-medium [&_b]:text-brand-600">
          <PriceTag product={p} />
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          {p.colors.map((c) => <i key={c} className="block h-2.5 w-2.5 rounded-full ring-1 ring-ink/15" style={{ background: swatch(c) }} title={c} />)}
          {low && <span className="ml-2 text-[0.78rem] text-warn">Only {left} left</span>}
        </div>
      </div>
    </article>
  );
}
