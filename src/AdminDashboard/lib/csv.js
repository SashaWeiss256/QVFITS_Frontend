/* Csv Export */

/**
 * Rows to a CSV file the browser downloads: the newsletter list for an email
 * tool, orders for the accountant. Values are quoted so a comma or a line
 * break in a note never splits a column.
 */
export function toCsv(rows) {
  if (!rows.length) return "";
  // Every column any row has, in the order first seen, so a row with an extra field never loses it.
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v) => {
    let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join("; ") : String(v);
    // A cell that starts with = + - @ is read as a formula by Excel and Sheets, so a customer who
    // types =HYPERLINK(...) as their name cannot run it on the admin's machine. A plain negative number is left alone.
    if (/^[=+\-@\t\r]/.test(s) && !(typeof v === "number" && Number.isFinite(v))) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.map(cell).join(","), ...rows.map((r) => keys.map((k) => cell(r[k])).join(","))].join("\r\n");
}

export function downloadCsv(name, rows) {
  // The byte order mark makes Excel read the file as UTF-8, so names and accents survive.
  const blob = new Blob(["\uFEFF", toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  // Firefox only follows a link that is in the page; the address is freed after the download has started.
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
