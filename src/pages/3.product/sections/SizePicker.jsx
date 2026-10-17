/* Size Picker */
import { Link } from "react-router-dom";

import { useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { inStock, productSizes } from "@/utils/stockLevel";

// Sold-out sizes stay visible but disabled, so the shop is honest about
// what is gone. The note under the row says how many are left.
export default function SizePicker({ product, chosen, onChoose }) {
  // Units left in the chosen size; null until a size is picked so no note shows.
  const n = chosen ? product.stock[chosen] || 0 : null;
  // "Only N left" from the threshold set in Settings, the same one the admin's low stock uses.
  const { data: settings } = useSettings();
  const low = settings?.lowStockAt ?? 2;

  return (
    <div className="opt">
      <div className="opt__head">
        <h2>Size</h2>
        <Link to="/size-guide" className="text-[.84rem] text-brand-600 underline">Size guide</Link>
      </div>
      <div className="size-row" role="radiogroup" aria-label="Size">
        {productSizes(product).map((s) => {
          const out = !inStock(product, s);
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={s === chosen}
              disabled={out}
              aria-label={out ? `${s}, sold out` : s}
              className={cn("size-btn", out && "is-out", s === chosen && "is-on")}
              onClick={() => onChoose(s)}
            >
              {s}
            </button>
          );
        })}
      </div>
      {/* Stock Note: announced as the size changes. */}
      <p className={cn("stock-note", n !== null && (n <= low ? "low" : "ok"))} aria-live="polite">
        {n === null ? "" : n === 0 ? `Sold out in ${chosen}` : n <= low ? `Only ${n} left in ${chosen}. This one moves fast.` : `In stock in ${chosen}`}
      </p>
    </div>
  );
}
