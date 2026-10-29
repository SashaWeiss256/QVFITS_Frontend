/* Summary Row */
import { cn } from "@/utils/cn";

// A label and an amount on one line; the total sits larger, under a hairline.
export default function SummaryRow({ total = false, className, children }) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4 py-[7px] text-[0.94rem] text-ink-2 tabular-nums [&>span:last-child]:text-right",
        total && "mt-2.5 border-t border-line-2 pt-4 font-display text-[1.2rem] font-normal tracking-normal text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
