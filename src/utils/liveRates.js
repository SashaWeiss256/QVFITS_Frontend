/* Live Exchange Rates */
import { useEffect, useMemo, useState } from "react";

import { readStored, writeStored } from "@/utils/storage";

// Free daily rates, one UGX in every currency, no key needed. The shop's own
// backend can serve the same shape instead (set VITE_RATES_URL).
const SOURCE = import.meta.env?.VITE_RATES_URL || "https://open.er-api.com/v6/latest/UGX";
const KEY = "qvfits:rates";
const FRESH_FOR = 6 * 60 * 60 * 1000;


/**
 * Keeps the display currencies' rates current without anyone typing them.
 * A visitor's browser asks the rates service at most every six hours, keeps
 * the answer, and falls back to the last answer (or to the rates saved in
 * Settings) if the service can't be reached. Prices are still UGX underneath
 * and orders are still charged in UGX; these rates only change what is shown.
 *
 * Returns the currencies with their rates swapped for live ones, the date the
 * rates were fetched, and whether they are live.
 */
export function useLiveRates(currencies) {
  const [cached, setCached] = useState(() => readStored(KEY, null));

  useEffect(() => {
    if (cached && Date.now() - cached.at < FRESH_FOR) return undefined;
    const ctrl = new AbortController();
    fetch(SOURCE, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("rates"))))
      .then((data) => {
        const rates = data.rates ?? data.conversion_rates;
        if (!rates || typeof rates.USD !== "number") return;
        const next = { at: Date.now(), rates };
        writeStored(KEY, next);
        setCached(next);
      })
      .catch(() => {
        // Offline or blocked: keep showing the last rates we had.
      });
    return () => ctrl.abort();
  }, [cached]);

  return useMemo(() => {
    if (!currencies) return { currencies: undefined, updated: undefined, live: false };
    const rates = cached?.rates;
    const merged = currencies.map((c) => {
      const live = rates?.[c.code];
      return c.perUGX === 1 || typeof live !== "number" || live <= 0 ? c : { ...c, perUGX: live };
    });
    const updated = cached ? new Date(cached.at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined;
    return { currencies: merged, updated, live: Boolean(rates) };
  }, [currencies, cached]);
}
