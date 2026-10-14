/* Legal Blocks */

// A section's content: paragraphs (strings), { list: [...] } or
// { table: { head, rows } }. Plain text only, so nothing can inject markup.
export default function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    if (typeof b === "string") return <p key={i} className="text-ink-2">{b}</p>;
    if (b.list) {
      return (
        <ul key={i} className="mb-4 flex list-disc flex-col gap-1.5 pl-5 text-ink-2 marker:text-brand-400">
          {b.list.map((item) => <li key={item}>{item}</li>)}
        </ul>
      );
    }
    if (b.table) {
      return (
        <div key={i} className="mb-4 overflow-x-auto rounded-r-md border border-line bg-white">
          <table className="w-full min-w-[28rem] text-left text-[.92rem]">
            <thead className="bg-cream-2">
              <tr>{b.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.table.rows.map((row) => (
                <tr key={row[0]} className="border-t border-line align-top">
                  {row.map((cell, c) => <td key={c} className={c === 0 ? "px-4 py-3 font-semibold" : "px-4 py-3 text-ink-2"}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  });
}
