/* Currency Picker (from Quivogue currencyPicker()) */
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useClickOutside } from "@/utils/useClickOutside";

// Changes the display currency only; see CurrencyContext.
export default function CurrencyPicker() {
  const { currency, currencies, ratesUpdated, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  // Nothing to pick until the admin adds a second currency.
  if (currencies.length < 2) return null;
  // Settings list the base (UGX) first.
  const base = currencies[0];

  return (
    <div className="cur" ref={ref}>
      <button
        type="button"
        className="cur__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change currency. Showing ${currency.code}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{currency.code}</span>
        <ChevronDown className="h-[11px] w-[11px]" strokeWidth={2.6} aria-hidden="true" />
      </button>
      <div className="cur__menu" role="listbox" hidden={!open}>
        {currencies.map((c) => (
          <button
            key={c.code}
            type="button"
            role="option"
            aria-selected={c.code === currency.code}
            className={`cur__opt ${c.code === currency.code ? "is-on" : ""}`}
            onClick={() => {
              setCurrency(c.code);
              setOpen(false);
            }}
          >
            <b>{c.code}</b>
            <span>{c.label}</span>
          </button>
        ))}
        {/* Rates are refreshed by hand and go stale, so show their date. */}
        <p className="cur__note">
          Prices outside {base.code} are approximate, converted at rates from {ratesUpdated ?? "a recent update"}. Orders are settled in {base.label}.
        </p>
      </div>
    </div>
  );
}
