/* Payment Mark */
import { useState } from "react";

import { AirtelIcon, MastercardIcon, VisaIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";

// One way to pay, shown as its logo on a small white tile. Airtel, Visa,
// Mastercard and WhatsApp come from the bundled brand marks. MTN Mobile Money
// has no mark in that set, so its tile uses the official logo file saved at
// /payment/mtn-momo.png and shows the name until that file is added.
const FILE = { mtn: "/payment/mtn-momo.png" };

function Mark({ id, name }) {
  const [broken, setBroken] = useState(false);
  if (id === "airtel") return <AirtelIcon className="h-7 w-7 text-[#e40000]" />;
  if (id === "card") return (
    <span className="flex items-center gap-2.5">
      <VisaIcon className="h-7 w-12 text-[#1a1f71]" />
      <MastercardIcon className="h-7 w-7 text-[#eb001b]" />
    </span>
  );
  if (id === "whatsapp") return (
    <span className="flex items-center gap-1.5">
      <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
      <span className="text-[0.78rem] font-medium text-ink-2">WhatsApp</span>
    </span>
  );
  if (FILE[id] && !broken) return <img src={FILE[id]} alt="" className="h-8 w-8 rounded-[8px] object-cover" loading="lazy" onError={() => setBroken(true)} />;
  return <span className="text-[0.78rem] font-medium text-ink-2">{name}</span>;
}

export default function PaymentMark({ method }) {
  return (
    <span
      className="inline-flex h-10 min-w-[64px] items-center justify-center rounded-[12px] border border-line bg-white px-3.5 shadow-[0_1px_2px_rgb(23_33_31/0.05),0_4px_10px_rgb(23_33_31/0.05)]"
      title={method.label}
      role="img"
      aria-label={method.label}
    >
      <Mark id={method.id} name={method.short} />
    </span>
  );
}
