/* Email Preview */
import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

import { useCurrency } from "@/store/context/CurrencyContext";
import { useSettings } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

// What a code is worth, in words a shopper reads: "10% off" or "UGX 20,000 off", plus any minimum spend.
function codeOffer(d, money) {
  if (!d) return "";
  const off = d.type === "percent" ? `${d.value}% off` : `${money(d.value)} off`;
  return d.minSpend ? `${off} orders over ${money(d.minSpend)}` : `${off} your order`;
}

/**
 * A live picture of an email as it will land: the inbox line (sender and
 * subject), then the message with the shop's logo, heading, text, the code in
 * a dashed box, a button, and the footer with the address and the unsubscribe
 * link every email carries. Updates as the admin types. Desktop or phone width.
 * It is a drawing of the email, not the mail itself: the sent copy is plain
 * text until an email service is connected (see the Outbox).
 */
export default function EmailPreview({ subject, heading, body, code, button = "Shop the new drop" }) {
  const [phone, setPhone] = useState(false);
  const { data: s } = useSettings();
  const { moneyBase } = useCurrency();
  const offer = codeOffer(code, moneyBase);

  return (
    <div>
      {/* Width switch */}
      <div className="mb-3 inline-flex rounded-r-pill bg-cream-2 p-1" role="radiogroup" aria-label="Preview width">
        {[{ id: false, label: "Desktop", icon: Monitor }, { id: true, label: "Phone", icon: Smartphone }].map((v) => (
          <button key={v.label} type="button" role="radio" aria-checked={phone === v.id} onClick={() => setPhone(v.id)}
            className={cn("inline-flex min-h-9 items-center gap-2 rounded-r-pill px-4 text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-brand-300", phone === v.id ? "bg-white text-brand-600 shadow-sh-1" : "text-ink-3 hover:text-ink")}>
            <v.icon className="h-4 w-4" aria-hidden="true" /> {v.label}
          </button>
        ))}
      </div>

      <div className="rounded-r-lg bg-cream-2 p-4">
        <div className={cn("mx-auto overflow-hidden rounded-r-md bg-white shadow-sh-1 transition-[max-width] duration-300", phone ? "max-w-[320px]" : "max-w-[560px]")}>
          {/* Inbox line: who it is from and the subject, as the recipient first sees it */}
          <div className="border-b border-line px-5 py-3.5">
            <p className="m-0 text-[.78rem] text-ink-4">From <strong className="font-semibold text-ink-2">QVFITS</strong></p>
            <p className="m-0 mt-0.5 truncate text-[.95rem] font-semibold">{subject || <span className="text-ink-4">No subject yet</span>}</p>
          </div>

          {/* The message */}
          <div className="px-6 pb-7 pt-6 text-center">
            <img src="/logo/qvfits-logo-stacked.svg" alt="" width="64" height="64" className="mx-auto h-14 w-14" />
            <h3 className="m-0 mt-5 font-display text-[1.45rem] leading-tight tracking-tight">{heading || <span className="text-ink-4">Heading</span>}</h3>
            <p className="mx-auto mb-0 mt-3 max-w-[40ch] whitespace-pre-line text-[.95rem] leading-relaxed text-ink-2">{body || <span className="text-ink-4">Your message appears here.</span>}</p>

            {/* The code, when one is chosen */}
            {code && (
              <div className="mx-auto mt-6 max-w-[320px] rounded-r-lg border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-4">
                <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-brand-600">Your code</p>
                <p className="m-0 mt-1 font-display text-[1.6rem] font-bold tracking-[0.08em] text-brand-600">{code.code}</p>
                <p className="m-0 mt-1 text-[.82rem] text-ink-3">{offer}</p>
              </div>
            )}

            <span className="mt-6 inline-block rounded-full bg-[image:var(--brand-grad)] px-7 py-3 text-[.9rem] font-semibold text-white">{button}</span>
          </div>

          {/* Footer: where the shop is, and the unsubscribe link every email must carry */}
          <div className="border-t border-line bg-cream px-6 py-4 text-center text-[.74rem] leading-relaxed text-ink-4">
            {s?.address && <p className="m-0">QVFITS, {s.address}</p>}
            <p className="m-0 mt-1">You are getting this because you joined our list. <span className="underline">Unsubscribe</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
