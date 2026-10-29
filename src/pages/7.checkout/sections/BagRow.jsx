/* Bag Row */
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import { t } from "@/i18n/translate";

// One line in the bag: photo, name, colour and size, stock, quantity
// stepper (capped at what is in stock), price and Remove.
export default function BagRow({ row }) {
  const { line, product: p, total } = row;
  const { setQty, remove } = useCart();
  const { money } = useCurrency();
  // Units left in this size; a missing size counts as none.
  const max = p.stock[line.size] || 0;

  // Explain the cap instead of silently ignoring the tap.
  const more = () => (line.qty + 1 > max ? notify(`That's all we have in ${line.size}`) : setQty(line, line.qty + 1));

  return (
    <div className="cart-row">
      <Link className="cart-row__media" to={`/product/${p.slug}`}><Photo photo={p.photos[0]} label={p.name} /></Link>
      <div>
        <Link className="cart-row__name" to={`/product/${p.slug}`}>{p.name}</Link>
        <div className="cart-row__meta">{line.color} · Size {line.size}</div>
        <div className={max <= 2 ? "cart-row__meta text-warn" : "cart-row__meta text-ink-4"}>{max <= 2 ? `Only ${max} left in ${line.size}` : "In stock"}</div>
        <div className="qty mt-2">
          {/* Going below one removes the line (see CartContext.setQty). */}
          <button type="button" aria-label={`One less ${p.name}`} onClick={() => setQty(line, line.qty - 1)}><Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
          <span aria-live="polite">{line.qty}</span>
          <button type="button" aria-label={`One more ${p.name}`} onClick={more}><Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="cart-row__right">
        <strong>{money(total)}</strong>
        <button type="button" className="remove" onClick={() => remove(line)}>{t("Remove")}</button>
      </div>
    </div>
  );
}
