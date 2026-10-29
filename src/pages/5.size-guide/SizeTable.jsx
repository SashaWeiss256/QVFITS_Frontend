/* Size Table */

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

export default function SizeTable({ children }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className={TABLE}>{children}</table>
    </div>
  );
}
