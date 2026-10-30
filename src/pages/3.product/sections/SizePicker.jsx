/* Size Picker */
import { Link } from "react-router-dom";

import { useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { inStock, productSizes } from "@/utils/stockLevel";
import { t } from "@/i18n/translate";

// Sold-out sizes stay visible but struck through and disabled, so the shop
// is honest about what is gone. The note under the row says how many are left.
export default function SizePicker({ product, chosen, onChoose }) {
  // Units left in the chosen size; null until a size is picked so no note shows.
  const n = chosen ? product.stock[chosen] || 0 : null;
  // "Only N left" from the threshold set in Settings, the same one the admin's low stock uses.
  const { data: settings } = useSettings();
  const low = settings?.lowStockAt ?? 2;

  return (
    <div>
      {/* Heading and the size guide */}
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-[0.88rem] text-ink-3">
          Size {chosen && <span className="ml-1 text-ink">{chosen}</span>}
        </p>
        <Link to="/size-guide" className="inline-flex min-h-11 items-center text-[0.85rem] underline underline-offset-4 hover:text-brand-600">{t("Size guide")}</Link>
      </div>

      {/* Sizes */}
      <div className="grid auto-cols-fr grid-flow-col gap-2" role="radiogroup" aria-label={t("Size")}>
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
              className={cn(
                "relative min-h-12 border text-[0.9rem] font-normal transition-colors",
                s === chosen ? "border-ink bg-ink text-cream" : "border-line-2 hover:border-ink",
                out && "cursor-not-allowed text-ink-4 line-through decoration-1 hover:border-line-2",
              )}
              onClick={() => onChoose(s)}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Stock note: announced as the size changes */}
      <p className={cn("mt-3 min-h-[1.4em] text-[0.85rem]", n !== null && n <= low ? "text-warn" : "text-success")} aria-live="polite">
        {n === null ? "" : n === 0 ? `Sold out in ${chosen}` : n <= low ? `Only ${n} left in ${chosen}` : ""}
      </p>
    </div>
  );
}
