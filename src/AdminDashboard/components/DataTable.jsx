/* Data Table - Powered natively by TanStack Table v8 */
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useClickOutside } from "@/utils/useClickOutside";
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

/** Page numbers to show: first, last, the current and its neighbours, with gaps as null. */
function pageList(index, count) {
  const keep = new Set([0, count - 1, index - 1, index, index + 1]);
  const pages = [...keep].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? [null, p] : [p]));
}

/**
 * Enterprise Admin Data Table powered by TanStack Table v8.
 * Features: Headless sorting, global search, facet filters, pagination,
 * row selection with bulk actions, contextual row menu, and CSV export.
 */
export default function DataTable({
  rows = [],
  columns = [],
  rowKey = (r) => r.id,
  search,
  searchLabel = "Search",
  filters = [],
  bulkActions,
  rowActions,
  onRowClick,
  exportName,
  exportRow,
  toolbar,
  // The page's main action (Invite someone, Add…), last in the right-hand group so it ends the row.
  primaryAction,
  loading = false,
  empty = "Nothing here yet.",
  initialSort,
  // Filters as ticked groups in a drawer, kept in the URL, with chips under the toolbar.
  filterDrawer = false,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const urlFilters = useUrlFilters(filters.map((f) => f.id));
  const [sorting, setSorting] = useState(
    initialSort ? [{ id: initialSort.key, desc: initialSort.dir === "desc" }] : []
  );
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(storedSize);
  const topRef = useRef(null);

  // Filter rows before passing to TanStack Table. Drawer mode: any ticked value
  // within a group matches, every group must. Inline mode: one value per select.
  const drawerValues = urlFilters.values;
  const passes = useCallback(
    (row, skip) =>
      filters.every((f) => {
        if (f.id === skip) return true;
        if (filterDrawer) {
          const vals = drawerValues[f.id] ?? [];
          return !vals.length || vals.some((v) => f.test(row, v));
        }
        return !filterValues[f.id] || f.test(row, filterValues[f.id]);
      }),
    [filters, filterDrawer, drawerValues, filterValues],
  );
  const filteredData = useMemo(() => (filters.length ? rows.filter((row) => passes(row)) : rows), [rows, filters, passes]);
  // How many rows an option would show, given every other group as it is.
  const countOf = (f, value) => rows.filter((row) => passes(row, f.id) && f.test(row, value)).length;
  const activeChips = filterDrawer
    ? filters.flatMap((f) => (drawerValues[f.id] ?? []).map((v) => ({ f, v, label: f.options.find((o) => o.value === v)?.label ?? v })))
    : [];

  // Global search filter function using custom search predicate if provided
  const globalFilterFn = useCallback(
    (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      // The page says what a row can be found by (search); without that, any text field will do.
      // Every word typed must be found, plural or singular, in any order (utils/search).
      return matchesSearch(search ? search(row.original) : Object.values(row.original).join(" "), filterValue);
    },
    [search]
  );

  // Map incoming column definitions to TanStack Table ColumnDef
  const tableColumns = useMemo(() => {
    const cols = [];

    // Optional Checkbox Selection Column
    if (bulkActions) {
      cols.push({
        id: "__select",
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all on this page"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Select row"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        meta: { isSelect: true, width: "w-10" },
      });
    }

    // Data Columns
    columns.forEach((c) => {
      cols.push({
        id: c.key,
        accessorKey: c.key,
        header: c.label,
        cell: ({ row }) => (c.render ? c.render(row.original) : row.original[c.key]),
        enableSorting: Boolean(c.sort),
        sortingFn: c.sort
          ? (rowA, rowB) => {
              const valA = c.sort(rowA.original);
              const valB = c.sort(rowB.original);
              if (typeof valA === "number" && typeof valB === "number") {
                return valA - valB;
              }
              return String(valA ?? "").localeCompare(String(valB ?? ""));
            }
          : undefined,
        meta: { align: c.align },
      });
    });

    // Optional Actions Column
    if (rowActions) {
      cols.push({
        id: "__actions",
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

    return cols;
  }, [bulkActions, columns, rowActions]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    getRowId: (row) => String(rowKey(row)),
    enableRowSelection: Boolean(bulkActions),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  );

  const clearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const totalFilteredRows = table.getFilteredRowModel().rows;
  const pageRows = table.getRowModel().rows;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const changeSize = (n) => {
    setPageSize(n);
    writeStored(SIZE_KEY, n);
    table.setPageSize(n);
    table.setPageIndex(0);
  };
  const goTo = (index) => {
    table.setPageIndex(index);
    topRef.current?.scrollIntoView({ block: "nearest" });
  };
  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min(totalFilteredRows.length, (pageIndex + 1) * pageSize);

  const handleExport = () => {
    if (!exportRow || !totalFilteredRows.length) return;
    // An export can leave a row out by returning nothing (the newsletter exports confirmed subscribers only).
    const flatRows = totalFilteredRows.map((r) => exportRow(r.original)).filter(Boolean);
    downloadCsv(exportName ?? "export", flatRows);
  };

  return (
    <div ref={topRef}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {search && (
          <label className="relative w-full sm:w-72">
            <span className="sr-only">{searchLabel}</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <input
              className="input h-11 w-full rounded-r-pill py-0 pl-10"
              type="search"
              value={globalFilter ?? ""}
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
              {activeChips.length > 0 && <span className="min-w-5 rounded-r-pill bg-brand-500 px-1.5 text-center text-[.7rem] leading-5 text-white">{activeChips.length}</span>}
            </button>
          )}
          {!filterDrawer && filters.map((f) => (
            <label key={f.id} className="min-w-[150px]">
              <span className="sr-only">{f.label}</span>
              <select
                className="select h-11 w-full py-0"
                value={filterValues[f.id] ?? ""}
                onChange={(e) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    [f.id]: e.target.value || undefined,
                  }))
                }
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
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
              </select>
            </label>
          )}
          {exportRow && (
            <button
              type="button"
              className="btn btn--ghost h-11 min-h-0 px-4 text-[.85rem]"
              onClick={handleExport}
              disabled={!totalFilteredRows.length}
            >
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
              onClick={() => urlFilters.setValues(f.id, (drawerValues[f.id] ?? []).filter((x) => x !== v))}
              aria-label={`Remove ${f.label}: ${label}`}
            >
              <span className="text-ink-4">{f.label}:</span> {label} <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="text-[.8rem] font-semibold text-brand-600 hover:underline" onClick={urlFilters.clear}>Clear all</button>
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
          resultCount={filteredData.length}
        />
      )}

      {/* Bulk bar */}
      {Boolean(bulkActions) && selectedIds.length > 0 && (
        <div
          className="mb-3 flex flex-wrap items-center gap-2 rounded-r-md bg-brand-50 px-3 py-2 text-sm"
          role="region"
          aria-label="Bulk actions"
        >
          <strong className="mr-2">{selectedIds.length} selected</strong>
          {bulkActions(selectedIds, clearSelection)}
          <button
            type="button"
            className="ml-auto text-ink-3 underline hover:text-ink-1"
            onClick={clearSelection}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[.92rem]">
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
                      className={cn(
                        "px-3 py-3",
                        meta.width,
                        meta.align === "right" && "text-right",
                        !meta.isSelect && !meta.isAction && "eyebrow whitespace-nowrap"
                      )}
                      aria-sort={
                        sortDir ? (sortDir === "asc" ? "ascending" : "descending") : undefined
                      }
                    >
                      {header.isPlaceholder ? null : isSortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 uppercase hover:text-ink-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
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
                  <td colSpan={columns.length + (bulkActions ? 1 : 0) + (rowActions ? 1 : 0)} className="px-3 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}

            {!loading &&
              pageRows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-line last:border-0 hover:bg-brand-50 transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-brand-50"
                    )}
                    onClick={
                      onRowClick
                        ? (e) =>
                            !e.target.closest("button,a,input,label,select") &&
                            onRowClick(row.original)
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta || {};
                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            "px-3 py-3 align-middle",
                            meta.align === "right" && "text-right whitespace-nowrap"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>

        {!loading && !totalFilteredRows.length && (
          <p className="m-0 py-10 text-center text-ink-3">
            {rows.length ? "Nothing matches. Try another search or filter." : empty}
          </p>
        )}
      </div>

      {/* Paging: always at the bottom, what is showing and where to go next. */}
      {totalFilteredRows.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-3">
          <span aria-live="polite">
            Showing {firstRow} to {lastRow} of {totalFilteredRows.length}
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
                  <span key={`gap-${i}`} className="px-1 text-ink-4" aria-hidden="true">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Page ${p + 1}`}
                    aria-current={p === pageIndex ? "page" : undefined}
                    onClick={() => goTo(p)}
                    className={cn(
                      "grid h-10 min-w-10 place-items-center rounded-r-md px-2 text-sm font-semibold tabular-nums transition-colors duration-150",
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

function RowMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);
  if (!actions.length) return null;

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Row actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-1 min-w-44 rounded-r-md border border-line bg-white py-1 text-left shadow-sh-3"
          role="menu"
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              role="menuitem"
              className={cn(
                "block w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors",
                a.danger && "text-warn hover:bg-warn/10"
              )}
              onClick={() => {
                setOpen(false);
                a.onClick();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
