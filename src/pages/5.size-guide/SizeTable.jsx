/* Size Table */
import { cn } from "@/utils/cn";

// Hairlines only and a sand header; it scrolls sideways on a phone instead of
// squashing the columns. Cells are styled from the table, so rows stay plain.
const TABLE = [
  "w-full min-w-[560px] border-collapse text-[0.93rem] tabular-nums",
  "[&_td]:border-b [&_td]:border-line [&_td]:px-[18px] [&_td]:py-3.5 [&_td]:text-left",
  "[&_th]:border-b [&_th]:border-line [&_th]:px-[18px] [&_th]:py-3.5 [&_th]:text-left",
  "[&_thead_th]:whitespace-nowrap [&_thead_th]:bg-sand-100 [&_thead_th]:font-display [&_thead_th]:text-[0.84rem] [&_thead_th]:font-semibold [&_thead_th]:tracking-normal [&_thead_th]:text-ink",
  "[&_tbody_th]:font-display [&_tbody_th]:font-semibold [&_tbody_th]:tracking-normal [&_tbody_th]:text-ink",
  "[&_tbody_tr:hover]:bg-sand-50 [&_tbody_tr:last-child>*]:border-b-0",
].join(" ");

// A chart of numbers: every cell on one line, and on a phone the first column stays put while the rest
// scrolls sideways under it.
const CHART = cn(
  "[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap",
  "max-sm:[&_tr>:first-child]:sticky max-sm:[&_tr>:first-child]:left-0 max-sm:[&_tr>:first-child]:z-[1]",
  "max-sm:[&_tbody_th]:bg-white max-sm:[&_tbody_tr:hover_th]:bg-sand-50 max-sm:[&_tr>:first-child]:shadow-[1px_0_0_var(--color-line)]",
);

export default function SizeTable({ chart = false, className, children }) {
  return (
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto border border-line bg-white">
        <table className={cn(TABLE, chart && CHART)}>{children}</table>
      </div>
      {/* On a phone a soft fade at the right edge says there is more to scroll to */}
      <span className="pointer-events-none absolute inset-y-px right-px w-10 bg-linear-to-l from-white to-transparent sm:hidden" aria-hidden="true" />
    </div>
  );
}
