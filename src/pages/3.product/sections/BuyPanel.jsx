/* Buy Panel (from Quivogue product.html) */
import { useState } from "react";
import { Heart } from "lucide-react";

import { askVee } from "@/components/assistant/askVee";
import PriceTag from "@/components/storefront/PriceTag";
import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { notify } from "@/store/tanstackStore/notices";
import { useFacets } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { anyInStock, inStock, productSizes } from "@/utils/stockLevel";
import ColorPicker from "./ColorPicker";
import ProductDetails from "./ProductDetails";
import SizePicker from "./SizePicker";

// The first colour and the first size in stock are chosen to start, so one
// tap adds to the bag.
export default function BuyPanel({ product: p }) {
  const [color, setColor] = useState(p.colors[0]);
  const [size, setSize] = useState(() => productSizes(p).find((s) => inStock(p, s)) ?? null);
  const { add } = useCart();
  const wishlist = useWishlist();
  const { data: facets } = useFacets();
  const sold = !anyInStock(p);
  const wished = wishlist.has(p.id);
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "#ddd";

  const addToBag = () => {
    if (!size) return notify("Pick a size first");
    add({ productId: p.id, size, color, qty: 1 });
    notify(`${p.name} (${color}, ${size}) is in your bag`, { tone: "success" });
  };

  return (
    <div className="pdp__info">
      <span className="card__cat">{p.category}</span>
      <h1 className="mt-1 mb-0 text-[clamp(1.6rem,3.2vw,2.2rem)]">{p.name}</h1>
      <div className="pdp__price"><PriceTag product={p} /></div>
      <p className="lede text-base">{p.blurb}</p>
      {sold && <div className="pill-note bg-brand-100 text-brand-600">Fully sold out right now. Ask us on WhatsApp whether it&apos;s coming back.</div>}

      <ColorPicker colors={p.colors} chosen={color} onChoose={setColor} swatch={swatch} />
      <SizePicker product={p} chosen={size} onChoose={setSize} />

      {/* Add to bag and save */}
      <div className="pdp__cta">
        <button type="button" className="btn btn--primary btn--lg" disabled={sold} onClick={addToBag}>
          {sold ? "Sold out" : "Add to bag"}
        </button>
        <button
          type="button"
          className={cn("btn btn--ghost btn--lg heart-inline", wished && "is-on")}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          onClick={() => wishlist.toggle(p.id)}
        >
          <Heart className="h-[19px] w-[19px]" aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="btn btn--soft btn--block mt-2.5" onClick={() => askVee(`What size am I in the ${p.name}?`)}>
        Not sure on size? Ask Vee
      </button>

      <ProductDetails product={p} />
    </div>
  );
}
