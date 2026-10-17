/* Send Order (from Quivogue cart.html step 3) */
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import PaymentDue from "@/components/storefront/PaymentDue";
import { useCurrency } from "@/store/context/CurrencyContext";
import { notify } from "@/store/tanstackStore/notices";
import { usePaymentMethods } from "@/store/tanstackStore/queries/site";
import { zoneEta, zoneOf } from "@/utils/delivery";
import { whatsappLink } from "@/utils/whatsapp";
import { orderMessage } from "../orderMessage";

/**
 * After the order is placed: its reference, and the order sent to the team
 * on WhatsApp or Instagram. Instagram DMs can't be pre-filled from a link,
 * so the text goes on the clipboard on the way out.
 */
export default function SendOrder({ order, settings }) {
  const currency = useCurrency();
  const { data: methods = [] } = usePaymentMethods();
  const zone = zoneOf(settings, order.region);
  const eta = zoneEta(zone);
  const message = orderMessage(order, { ...currency, settings, methods });
  const copy = async (quiet) => {
    try {
      await navigator.clipboard.writeText(message);
      if (!quiet) notify("Order copied. Paste it into your message.", { tone: "success" });
    } catch {
      if (!quiet) notify("Select the details above and copy them.");
    }
  };

  return (
    <div className="info-card">
      <p className="pill-note"><Check className="h-4 w-4" aria-hidden="true" /> Order placed</p>
      <h2 className="sub-h mt-4 mb-1.5">Your reference is {order.ref}</h2>
      <p className="text-[.9rem] text-ink-3">Send it to the team and they&apos;ll confirm stock, total and payment with you. Quote your reference and they can find your order instantly.</p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <a className="btn btn--primary" href={whatsappLink(settings.whatsapp, message)} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>
        <a className="btn btn--ghost" href={settings.instagram} target="_blank" rel="noopener noreferrer" onClick={() => { copy(true); notify("Order copied to your clipboard too.", { tone: "success" }); }}>Send via Instagram DM</a>
        <button type="button" className="btn btn--soft" onClick={() => copy(false)}>Copy order</button>
      </div>
      {eta && <p className="m-0 mt-4 text-sm text-ink-2">{zone.collect ? `${eta} from the showroom, once paid.` : `Arrives in ${eta.toLowerCase()} once paid.`}</p>}
      <PaymentDue order={order} />
      <p className="mt-5 text-sm text-ink-3">
        Track it any time on <Link to="/track-order" className="text-brand-600 underline">Track an order</Link>.
      </p>
    </div>
  );
}
