/* Buy Panel (from Quivogue product.html) */
import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Truck } from "lucide-react";

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
  // The gallery follows the colour shown, from the first one onwards.
  const colorId = idOf(color);
  useEffect(() => {
    if (colorId) onColor?.(colorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorId]);
  const sold = !anyInStock(p);
  const wished = wishlist.has(p.id);
  const swatch = (c) => facets?.colors.find((x) => x.name === c)?.swatch ?? "var(--color-line-2)";

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
    <div>
      {/* Name and price */}
      <p className="kicker">{p.category}</p>
      <h1 className="text-[clamp(1.9rem,3.2vw,2.8rem)]">{p.name}</h1>
      <p className="mt-4 font-display text-[1.35rem] font-semibold tabular-nums [&_b]:text-brand-600 [&_s]:mr-2 [&_s]:font-normal [&_s]:text-ink-4">
        <PriceTag product={p} />
      </p>
      <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-ink-2">{p.blurb}</p>
      {sold && <p className="mt-5 border-l-2 border-brand-500 pl-4 text-[0.92rem] text-ink-2">Fully sold out right now. Ask us on WhatsApp whether it&apos;s coming back.</p>}

      {/* Choices */}
      <div className="mt-9 space-y-8 border-t border-line pt-8">
        <ColorPicker colors={p.colors} chosen={color} onChoose={chooseColor} swatch={swatch} />
        <div ref={sizes}>
          <SizePicker product={shown} chosen={size} onChoose={setSize} />
        </div>
      </div>

      {/* Add to bag and save */}
      <div className="mt-6 flex gap-3" ref={cta}>
        <button type="button" className="btn btn--primary btn--lg flex-1" disabled={sold} onClick={addToBag}>
          {sold ? "Sold out" : "Add to bag"}
        </button>
        <button
          type="button"
          className={cn("btn btn--ghost btn--lg w-[56px] px-0", wished && "border-brand-500 text-brand-500")}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wished}
          onClick={() => wishlist.toggle(p.id)}
        >
          <Heart className="h-5 w-5" strokeWidth={1.5} fill={wished ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      </div>

      {/* Help and promises */}
      <div className="mt-5 space-y-2.5 text-[0.88rem] text-ink-2">
        <button type="button" className="inline-flex min-h-11 items-center gap-2.5 hover:text-brand-600" onClick={() => askVee(`What size am I in the ${p.name}?`)}>
          <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> Not sure of your size? Ask Vee
        </button>
        <p className="flex items-center gap-2.5"><Truck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> Delivered across Uganda, or collect from the showroom</p>
      </div>

      {/* Details */}
      <div className="mt-10">
        <Details product={p} />
      </div>
      <MobileAddBar product={p} size={size} sold={sold} onAdd={addToBag} watch={cta} />
    </div>
  );
}
