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
    <article className="asst-outfit" aria-label={o.title}>
      <header>
        <strong>{o.title}</strong>
        {o.kind === "kit" && <span className="asst-outfit__tag">Kit</span>}
      </header>
      <p className="asst-outfit__why">{o.reason}</p>
      <ul>
        {o.pieces.map((pc) => (
          <li key={`${pc.product.id}-${pc.colorId}`}>
            <Link to={`/product/${pc.product.slug}`} onClick={onLeave} className="asst-outfit__piece">
              <span className="asst-outfit__media"><Photo photo={pc.product.photos[0]} label={pc.product.name} /></span>
              <span className="min-w-0">
                <b>{pc.product.name}</b>
                <small>{pc.color} · {pc.size}{skip.includes(pc.product.id) ? " · in your bag" : ""}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <footer>
        <span>
          <b>{money(o.total)}</b>
          {o.saves > 0 && <small>Saves {money(o.saves)}</small>}
        </span>
        <button type="button" className="btn btn--primary" onClick={addAll} disabled={!toAdd.length}><ShoppingBag className="h-4 w-4" aria-hidden="true" /> {skip.length ? "Add the rest" : "Add all"}</button>
      </footer>
    </article>
  );
}
