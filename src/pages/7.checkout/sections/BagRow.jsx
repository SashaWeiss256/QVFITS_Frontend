/* Bag Row */
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { useCart } from "@/store/context/CartContext";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

const META = "mt-0.5 text-[0.86rem] text-ink-3";
// The quantity stepper's minus and plus.
const STEP = "grid h-10 w-10 place-items-center text-ink-2 transition-colors duration-200 hover:bg-sand-100 hover:text-ink";

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
    // On a phone the price and Remove share a line under the item, so the name has the width beside the photo.
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-line py-6 sm:grid-cols-[124px_minmax(0,1fr)_auto] sm:gap-7">
      <Link className="relative block aspect-[3/4] overflow-hidden bg-beige max-sm:row-span-2 max-sm:self-start" to={`/product/${p.slug}`}><Photo photo={p.photos[0]} label={p.name} /></Link>
      <div>
        {/* The name gets a 24px tap box; the photo beside it links to the same piece. */}
        <Link className="inline-block min-h-6 py-1 font-display text-[1.08rem] font-normal leading-[1.3] tracking-normal transition-colors duration-200 hover:text-brand-600" to={`/product/${p.slug}`}>{p.name}</Link>
        <div className={META}>{line.color} · Size {line.size}</div>
        <div className={cn(META, max <= 2 ? "text-warn" : "text-ink-4")}>{max <= 2 ? `Only ${max} left in ${line.size}` : "In stock"}</div>
        <div className="mt-2 inline-flex items-center border border-line-2 bg-white">
          {/* Going below one removes the line (see CartContext.setQty). */}
          <button type="button" className={STEP} aria-label={`One less ${p.name}`} onClick={() => setQty(line, line.qty - 1)}><Minus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
          <span className="min-w-[34px] text-center text-[0.92rem] tabular-nums" aria-live="polite">{line.qty}</span>
          <button type="button" className={STEP} aria-label={`One more ${p.name}`} onClick={more}><Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between text-[1rem] tabular-nums max-sm:col-start-2 max-sm:flex-row max-sm:items-center">
        <strong className="font-medium">{money(total)}</strong>
        <button type="button" className="min-h-9 text-[0.84rem] text-ink-3 underline underline-offset-4 transition-colors duration-200 hover:text-brand-600" onClick={() => remove(line)}>{t("Remove")}</button>
      </div>
    </div>
  );
}
