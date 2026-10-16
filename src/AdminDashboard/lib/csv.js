/* Csv Export */

/**
 * Rows to a CSV file the browser downloads: the newsletter list for an email
 * tool, orders for the accountant. Values are quoted so a comma or a line
 * break in a note never splits a column.
 */
export function toCsv(rows) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const cell = (v) => {
    const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => cell(r[k])).join(","))].join("\n");
}

export function downloadCsv(name, rows) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** A CSV file the admin picked, as rows keyed by its header line. */
export async function readCsv(file) {
  const text = await file.text();
  const lines = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); lines.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); lines.push(row); }
  const [head = [], ...body] = lines.filter((l) => l.some((c) => c.trim()));
  return body.map((cells) => Object.fromEntries(head.map((h, i) => [h.trim(), (cells[i] ?? "").trim()])));
}
