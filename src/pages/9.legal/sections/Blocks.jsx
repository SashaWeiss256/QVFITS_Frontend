/* Blocks */

// A section's content: paragraphs (strings), { list: [...] } or
// { table: { head, rows } }. Plain text only, so nothing can inject markup.
// Set like a well-made document: generous leading, hairline rules, no boxes.
export default function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    // Paragraph
    if (typeof b === "string") return <p key={i} className="mb-5 text-[1rem] leading-[1.75] text-ink-2">{b}</p>;

    // List: a short purple dash before each item
    if (b.list) {
      return (
        <ul key={i} className="mb-6 flex flex-col gap-3">
          {b.list.map((item) => (
            <li key={item} className="relative pl-6 text-[1rem] leading-[1.7] text-ink-2 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-brand-600">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    // Table: hairlines only
    if (b.table) {
      return (
        <div key={i} className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-t border-ink text-left text-[0.95rem]">
            <thead>
              <tr className="border-b border-line">
                {b.table.head.map((h) => <th key={h} scope="col" className="py-3 pr-6 text-[0.82rem] font-medium text-ink-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((row) => (
                // The first cell names the row, so it doubles as the key.
                <tr key={row[0]} className="border-b border-line align-top">
                  {row.map((cell, c) => <td key={c} className={c === 0 ? "py-4 pr-6 font-display text-[1.05rem] text-ink" : "py-4 pr-6 text-ink-2"}>{cell}</td>)}
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
