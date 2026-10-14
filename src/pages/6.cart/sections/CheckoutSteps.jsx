/* Checkout Steps */
import { Check } from "lucide-react";

import { cn } from "@/utils/cn";

const STEPS = ["Your bag", "Delivery", "Confirm"];

// Bag (/cart), then delivery and confirm (/checkout).
export default function CheckoutSteps({ at }) {
  return (
    <ol className="steps m-0 list-none p-0" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        return (
          <li key={label} className={cn("step", n === at && "is-on", n < at && "is-done")} aria-current={n === at ? "step" : undefined}>
            <b>{n < at ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}</b> {label}
          </li>
        );
      })}
    </ol>
  );
}
