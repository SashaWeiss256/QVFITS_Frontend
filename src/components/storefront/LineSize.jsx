/* Bag Line Size */
import { useId } from "react";

import { useCart } from "@/store/context/CartContext";
import { cn } from "@/utils/cn";
import { forColorName, inStock, productSizes } from "@/utils/stockLevel";

/**
 * The size of one bag line, changeable in place: the sizes that colour comes
 * in, sold-out ones disabled. A line with no size, or one sold out, says so
 * in warn tone and checkout waits for it (utils/bagCheck).
 */
export default function LineSize({ line, product: p, className }) {
  const { setSize } = useCart();
  const id = useId();
  const shown = forColorName(p, line.color);
  const sizes = productSizes(shown);
  const ok = Boolean(line.size) && inStock(shown, line.size);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <label htmlFor={id} className="text-[0.84rem] text-ink-3">{line.color} · Size</label>
      <select
        id={id}
        value={line.size ?? ""}
        onChange={(e) => setSize(line, e.target.value)}
        aria-invalid={!ok || undefined}
        className={cn("min-h-9 border bg-white px-2 py-1 text-[0.86rem]", ok ? "border-line-2" : "border-warn text-warn")}
      >
        {!line.size && <option value="" disabled>Choose a size</option>}
        {/* A size the piece no longer comes in stays listed so the select shows what the line holds. */}
        {line.size && !sizes.includes(line.size) && <option value={line.size} disabled>{line.size} (gone)</option>}
        {sizes.map((s) => (
          <option key={s} value={s} disabled={!inStock(shown, s)}>
            {s}{inStock(shown, s) ? "" : " (sold out)"}
          </option>
        ))}
      </select>
    </span>
  );
}
