/* Checkout Steps */
import { Check } from "lucide-react";

import { usePageCopy } from "@/store/tanstackStore/queries/site";
import { cn } from "@/utils/cn";
import { t } from "@/i18n/translate";

// Bag (/cart), then delivery and confirm (/checkout).
export default function Steps({ at }) {
  const { data: copy } = usePageCopy("checkout");
  const steps = copy?.steps ?? [];
  return (
    // A row of numbers on one hairline: finished ones in brand, the current one in ink.
    // On a phone only the numbers show.
    <ol className="m-0 mb-[clamp(28px,4vw,48px)] flex list-none items-center p-0 text-[0.88rem] text-ink-4" aria-label={t("Checkout progress")}>
      {steps.map((label, i) => {
        const n = i + 1;
        const on = n === at;
        const done = n < at;
        return (
          // Past steps show a tick, the current one is marked for screen readers.
          <li
            key={label}
            className={cn(
              "flex flex-1 items-center gap-2.5 whitespace-nowrap last:flex-none max-sm:gap-0 max-sm:text-[0px]",
              "after:mx-3.5 after:h-px after:flex-1 after:bg-line-2 after:content-[''] last:after:hidden max-sm:after:mx-2",
              on && "font-medium text-ink",
              done && "text-ink-2",
            )}
            aria-current={on ? "step" : undefined}
          >
            <b
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border border-line-2 bg-cream text-[0.8rem] font-medium",
                on && "border-ink bg-ink text-cream",
                done && "border-brand-200 bg-brand-50 text-brand-600",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
            </b>{" "}
            {label}
          </li>
        );
      })}
    </ol>
  );
}
