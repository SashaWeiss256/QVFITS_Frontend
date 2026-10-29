/* Order Confirmed Page */
import { Link, useParams } from "react-router-dom";

import PageIntro from "@/components/layout/PageIntro";
import { t } from "@/i18n/translate";

// Shown after checkout with the order reference the shopper quotes.
export default function OrderConfirmedPage() {
  // The reference comes from the URL, so this page survives a refresh.
  const { ref } = useParams();
  return (
    <PageIntro kicker="Thank you" title={t("Order received")} noindex lede={`Your reference is ${ref}. We'll confirm on WhatsApp.`} center>
      <div className="flex flex-wrap justify-center gap-3">
        <Link className="btn btn--primary btn--lg" to={`/track-order?ref=${encodeURIComponent(ref ?? "")}`}>{t("Track this order")}</Link>
        <Link className="btn btn--ghost btn--lg" to="/shop">{t("Keep shopping")}</Link>
      </div>
    </PageIntro>
  );
}
