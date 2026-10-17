/* Payment Due */
import { useState } from "react";
import { Clock } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { usePaymentMethods, useSettings } from "@/store/tanstackStore/queries/site";
import { formatDateTime } from "@/utils/format";

/**
 * How to pay an unpaid order (gap O6): the amount in UGX (what is charged,
 * whatever currency the shop is shown in), the chosen method's steps, the
 * reference to quote, and when the pieces stop being held (gap S1). A
 * shopper may also cancel it here while nothing is paid (gap O1).
 */
export default function PaymentDue({ order, onCancel, cancelling = false }) {
  const { moneyBase, money, currency } = useCurrency();
  const { data: methods = [] } = usePaymentMethods();
  const { data: settings } = useSettings();
  const [asked, setAsked] = useState(false);
  if (!order || order.status !== "pending" || order.paymentStatus !== "unpaid") return null;

  // The payment method the shopper picked, for its instructions.
  const method = methods.find((m) => m.id === order.payment);
  // When the unpaid hold ends: the order's time plus the hours set in Settings.
  const until = new Date(Date.parse(order.createdAt) + (settings?.unpaidHoldHours ?? 48) * 3_600_000).toISOString();

  {/* Payment Due: the amount in Ugandan shillings (what is charged), whatever currency the shop is shown in */}
  return (
    <section className="mt-5 rounded-r-md border border-brand-100 bg-brand-50/60 p-4" aria-label="Payment">
      <p className="m-0 text-[.72rem] font-semibold uppercase tracking-[0.14em] text-brand-600">Awaiting payment</p>
      {/* Amount: the shown currency appears in small print only when it isn't shillings */}
      <p className="m-0 mt-1 text-[1.05rem] font-bold">
        {moneyBase(order.total)}
        {currency?.code !== "UGX" && <span className="ml-2 text-sm font-normal text-ink-3">about {money(order.total)}</span>}
      </p>
      <p className="m-0 mt-2 text-sm text-ink-2">
        {method ? `${method.label}. ${method.instructions}` : "Pay by mobile money or at the showroom."} Quote <strong>{order.ref}</strong> as the reference so we can match it.
      </p>
      {/* Hold: pieces are kept until this time, then the order cancels itself */}
      <p className="m-0 mt-2 flex items-center gap-1.5 text-[.82rem] text-ink-3">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Your pieces are held until {formatDateTime(until)}. Unpaid by then, the order cancels itself.
      </p>
      {/* Cancel: offered where the shopper may cancel (their account, or tracking with the phone number) */}
      {onCancel && (
        <div className="mt-3">
          {asked ? (
            <span className="flex flex-wrap items-center gap-2 text-sm">
              Cancel this order?
              <button type="button" className="btn btn--danger min-h-9 px-3 text-xs" disabled={cancelling} onClick={onCancel}>Yes, cancel it</button>
              <button type="button" className="btn btn--ghost min-h-9 px-3 text-xs" onClick={() => setAsked(false)}>Keep it</button>
            </span>
          ) : (
            <button type="button" className="text-sm font-semibold text-warn underline" onClick={() => setAsked(true)}>Cancel this order</button>
          )}
        </div>
      )}
      {/* WhatsApp nudge for shoppers who have already paid */}
      {settings?.whatsapp && <p className="m-0 mt-2 text-xs text-ink-3">Paid already? Send the confirmation on WhatsApp and we'll mark it.</p>}
    </section>
  );
}
