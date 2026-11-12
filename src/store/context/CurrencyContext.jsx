/* Currency Context */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useSettings } from "@/store/tanstackStore/queries/site";
import { readStored, writeStored } from "@/utils/storage";
import { formatIn } from "@/utils/formatCurrency";
import { useLiveRates } from "@/utils/liveRates";

const CurrencyContext = createContext(null);
const KEY = "qvfits:currency";
const UGX = { code: "UGX", label: "Uganda Shilling", perUGX: 1, decimals: 0, display: "code" };

/**
 * Display currency only. Every price underneath is UGX, and an order is
 * always quoted and charged in UGX whatever is on screen.
 */
export function CurrencyProvider({ children }) {
  const { data: settings } = useSettings();
  const [code, setCode] = useState(() => readStored(KEY, "UGX"));

  // Rates refresh by themselves (utils/liveRates); the ones in Settings are the fallback.
  const live = useLiveRates(settings?.currencies);
  const currencies = useMemo(() => live.currencies ?? [UGX], [live.currencies]);
  const active = currencies.find((c) => c.code === code) ?? currencies[0] ?? UGX;

  const choose = useCallback((next) => {
    setCode(next);
    writeStored(KEY, next);
  }, []);

  const value = useMemo(
    () => ({
      currency: active,
      currencies,
      ratesUpdated: live.updated ?? settings?.ratesUpdated,
      ratesAreLive: live.live,
      setCurrency: choose,
      /** A UGX amount in the visitor's chosen currency. */
      money: (ugx) => formatIn(active, ugx),
      /** Always UGX, for anything that is a promise of a price (orders, WhatsApp). */
      moneyBase: (ugx) => formatIn(UGX, ugx),
    }),
    [active, currencies, live.updated, live.live, settings, choose],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
}
