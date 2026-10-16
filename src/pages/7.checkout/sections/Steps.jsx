/* Checkout Steps */
import { Check } from "lucide-react";

import { usePageCopy } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";

// Bag (/cart), then delivery and confirm (/checkout).
export default function Steps({ at }) {
  const { data: copy } = usePageCopy("checkout");
  const steps = copy?.steps ?? [];
  return (
    <ol className="steps m-0 list-none p-0" aria-label="Checkout progress">
      {steps.map((label, i) => {
        const n = i + 1;
        return (
          // Past steps show a tick, the current one is marked for screen readers.
          <li key={label} className={cn("step", n === at && "is-on", n < at && "is-done")} aria-current={n === at ? "step" : undefined}>
            <b>{n < at ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}</b> {label}
          </li>
        );
      })}
    </ol>
  );
}
