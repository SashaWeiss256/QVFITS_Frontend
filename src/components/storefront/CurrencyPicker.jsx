/* Currency Picker */
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useClickOutside } from "@/utils/useClickOutside";
import { cn } from "@/utils/cn";

// Changes the display currency only; see CurrencyContext. It sits in the
// footer, as on most luxury shops, so its menu opens upward. tone="dark" for
// dark grounds.
export default function CurrencyPicker({ tone = "light" }) {
  const dark = tone === "dark";
  const { currency, currencies, ratesUpdated, ratesAreLive, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  // Nothing to pick until the admin adds a second currency.
  if (currencies.length < 2) return null;
  // Settings list the base (UGX) first.
  const base = currencies[0];

  return (
    <div className="relative" ref={ref} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      {/* Button */}
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-1.5 text-[0.85rem]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change currency. Showing ${currency.code}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>Prices in {currency.code}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Menu: opens upward */}
      <div className={cn("absolute bottom-full left-0 z-20 mb-2 w-72 border p-2 shadow-sh-3", dark ? "border-cream/15 bg-ink text-cream" : "border-line bg-cream text-ink")} role="listbox" hidden={!open}>
        {currencies.map((c) => (
          <button
            key={c.code}
            type="button"
            role="option"
            aria-selected={c.code === currency.code}
            className={cn("flex min-h-10 w-full items-center gap-3 px-3 text-left text-[0.88rem] transition-colors", c.code === currency.code ? "font-medium" : dark ? "text-cream/70 hover:text-cream" : "text-ink-3 hover:text-ink")}
            onClick={() => {
              setCurrency(c.code);
              setOpen(false);
            }}
          >
            <b className="w-10 font-medium">{c.code}</b>
            <span>{c.label}</span>
          </button>
        ))}
        {/* Rates refresh by themselves; the date shows when they were last fetched. */}
        <p className={cn("border-t px-3 pb-1 pt-3 text-[0.75rem] leading-relaxed", dark ? "border-cream/15 text-cream/55" : "border-line text-ink-3")}>
          Prices outside {base.code} are approximate, converted at today's rates{ratesUpdated && ratesAreLive ? `, fetched ${ratesUpdated}` : ""}. Orders are settled in {base.label}.
        </p>
      </div>
    </div>
  );
}
