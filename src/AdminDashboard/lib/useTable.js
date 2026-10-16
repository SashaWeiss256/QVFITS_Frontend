/* Table State */
import { useMemo, useState } from "react";

/**
 * Search, filters, sort, paging and selection for one admin table, all in
 * memory. With the API the same state becomes the list query's params, so a
 * page never changes shape when the catalogue grows past a few hundred rows.
 */
export function useTable(rows, { search, filters = [], columns = [], pageSize = 20, rowKey = (r) => r.id, initialSort = null }) {
  const [q, setQ] = useState("");
  const [values, setValues] = useState({});
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => (!needle || !search || search(r).toLowerCase().includes(needle)) &&
      filters.every((f) => !values[f.id] || f.test(r, values[f.id])));
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sort) {
      const dir = sort.dir === "desc" ? -1 : 1;
      list = [...list].sort((a, b) => {
        const x = col.sort(a), y = col.sort(b);
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * dir;
      });
    }
    return list;
  }, [rows, q, values, sort, search, filters, columns]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const at = Math.min(page, pages - 1);
  const pageRows = shown.slice(at * pageSize, at * pageSize + pageSize);
  const ids = new Set(rows.map(rowKey));
  const picked = selected.filter((id) => ids.has(id));

  return {
    q,
    setQ: (v) => { setQ(v); setPage(0); },
    values,
    setFilter: (id, v) => { setValues((s) => ({ ...s, [id]: v })); setPage(0); },
    sort,
    toggleSort: (key) => setSort((s) => (s?.key === key ? (s.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" })),
    page: at,
    pages,
    setPage,
    shown,
    pageRows,
    selected: picked,
    isSelected: (id) => picked.includes(id),
    toggle: (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    toggleAll: () => {
      const all = pageRows.map(rowKey);
      setSelected((s) => (all.every((id) => s.includes(id)) ? s.filter((id) => !all.includes(id)) : [...new Set([...s, ...all])]));
    },
    clearSelection: () => setSelected([]),
  };
}
