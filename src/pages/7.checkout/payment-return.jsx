/* Payment Return Page */
import { Fragment } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import PageIntro from "@/components/layout/PageIntro";
import { useCurrency } from "@/store/context/CurrencyContext";
import { usePayAgain, usePaymentStatus, useSettings } from "@/store/tanstackStore/queries/site";
import { whatsappLink } from "@/utils/whatsapp";
import { t } from "@/i18n/translate";

/**
 * Where Pesapal sends the shopper back to, as
 * /order/:ref/payment?OrderTrackingId=…&OrderMerchantReference=…. The API asks
 * Pesapal where the payment stands (this page never decides it), and the page
 * asks again every few seconds while it is still waiting: a mobile money
 * prompt can take a moment to be approved. A payment that didn't go through
 * can be tried again from here.
 */
export default function PaymentReturnPage() {
  const { ref } = useParams();
  const [params] = useSearchParams();
  const trackingId = params.get("OrderTrackingId") ?? "";
  const status = usePaymentStatus(ref, trackingId);
  const pay = usePayAgain();
  const { data: settings } = useSettings();
  const { moneyBase } = useCurrency();
  const view = status.data;
  const order = view?.order;

  const track = (
    <Link className="btn btn--ghost btn--lg" to={`/track-order?ref=${encodeURIComponent(ref ?? "")}`}>{t("Track this order")}</Link>
  );
  const whatsapp = settings?.whatsapp && (
    <a className="btn btn--ghost btn--lg" href={whatsappLink(settings.whatsapp, `Hi QVFITS! I'm paying for order ${ref} and need a hand.`)} target="_blank" rel="noopener noreferrer">{t("Message us on WhatsApp")}</a>
  );
  const payAgain = (label) => (
    <button type="button" className="btn btn--primary btn--lg" disabled={pay.isPending || pay.isSuccess} onClick={() => pay.mutate({ ref, trackingId })}>
      {pay.isPending || pay.isSuccess ? "Opening the payment page…" : label}
    </button>
  );
  const actions = (...buttons) => (
    <div>
      <div className="flex flex-wrap gap-3 sm:justify-center">{buttons.filter(Boolean).map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>
      {pay.error && <p role="alert" className="mt-4 text-sm font-semibold text-warn sm:text-center">{pay.error.message}</p>}
    </div>
  );

  // Arrived without Pesapal's tracking id (an old or edited link): nothing to check.
  if (!trackingId || status.error) {
    return (
      <PageIntro kicker="Payment" title="We couldn't find that payment" noindex center lede={`If you paid, it will show on order ${ref} shortly. Track it with the phone number you ordered with, or message us.`}>
        {actions(track, whatsapp)}
      </PageIntro>
    );
  }

  if (!view) {
    return (
      <PageIntro kicker="Payment" title="Checking your payment" noindex center lede="One moment while we hear back from Pesapal.">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" aria-label="Checking" />
      </PageIntro>
    );
  }

  if (view.status === "succeeded") {
    return view.paid ? (
      <PageIntro kicker="Thank you" title="Payment received" noindex center lede={`Order ${ref} is paid${order ? `: ${moneyBase(order.total)}` : ""}. We'll get it ready and keep you posted.`}>
        {actions(track, <Link className="btn btn--primary btn--lg" to="/shop">{t("Keep shopping")}</Link>)}
      </PageIntro>
    ) : (
      <PageIntro kicker="Thank you" title="Part of it is paid" noindex center lede={`Your payment came in, and order ${ref} still has a balance to pay.`}>
        {actions(payAgain("Pay the balance"), track)}
      </PageIntro>
    );
  }

  if (view.status === "pending") {
    // Still asking every few seconds; once that stops, the shopper can ask again.
    const asking = status.isFetching || status.isRefetching;
    return (
      <PageIntro kicker="Payment" title="Waiting for your payment" noindex center lede="If you paid by mobile money, approve the prompt on your phone. This page updates by itself once it comes through.">
        <div className="grid gap-6">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" aria-hidden="true" />
          {actions(
            <button type="button" className="btn btn--soft btn--lg" disabled={asking} onClick={() => status.refetch()}>{asking ? "Checking…" : "Check again"}</button>,
            track,
          )}
        </div>
      </PageIntro>
    );
  }

  // Failed, abandoned or reversed. A cancelled order can't be paid any more.
  const cancelled = order?.status === "cancelled";
  const why = view.status === "reversed" ? "Pesapal reversed this payment, so it no longer counts. " : `${view.reason ? `${view.reason}. ` : ""}Nothing was taken. `;
  return (
    <PageIntro
      kicker="Payment"
      title="Your payment didn't go through"
      noindex
      center
      lede={
        cancelled
          ? `Order ${ref} was cancelled, so it can't be paid any more. You're welcome to order again.`
          : `${why}Your order ${ref} is still held for you, so you can try again.`
      }
    >
      {actions(!cancelled && payAgain("Try paying again"), whatsapp, track)}
    </PageIntro>
  );
}
