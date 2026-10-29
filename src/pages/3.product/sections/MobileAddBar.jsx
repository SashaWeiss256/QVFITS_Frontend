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

  // Vee and the offer card sit above the bar while it is up (they read --addbar below the lg breakpoint).
  useEffect(() => {
    document.documentElement.style.setProperty("--addbar", shown ? "4.75rem" : "0px");
    return () => document.documentElement.style.removeProperty("--addbar");
  }, [shown]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] flex items-center gap-4 border-t border-line bg-cream/95 px-5 py-3 backdrop-blur transition-transform duration-500 ease-q lg:hidden",
        shown ? "translate-y-0" : "translate-y-full",
      )}
      aria-hidden={!shown}
      inert={!shown}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.95rem] font-semibold">{product.name}</p>
        <p className="text-[0.85rem] tabular-nums text-ink-2 [&_b]:font-semibold [&_b]:text-brand-600 [&_s]:mr-1 [&_s]:text-ink-4"><PriceTag product={product} />{size ? `, ${size}` : ""}</p>
      </div>
      <button type="button" className="btn btn--primary" disabled={sold} onClick={onAdd}>
        {sold ? "Sold out" : size ? "Add to bag" : "Choose a size"}
      </button>
    </div>
  );
}
