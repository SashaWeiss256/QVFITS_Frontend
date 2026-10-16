/* Announcement Bar */
import { useEffect, useState } from "react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useOffers, useSettings } from "@/store/tanstackStore/queries/site";

/**
 * One line at a time, cross-fading every 4.5s, so it never wraps on a phone.
 * Pauses on hover and focus; holds the first line for reduced motion. Lines
 * come from Offers in the admin, with {{freeShipping}} and {{phone}} filled in.
 */
export default function PromoBar() {
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const { money } = useCurrency();
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);

  const lines = (offers?.promoBar ?? []).map((line) =>
    line.replace("{{freeShipping}}", settings ? money(settings.freeShippingOver) : "").replace("{{phone}}", settings?.phone ?? ""),
  );

  useEffect(() => {
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || still || lines.length < 2) return undefined;
    const t = setInterval(() => setAt((i) => (i + 1) % lines.length), 4500);
    return () => clearInterval(t);
  }, [paused, lines.length]);

  if (!lines.length) return null;

  return (
    <div className="promo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <span key={at} className="promo__line" aria-live="off">{lines[at % lines.length]}</span>
    </div>
  );
}
