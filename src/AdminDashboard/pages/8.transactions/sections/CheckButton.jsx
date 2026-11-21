/* Check Button */
import { RefreshCw } from "lucide-react";

import { useCheckTransaction } from "@/store/tanstackStore/queries/admin";
import { cn } from "@/utils/cn";

/**
 * Asks the payment gateway about this payment now (after artistry360's
 * CheckPaymentButton). If it went through, its order is marked paid; the
 * answer shows as a notice and the lists refresh.
 */
export default function CheckButton({ reference }) {
  const check = useCheckTransaction();
  return (
    <button
      type="button"
      // Inside a clickable row: checking must not also open the order.
      onClick={(e) => {
        e.stopPropagation();
        check.mutate(reference);
      }}
      disabled={check.isPending}
      title="Ask the payment gateway about this payment now"
      className="inline-flex min-h-8 items-center gap-1.5 rounded-r-pill border border-line px-2.5 text-xs font-semibold text-ink-2 transition-colors duration-200 hover:bg-cream-2 disabled:cursor-wait disabled:opacity-60"
    >
      <RefreshCw className={cn("h-3.5 w-3.5", check.isPending && "animate-spin")} aria-hidden="true" />
      {check.isPending ? "Checking…" : "Check"}
    </button>
  );
}
