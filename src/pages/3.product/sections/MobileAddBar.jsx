/* Mobile Add Bar */
import { useEffect, useState } from "react";

import PriceTag from "@/components/storefront/PriceTag";
import { cn } from "@/utils/cn";

/**
 * Phones and tablets: once the main "Add to bag" has scrolled out of view,
 * a slim bar with the price and the same button rises from the foot of the
 * screen, so adding never needs a scroll back up.
 */
export default function MobileAddBar({ product, size, sold, onAdd, watch }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = watch.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [watch]);

  return (
    <div className={cn("pdp-bar", shown && "is-on")} aria-hidden={!shown} inert={!shown}>
      <div className="min-w-0">
        <strong className="block truncate text-[.92rem]">{product.name}</strong>
        <span className="text-[.88rem] tabular-nums"><PriceTag product={product} />{size ? ` · ${size}` : ""}</span>
      </div>
      <button type="button" className="btn btn--primary" disabled={sold} onClick={onAdd}>
        {sold ? "Sold out" : size ? "Add to bag" : "Choose a size"}
      </button>
    </div>
  );
}
