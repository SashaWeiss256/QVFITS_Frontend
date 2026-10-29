/* Mobile Menu Footer */
import { ChevronDown } from "lucide-react";

import { useLocale } from "@/i18n/LocaleProvider";
import { t } from "@/i18n/translate";
import { useCurrency } from "@/store/context/CurrencyContext";

// Currency (the phone header is too narrow for it) and a WhatsApp row.
export default function MobileMenuFooter() {
  const { currency, currencies, setCurrency } = useCurrency();
  const { lang, languages, setLang } = useLocale();

  return (
    <div className="shrink-0 border-t border-line px-5 py-3">
      {/* Language and currency, side by side: native menus, so the phone's own picker opens */}
      <div className="grid grid-cols-2 gap-2">
        <label className="relative flex min-h-11 items-center rounded-full border border-line bg-white ps-4 pe-9 text-[0.9rem]">
          <span className="sr-only">{t("Language")}</span>
          <select className="w-full appearance-none bg-transparent font-medium text-ink outline-none" value={lang} onChange={(e) => setLang(e.target.value)}>
            {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 h-4 w-4 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
        </label>
        {currencies.length > 1 && (
          <label className="relative flex min-h-11 items-center rounded-full border border-line bg-white ps-4 pe-9 text-[0.9rem]">
            <span className="sr-only">{t("Prices in")}</span>
            <select className="w-full appearance-none bg-transparent font-medium text-ink outline-none" value={currency.code} onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 h-4 w-4 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
          </label>
        )}
      </div>
    </div>
  );
}
