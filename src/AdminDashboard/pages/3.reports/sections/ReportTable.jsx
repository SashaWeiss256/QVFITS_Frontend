/* Report Table */
import { cn } from "@/utils/cn";

// Money and counts line up on the right.
const RIGHT = new Set(["money", "num"]);

/** One report as a plain table with a totals row for money and counts. */
export default function ReportTable({ columns, rows, loading, money }) {
  if (loading) return <div className="grid gap-2 p-5">{[0, 1, 2, 3].map((i) => <span key={i} className="skel block h-9 rounded-r-md" aria-hidden="true" />)}</div>;
  if (!rows.length) return <p className="m-0 p-8 text-center text-sm text-ink-3">Nothing in this period yet.</p>;

  // How a cell is written: money in the shown currency, a yes for a true flag, anything else as it is.
  const show = (kind, v) => (kind === "money" ? money(v ?? 0) : kind === "bool" ? (v ? "Yes" : "") : v);
  // Totals make sense for money and counts, not for a list of customers' first orders.
  const totals = Object.fromEntries(columns.filter(([, , kind]) => RIGHT.has(kind)).map(([key]) => [key, rows.reduce((n, r) => n + (Number(r[key]) || 0), 0)]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        {/* Column Headings */}
        <thead>
          <tr className="text-[.7rem] uppercase tracking-[0.14em] text-ink-4">
            {columns.map(([key, header, kind]) => (
              <th key={key} scope="col" className={cn("px-4 py-3 font-semibold first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", RIGHT.has(kind) ? "text-right" : "text-left")}>{header}</th>
            ))}
          </tr>
        </thead>
        {/* Rows */}
        <tbody className="divide-y divide-line border-t border-line">
          {rows.map((r, i) => (
            <tr key={i} className="transition-colors duration-150 hover:bg-cream">
              {columns.map(([key, , kind], j) => (
                <td key={key} className={cn("px-4 py-2.5 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", RIGHT.has(kind) && "text-right tabular-nums", j === 0 && "font-semibold")}>{show(kind, r[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* Totals: only money and counts add up */}
        <tfoot>
          <tr className="border-t-2 border-line-2 font-bold">
            {columns.map(([key, , kind], j) => (
              <td key={key} className={cn("px-4 py-3 first:pl-5 last:pr-5 sm:first:pl-6 sm:last:pr-6", RIGHT.has(kind) && "text-right tabular-nums")}>
                {j === 0 ? "Total" : key in totals ? show(kind, totals[key]) : ""}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
