/* Discount Code */
import { useState } from "react";

import { useCurrency } from "@/store/context/CurrencyContext";

/**
 * The code box under the order summary. Checking a code prices the bag on
 * the service (useQuote), the same way the order will be priced, so the
 * saving shown is the saving charged. Says why when a code does not apply.
 */
export default function DiscountCode({ applied, onApply, onRemove, checking, error }) {
  const { money } = useCurrency();
  const [code, setCode] = useState("");

  if (applied?.discountCode) {
    return (
      <div className="mt-4 flex items-center justify-between gap-2 rounded-r-md bg-brand-50 px-3 py-2.5 text-sm">
        <span><strong>{applied.discountCode}</strong> {applied.discount ? `saves ${money(applied.discount)}` : "gives free delivery"}</span>
        <button type="button" className="text-ink-3 underline" onClick={() => { setCode(""); onRemove(); }}>Remove</button>
      </div>
    );
  }

  return (
    <form className="mt-4" noValidate onSubmit={(e) => { e.preventDefault(); if (code.trim()) onApply(code.trim()); }}>
      <label htmlFor="discountCode" className="mb-1.5 block text-[.8rem] font-medium text-ink-3">Discount code</label>
      <div className="flex gap-2">
        <input id="discountCode" className="input min-w-0 flex-1 uppercase" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
        <button type="submit" className="btn btn--soft" disabled={!code.trim() || checking}>{checking ? "Checking…" : "Apply"}</button>
      </div>
      {error && <p role="alert" className="m-0 mt-1.5 text-xs font-semibold text-warn">{error}</p>}
    </form>
  );
}
