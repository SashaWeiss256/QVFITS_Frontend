/* Buy Panel (from Quivogue product.html) */
import { useRef, useState } from "react";
import { Heart } from "lucide-react";

import { askVee } from "@/components/assistant/askVee";
import PriceTag from "@/components/storefront/PriceTag";
import { useCart } from "@/store/context/CartContext";
import { useWishlist } from "@/store/context/WishlistContext";
import { notify } from "@/store/tanstackStore/notices";
import { useFacets } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { anyInStock, forColor, inStock, productSizes } from "@/utils/stockLevel";
import ColorPicker from "./ColorPicker";
import MobileAddBar from "./MobileAddBar";
import Details from "./Details";
import SizePicker from "./SizePicker";

// The first colour and the first size in stock are chosen to start, so one
// tap adds to the bag. Sizes show the stock of the colour picked.
export default function BuyPanel({ product: p, onColor }) {
  const { data: facets } = useFacets();
  const idOf = (name) => facets?.colors.find((c) => c.name === name)?.id;
  const [color, setColor] = useState(() => p.colors.find((c) => anyInStock(forColor(p, idOf(c)))) ?? p.colors[0]);
  const shown = forColor(p, idOf(color));
  const [size, setSize] = useState(() => productSizes(shown).find((s) => inStock(shown, s)) ?? null);
  const { add } = useCart();
  const wishlist = useWishlist();

  // A new colour keeps the size if that colour has it, otherwise the first it has.
  const chooseColor = (c) => {
    setColor(c);
    onColor?.(idOf(c));
    const next = forColor(p, idOf(c));
    if (!size || !inStock(next, size)) setSize(productSizes(next).find((s) => inStock(next, s)) ?? null);
  };
  const sold = !anyInStock(p);
  const wished = wishlist.has(p.id);
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "var(--line-2)";

  const cta = useRef(null);
  const sizes = useRef(null);

  const addToBag = () => {
    if (size && !inStock(shown, size)) return notify(`${color} is sold out in ${size}. Try another size or colour.`);
    if (!size) {
      sizes.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return notify("Pick a size first");
    }
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

      <ColorPicker colors={p.colors} chosen={color} onChoose={chooseColor} swatch={swatch} />
      <div ref={sizes}>
        <SizePicker product={shown} chosen={size} onChoose={setSize} />
      </div>

      {/* Add to bag and save */}
      <div className="pdp__cta" ref={cta}>
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
          <Heart className="h-4.75 w-4.75" aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="btn btn--soft btn--block mt-2.5" onClick={() => askVee(`What size am I in the ${p.name}?`)}>
        Not sure on size? Ask Vee
      </button>

      <Details product={p} />
      <MobileAddBar product={p} size={size} sold={sold} onAdd={addToBag} watch={cta} />
    </div>
  );
}
