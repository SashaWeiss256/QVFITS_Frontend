/* Data Table - Powered natively by TanStack Table v8 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, MoreHorizontal, Search, SlidersHorizontal, X } from "lucide-react";

import Skeleton from "@/components/ui/Skeleton";
import { matchesSearch } from "@/utils/search";
import { cn } from "@/utils/cn";
import { readStored, writeStored } from "@/utils/storage";
import { downloadCsv } from "../lib/csv";
import { useUrlFilters } from "../lib/useUrlFilters";
import FilterDrawer from "./FilterDrawer";

// How many rows a page shows: small enough to scan, large enough that most
// lists fit on one or two pages. One choice for every table, remembered.
const PAGE_SIZES = [10, 25, 50, 100];
const SIZE_KEY = "qvfits:admin:rows";
const storedSize = () => {
  const n = readStored(SIZE_KEY, 25);
  return PAGE_SIZES.includes(n) ? n : 25;
};

// Search and each facet filter are hidden columns, so TanStack's own filtering
// does the work (one pipeline: filter, sort, page) and a row model is only
// rebuilt when its inputs really change.
const SEARCH = "__search";
const FACET = "__facet:";
const NONE = [];

// Sorting: empty values first, numbers by size, dates by time, text with
// numbers read as numbers ("Size 2" before "Size 10"), ignoring case and accents.
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const plain = (v) => (v instanceof Date ? v.getTime() : typeof v === "boolean" ? Number(v) : v);
const empty = (v) => v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v));
function compare(a, b) {
  const x = plain(a);
  const y = plain(b);
  const ex = empty(x);
  const ey = empty(y);
  if (ex || ey) return ex === ey ? 0 : ex ? -1 : 1;
  if (typeof x === "number" && typeof y === "number") return x - y;
  return collator.compare(String(x), String(y));
}

/** Page numbers to show: first, last, the current and its neighbours, with gaps as null. */
function pageList(index, count) {
  const keep = new Set([0, count - 1, index - 1, index, index + 1]);
  const pages = [...keep].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? [null, p] : [p]));
}

/**
 * Admin data table on TanStack Table v8: sorting, search, facet filters,
 * paging, row selection with bulk actions, a row menu and CSV export.
 *
 * How it stays correct:
 * - Everything flows through TanStack's pipeline. `rows` goes in untouched.
 * - The page only resets when the search, a filter or the sort changes, never
 *   because the parent re-rendered or a refetch handed over a fresh array, and
 *   it steps back if rows disappear from under it (the last one on a page was
 *   deleted).
 * - Selection counts only rows that are still in the list and still match, so a
 *   bulk action never touches something the admin can no longer see.
 * - Export is what is on screen: filtered and in the order it is sorted.
 */
export default function DataTable({
  rows = NONE,
  columns = NONE,
  rowKey = (r) => r.id,
  search,
  searchLabel = "Search",
  filters = NONE,
  bulkActions,
  rowActions,
  onRowClick,
  exportName,
  exportRow,
  toolbar,
  // The page's main action (Invite someone, Add…), last in the right-hand group so it ends the row.
  primaryAction,
  loading = false,
  empty: emptyText = "Nothing here yet.",
  initialSort,
  // Filters as ticked groups in a drawer, kept in the URL, with chips under the toolbar.
  filterDrawer = false,
  // Names a row for screen readers on its checkbox, e.g. (p) => p.name.
  rowLabel,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const urlFilters = useUrlFilters(filters.map((f) => f.id));
  const [sorting, setSorting] = useState(() => (initialSort ? [{ id: initialSort.key, desc: initialSort.dir === "desc" }] : []));
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState(() => ({ pageIndex: 0, pageSize: storedSize() }));
  const topRef = useRef(null);

  // The ticked values per filter: any number from the URL in drawer mode, one from a select otherwise.
  const drawerValues = urlFilters.values;
  const valuesOf = (f) => (filterDrawer ? (drawerValues[f.id] ?? NONE) : filterValues[f.id] ? [filterValues[f.id]] : NONE);
  const filterIds = filters.map((f) => f.id).join("|");
  const valueKey = JSON.stringify(filters.map((f) => valuesOf(f)));
  const activeCount = filters.reduce((n, f) => n + valuesOf(f).length, 0);

  // Within a group any ticked value matches, every group must: TanStack column filters.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columnFilters = useMemo(() => filters.map((f) => ({ id: FACET + f.id, value: valuesOf(f) })).filter((c) => c.value.length), [filterIds, valueKey]);
  const columnVisibility = useMemo(() => Object.fromEntries([[SEARCH, false], ...filterIds.split("|").filter(Boolean).map((id) => [FACET + id, false])]), [filterIds]);

  // Every word typed must be found, plural or singular, in any order (utils/search).
  // The page says what a row can be found by (`search`); without that, any text field will do.
  const textOf = useCallback((row) => (search ? search(row) : Object.values(row).join(" ")), [search]);
  const globalFilterFn = useCallback((row, _id, value) => matchesSearch(textOf(row.original), value), [textOf]);

  const tableColumns = useMemo(() => {
    const cols = [];

    // Optional checkbox column
    if (bulkActions) {
      cols.push({
        id: "__select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all on this page"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={rowLabel ? `Select ${rowLabel(row.original)}` : `Select row ${row.index + 1}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        meta: { isSelect: true, width: "w-10" },
      });
    }

    // Data columns. The accessor is a function so a key like "a.b" is not read as a path.
    columns.forEach((c) => {
      cols.push({
        id: c.key,
        accessorFn: (row) => row[c.key],
        header: c.label,
        cell: ({ row }) => (c.render ? c.render(row.original) : (row.original[c.key] ?? "")),
        enableSorting: Boolean(c.sort),
        enableGlobalFilter: false,
        sortingFn: c.sort ? (a, b) => compare(c.sort(a.original), c.sort(b.original)) : undefined,
        meta: { align: c.align },
      });
    });

    // Optional row menu
    if (rowActions) {
      cols.push({
        id: "__actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const acts = rowActions(row.original)?.filter((a) => !a.hidden) ?? [];
          return acts.length > 0 ? (
            <div className="text-right">
              <RowMenu actions={acts} />
            </div>
          ) : null;
        },
        meta: { isAction: true, align: "right", width: "w-12" },
      });
    }

    // Hidden: the search, and one column per filter, each running TanStack's filtering.
    cols.push({ id: SEARCH, accessorFn: (row) => row, enableSorting: false, enableGlobalFilter: true });
    filters.forEach((f) => {
      cols.push({
        id: FACET + f.id,
        accessorFn: (row) => row,
        enableSorting: false,
        enableGlobalFilter: false,
        filterFn: (row, _id, values) => values.some((v) => f.test(row.original, v)),
      });
    });

    return cols;
  }, [bulkActions, columns, rowActions, rowLabel, filters]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting, globalFilter, rowSelection, pagination, columnFilters, columnVisibility },
    getRowId: (row) => String(rowKey(row)),
    enableRowSelection: Boolean(bulkActions),
    enableMultiSort: false,
    // Reset by hand, only when the search, a filter or the sort changes (below).
    autoResetPageIndex: false,
    getColumnCanGlobalFilter: (column) => column.id === SEARCH,
    globalFilterFn,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    // The filters live in the URL or in a select, and come in through `state`.
    onColumnFiltersChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filtered = table.getFilteredRowModel().rows;
  const pageRows = table.getRowModel().rows;
  const { pageIndex, pageSize } = pagination;
  const pageCount = table.getPageCount();

  // A new search, filter or sort starts again from the first page.
  const fresh = useRef(true);
  useEffect(() => {
    if (fresh.current) {
      fresh.current = false;
      return;
    }
    setPagination((p) => (p.pageIndex ? { ...p, pageIndex: 0 } : p));
  }, [globalFilter, valueKey, sorting]);

  // Rows can vanish under the admin (the last one on a page deleted): step back a page.
  useEffect(() => {
    if (!loading && pageIndex > 0 && pageIndex >= pageCount) setPagination((p) => ({ ...p, pageIndex: Math.max(0, pageCount - 1) }));
  }, [pageIndex, pageCount, loading]);

  // Selection follows the list: rows deleted, or filtered out, are no longer selected.
  useEffect(() => {
    if (loading) return;
    setRowSelection((prev) => {
      const ids = Object.keys(prev);
      if (!ids.length) return prev;
      const live = table.getFilteredRowModel().rowsById;
      const next = Object.fromEntries(ids.filter((id) => live[id]).map((id) => [id, true]));
      return Object.keys(next).length === ids.length ? prev : next;
    });
    // `table` is stable; the model it reads changes with these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, globalFilter, valueKey, loading]);

  const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.id);
  const clearSelection = useCallback(() => setRowSelection({}), []);

  // How many rows each option would show, given the search and every other filter as they are.
  // Worked out only while the drawer is open, and kept for its closing animation.
  const countsRef = useRef({});
  const counts = useMemo(() => {
    if (!filterDrawer || !drawerOpen) return countsRef.current;
    const out = {};
    for (const f of filters) {
      const others = rows.filter(
        (row) => matchesSearch(textOf(row), globalFilter) && filters.every((g) => g.id === f.id || !valuesOf(g).length || valuesOf(g).some((v) => g.test(row, v))),
      );
      out[f.id] = Object.fromEntries(f.options.map((o) => [o.value, others.filter((row) => f.test(row, o.value)).length]));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDrawer, drawerOpen, rows, filterIds, valueKey, globalFilter, textOf]);
  countsRef.current = counts;
  const countOf = (f, value) => counts[f.id]?.[value] ?? 0;

  const activeChips = filterDrawer
    ? filters.flatMap((f) => valuesOf(f).map((v) => ({ f, v, label: f.options.find((o) => o.value === v)?.label ?? v })))
    : [];

  const changeSize = (n) => {
    writeStored(SIZE_KEY, n);
    setPagination({ pageIndex: 0, pageSize: n });
  };
  const goTo = (index) => {
    table.setPageIndex(index);
    topRef.current?.scrollIntoView({ block: "nearest" });
  };
  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min(filtered.length, (pageIndex + 1) * pageSize);

  const clearAll = () => {
    setGlobalFilter("");
    setFilterValues({});
    urlFilters.clear();
  };

  // What is on screen: filtered, and in the order it is sorted.
  const handleExport = () => {
    if (!exportRow) return;
    const sorted = table.getSortedRowModel().rows;
    if (!sorted.length) return;
    // An export can leave a row out by returning nothing (the newsletter exports confirmed subscribers only).
    downloadCsv(exportName ?? "export", sorted.map((r) => exportRow(r.original)).filter(Boolean));
  };

  // A click on a row opens it, unless it landed on a control, or the admin was selecting text.
  const rowClick = (row) => (e) => {
    const hit = e.target.closest("button,a,input,label,select,[role=menu]");
    // A menu is drawn in <body>, but React still bubbles its clicks through the row.
    if (hit && (e.currentTarget.contains(hit) || hit.matches("[role=menu]"))) return;
    if (window.getSelection()?.toString()) return;
    onRowClick(row.original);
  };
  const rowKeyDown = (row) => (e) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onRowClick(row.original);
    }
  };

  return (
    <div ref={topRef}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {search && (
          <label className="relative w-full sm:w-72">
            <span className="sr-only">{searchLabel}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4" aria-hidden="true" />
            <input
              className="input h-11 w-full rounded-r-pill py-0 pl-10"
              type="search"
              autoComplete="off"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`${searchLabel}…`}
            />
          </label>
        )}
        {toolbar}
        {/* The controls sit together on the right: the filters, rows per page, then Export. The
            search (and anything a page adds, via `toolbar`) stays on the left. */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {filterDrawer && filters.length > 0 && (
            <button type="button" className="btn btn--ghost h-11 min-h-0 px-4 text-[.85rem]" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
              {activeCount > 0 && <span className="min-w-5 rounded-r-pill bg-brand-500 px-1.5 text-center text-[.7rem] leading-5 text-white">{activeCount}</span>}
            </button>
          )}
          {!filterDrawer &&
            filters.map((f) => (
              <label key={f.id} className="min-w-[150px]">
                <span className="sr-only">{f.label}</span>
                <select
                  className="select h-11 w-full py-0"
                  value={filterValues[f.id] ?? ""}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.id]: e.target.value || undefined }))}
                >
                  <option value="">{f.label}: all</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          {rows.length > PAGE_SIZES[0] && (
            <label>
              <span className="sr-only">Rows per page</span>
              <select className="select h-11 w-auto py-0" value={pageSize} onChange={(e) => changeSize(Number(e.target.value))}>
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </label>
          )}
          {exportRow && (
            <button type="button" className="btn btn--ghost h-11 min-h-0 px-4 text-[.85rem]" onClick={handleExport} disabled={!filtered.length}>
              <Download className="h-4 w-4" aria-hidden="true" /> Export
            </button>
          )}
          {primaryAction}
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2" aria-label="Filters in use">
          {activeChips.map(({ f, v, label }) => (
            <button
              key={`${f.id}:${v}`}
              type="button"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-r-pill bg-cream-2 px-3 text-[.8rem] text-ink-2 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-600"
              onClick={() => urlFilters.setValues(f.id, valuesOf(f).filter((x) => x !== v))}
              aria-label={`Remove ${f.label}: ${label}`}
            >
              <span className="text-ink-4">{f.label}:</span> {label} <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="text-[.8rem] font-semibold text-brand-600 hover:underline" onClick={urlFilters.clear}>
            Clear all
          </button>
        </div>
      )}

      {filterDrawer && (
        <FilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          filters={filters}
          values={drawerValues}
          onChange={urlFilters.setValues}
          onClear={urlFilters.clear}
          countOf={countOf}
          resultCount={filtered.length}
        />
      )}

      {/* Bulk bar */}
      {Boolean(bulkActions) && selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-brand-50 px-3 py-2 text-sm" role="region" aria-label="Bulk actions">
          <strong className="mr-2">{selectedIds.length} selected</strong>
          {bulkActions(selectedIds, clearSelection)}
          <button type="button" className="ml-auto text-ink-3 underline hover:text-ink" onClick={clearSelection}>
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[.92rem]" aria-busy={loading}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-line">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta || {};
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className={cn("px-3 py-3", meta.width, meta.align === "right" && "text-right", !meta.isSelect && !meta.isAction && "eyebrow whitespace-nowrap")}
                      aria-sort={sortDir ? (sortDir === "asc" ? "ascending" : "descending") : isSortable ? "none" : undefined}
                    >
                      {header.isPlaceholder ? null : isSortable ? (
                        <button type="button" className="-my-2 inline-flex min-h-10 items-center gap-1 uppercase hover:text-ink" onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" && <ArrowUp className="h-3 w-3" aria-hidden="true" />}
                          {sortDir === "desc" && <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-b border-line">
                  <td colSpan={table.getVisibleLeafColumns().length || 1} className="px-3 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}

            {!loading &&
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-line transition-colors last:border-0 hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none",
                    onRowClick && "cursor-pointer",
                    row.getIsSelected() && "bg-brand-50",
                  )}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? rowClick(row) : undefined}
                  onKeyDown={onRowClick ? rowKeyDown(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta || {};
                    return (
                      <td key={cell.id} className={cn("px-3 py-3 align-middle", meta.align === "right" && "whitespace-nowrap text-right")}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && !filtered.length && (
          <div className="py-10 text-center text-ink-3">
            <p className="m-0">{rows.length ? "Nothing matches. Try another search or filter." : emptyText}</p>
            {rows.length > 0 && (globalFilter || activeCount > 0) && (
              <button type="button" className="mt-3 text-[.9rem] font-semibold text-brand-600 hover:underline" onClick={clearAll}>
                Clear search and filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Paging: always at the bottom, what is showing and where to go next. */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-3">
          <span aria-live="polite">
            Showing {firstRow} to {lastRow} of {filtered.length}
          </span>
          {pageCount > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pages">
              <button type="button" className="icon-btn" aria-label="First page" disabled={!table.getCanPreviousPage()} onClick={() => goTo(0)}>
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" className="icon-btn" aria-label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => goTo(pageIndex - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageList(pageIndex, pageCount).map((p, i) =>
                p === null ? (
                  <span key={`gap-${i}`} className="px-1 text-ink-4" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Page ${p + 1}`}
                    aria-current={p === pageIndex ? "page" : undefined}
                    onClick={() => goTo(p)}
                    className={cn(
                      "grid h-10 min-w-10 place-items-center rounded-[14px] px-2 text-sm font-semibold tabular-nums transition-colors duration-150",
                      p === pageIndex ? "bg-brand-500 text-white" : "text-ink-2 hover:bg-cream-2",
                    )}
                  >
                    {p + 1}
                  </button>
                ),
              )}
              <button type="button" className="icon-btn" aria-label="Next page" disabled={!table.getCanNextPage()} onClick={() => goTo(pageIndex + 1)}>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" className="icon-btn" aria-label="Last page" disabled={!table.getCanNextPage()} onClick={() => goTo(pageCount - 1)}>
                <ChevronsRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The row's "..." menu. The table sits in a scrolling box (overflow-x-auto),
 * and a box that scrolls on one axis clips on the other too, so a menu drawn
 * inside it was cut off at the table's edge. The menu is therefore drawn in
 * <body>, fixed to the screen at the button's position: nothing can clip it,
 * it opens upward when there is no room below, and it closes on scroll,
 * resize, Escape or a click anywhere else. Keyboard: the first item takes focus
 * on open, the arrow keys move between items, Escape closes and hands focus
 * back to the button.
 */
function RowMenu({ actions }) {
  const [at, setAt] = useState(null); // { right, top, up } while open
  const button = useRef(null);
  const menu = useRef(null);
  const close = useCallback(() => setAt(null), []);
  const open = at !== null;

  const toggle = () => {
    if (open) return close();
    const r = button.current.getBoundingClientRect();
    const height = actions.length * 42 + 8;
    const up = window.innerHeight - r.bottom < height + 12 && r.top > height + 12;
    setAt({ right: Math.max(8, window.innerWidth - r.right), top: up ? r.top - 4 : r.bottom + 4, up });
  };

  // Close on a click elsewhere, Escape, or anything that moves the button.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (menu.current?.contains(e.target) || button.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      close();
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, close]);

  // Focus the first item once the menu is on screen (without scrolling the page, which would close it).
  useEffect(() => {
    if (open) menu.current?.querySelector("[role=menuitem]")?.focus({ preventScroll: true });
  }, [open]);

  const onMenuKey = (e) => {
    const items = [...menu.current.querySelectorAll("[role=menuitem]")];
    const at = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus({ preventScroll: true });
    };
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") close();
  };

  if (!actions.length) return null;

  return (
    <div className="inline-block">
      <button ref={button} type="button" className="icon-btn" aria-label="Row actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          // Clicks stop here: the menu is not part of the row, even though React bubbles through it.
          <div
            ref={menu}
            role="menu"
            className="fixed z-[200] min-w-44 rounded-[14px] border border-line bg-white py-1 text-left shadow-sh-3"
            style={{ right: at.right, top: at.top, transform: at.up ? "translateY(-100%)" : undefined }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onMenuKey}
          >
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                role="menuitem"
                className={cn("block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none", a.danger && "text-warn hover:bg-warn/10 focus-visible:bg-warn/10")}
                onClick={() => {
                  close();
                  a.onClick();
                }}
              >
                {a.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
