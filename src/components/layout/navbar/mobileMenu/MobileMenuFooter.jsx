/* Mobile Menu Footer */
import { ArrowUpRight, ChevronDown, Globe } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";

// Currency (moved here from the phone header, which is too narrow for it) and a WhatsApp row.
export default function MobileMenuFooter() {
  const { data: s } = useSettings();
  const { currency, currencies, setCurrency } = useCurrency();

  return (
    <div className="mmenu__foot">
      {/* Currency: only when the admin has added a second one. A native menu, so the phone's own picker opens and any number of currencies fits. */}
      {currencies.length > 1 && (
        <label className="mmenu__cur">
          <span className="mmenu__curlabel"><Globe className="h-[18px] w-[18px]" aria-hidden="true" />Prices in</span>
          <span className="mmenu__sel">
            <select value={currency.code} onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.label}</option>)}
            </select>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </label>
      )}
      {/* Contact details come from settings; render nothing until they load. */}
      {s && (
        <a className="mmenu__wa" href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">
          <span className="mmenu__waicon"><WhatsAppIcon className="h-5 w-5" /></span>
          <span className="flex-1"><b className="block text-[.95rem]">Chat with us</b><span className="block text-[.8rem] opacity-75">on WhatsApp</span></span>
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
