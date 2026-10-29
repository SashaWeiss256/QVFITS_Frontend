/* Outfit Card */
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import Photo from "./Photo";

/**
 * One outfit from Vee's colour engine: its pieces in the colour and size
 * shown, a line on why the colours work, the total (and a kit's saving), and
 * one button that adds every piece. Used in the chat, on the product page and
 * in the bag. `skip` is the ids already in the bag, which are not added twice.
 */
export default function OutfitCard({ outfit: o, onLeave, skip = [] }) {
  const { money } = useCurrency();
  const { add } = useCart();
  const toAdd = o.pieces.filter((pc) => !skip.includes(pc.product.id));

  // Every piece goes in as its own line; a kit's lines carry its id so checkout charges the kit price.
  const addAll = () => {
    for (const pc of toAdd) add({ productId: pc.product.id, size: pc.size, color: pc.color, qty: 1, ...(o.kitId ? { kitId: o.kitId } : {}) });
    notify(`${toAdd.length} ${toAdd.length === 1 ? "piece" : "pieces"} added. Check the sizes in your bag.`, { tone: "success" });
  };

  return (
    <article className="flex h-full flex-col border border-line bg-white/60 p-5" aria-label={o.title}>
      {/* Title and why */}
      <header className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[1.15rem] leading-snug">{o.title}</p>
        {o.kind === "kit" && <span className="text-[0.78rem] text-brand-600">Kit</span>}
      </header>
      <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-3">{o.reason}</p>

      {/* Pieces */}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {o.pieces.map((pc) => (
          <li key={`${pc.product.id}-${pc.colorId}`}>
            <Link to={`/product/${pc.product.slug}`} onClick={onLeave} className="group flex items-center gap-3 py-3">
              <span className="relative block aspect-[3/4] w-12 shrink-0 overflow-hidden bg-beige"><Photo photo={pc.product.photos[0]} label={pc.product.name} /></span>
              <span className="min-w-0">
                <span className="block truncate text-[0.9rem] group-hover:text-brand-600">{pc.product.name}</span>
                <span className="block text-[0.78rem] text-ink-3">{pc.color}, {pc.size}{skip.includes(pc.product.id) ? ", in your bag" : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Total and add */}
      <footer className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span>
          <span className="block font-display text-[1.1rem]">{money(o.total)}</span>
          {o.saves > 0 && <span className="block text-[0.78rem] text-brand-600">Saves {money(o.saves)}</span>}
        </span>
        <button type="button" className="btn btn--primary" onClick={addAll} disabled={!toAdd.length}><ShoppingBag className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> {skip.length ? "Add the rest" : "Add all"}</button>
      </footer>
    </article>
  );
}
