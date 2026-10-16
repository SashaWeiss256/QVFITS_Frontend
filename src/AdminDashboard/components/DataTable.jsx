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
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, MoreHorizontal, Search } from "lucide-react";

import Skeleton from "@/components/ui/Skeleton";
import { useClickOutside } from "@/utils/useClickOutside";
import { cn } from "@/utils/cn";
import { downloadCsv } from "../lib/csv";

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
  pageSize = 20,
  loading = false,
  empty = "Nothing here yet.",
  initialSort,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [sorting, setSorting] = useState(
    initialSort ? [{ id: initialSort.key, desc: initialSort.dir === "desc" }] : []
  );
  const [rowSelection, setRowSelection] = useState({});

  // Filter rows by facet dropdowns before passing to TanStack Table
  const filteredData = useMemo(() => {
    if (!filters.length) return rows;
    return rows.filter((row) =>
      filters.every((f) => !filterValues[f.id] || f.test(row, filterValues[f.id]))
    );
  }, [rows, filters, filterValues]);

  // Global search filter function using custom search predicate if provided
  const globalFilterFn = useCallback(
    (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const needle = String(filterValue).trim().toLowerCase();
      if (!needle) return true;
      if (search) {
        return search(row.original).toLowerCase().includes(needle);
      }
      return Object.values(row.original).some((val) =>
        String(val ?? "").toLowerCase().includes(needle)
      );
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

  const handleExport = () => {
    if (!exportRow || !totalFilteredRows.length) return;
    const flatRows = totalFilteredRows.map((r) => exportRow(r.original));
    downloadCsv(exportName ?? "export", flatRows);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {search && (
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">{searchLabel}</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-4"
              aria-hidden="true"
            />
            <input
              className="input w-full pl-9"
              type="search"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`${searchLabel}…`}
            />
          </label>
        )}
        {filters.map((f) => (
          <label key={f.id} className="min-w-[150px]">
            <span className="sr-only">{f.label}</span>
            <select
              className="input w-full"
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
        {toolbar}
        {exportRow && (
          <button
            type="button"
            className="btn btn--ghost min-h-11 px-4 text-[.85rem]"
            onClick={handleExport}
            disabled={!totalFilteredRows.length}
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Export
          </button>
        )}
      </div>

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

      {/* Paging */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-3">
          <span>
            {totalFilteredRows.length} rows · page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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
