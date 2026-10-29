/* Price Range */
import { useState } from "react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { t } from "@/i18n/translate";

/**
 * Two thumbs on one track, the span between them filled. It moves freely
 * while dragged and tells the shop once let go, so the grid doesn't
 * recount on every pixel. Prices are UGX; the labels follow the currency
 * the shopper picked.
 */
export default function PriceRange({ min, max, step = 5000, value, onChange }) {
  const { money } = useCurrency();
  const [range, setRange] = useState([value[0] ?? min, value[1] ?? max]);
  const [lo, hi] = range;
  const span = Math.max(max - min, 1);
  const pct = (v) => ((v - min) / span) * 100;
  // Back to the full range means no price filter at all.
  const commit = () => onChange([lo > min ? lo : null, hi < max ? hi : null]);
  const end = { onPointerUp: commit, onKeyUp: commit, onTouchEnd: commit };

  return (
    <div>
      <div className="prange">
        <span className="prange__track" aria-hidden="true" />
        <span className="prange__fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} aria-hidden="true" />
        <input
          type="range" min={min} max={max} step={step} value={lo}
          aria-label={t("Lowest price")} aria-valuetext={money(lo)}
          // Raised once the thumbs meet at the top, so the low one can still be grabbed.
          className={pct(lo) > 90 ? "z-[3]" : "z-[2]"}
          onChange={(e) => setRange([Math.min(Number(e.target.value), hi - step), hi])}
          {...end}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          aria-label={t("Highest price")} aria-valuetext={money(hi)}
          className="z-[2]"
          onChange={(e) => setRange([lo, Math.max(Number(e.target.value), lo + step)])}
          {...end}
        />
      </div>
      <div className="prange__vals">
        <span>{money(lo)}</span>
        <span>{money(hi)}</span>
      </div>
    </div>
  );
}
