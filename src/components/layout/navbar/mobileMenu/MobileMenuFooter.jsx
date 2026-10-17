/* Mobile Menu Footer */
import { ArrowUpRight, Globe } from "lucide-react";

import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { whatsappLink } from "@/utils/whatsapp";

// Currency (moved here from the phone header, which is too narrow for it) and a WhatsApp row.
export default function MobileMenuFooter() {
  const { data: s } = useSettings();
  const { currency, currencies, setCurrency } = useCurrency();

  return (
    <div className="mmenu__foot">
      {/* Currency: only when the admin has added a second one. The strip swipes, so any number fits. */}
      {currencies.length > 1 && (
        <div className="mmenu__cur" role="group" aria-label="Show prices in">
          <span className="mmenu__curlabel"><Globe className="h-4 w-4" aria-hidden="true" />Show prices in</span>
          <div className="mmenu__curs">
            {currencies.map((c) => (
              <button key={c.code} type="button" aria-pressed={c.code === currency.code} className={cn(c.code === currency.code && "is-on")} onClick={() => setCurrency(c.code)}>{c.code}</button>
            ))}
          </div>
        </div>
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
