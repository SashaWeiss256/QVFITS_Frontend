/* Admin Table */

/**
 * A plain, readable table: `columns` = [{ key, label, render?, align? }].
 * Wide tables scroll inside their panel, never the page.
 */
export default function AdminTable({ columns, rows, rowKey = (r) => r.id, empty = "Nothing here yet." }) {
  if (!rows.length) return <p className="m-0 py-8 text-center text-ink-3">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[.92rem]">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`eyebrow px-3 py-3 ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-0 hover:bg-brand-50">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-3 ${c.align === "right" ? "text-right" : ""}`}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
