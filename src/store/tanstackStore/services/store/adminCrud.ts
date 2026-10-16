/* Admin Crud Factory */
import { ApiError, mockApi } from "../api/mock";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";
import { assertCan } from "../auth/adminSession";
import type { Collection, NewRow } from "./collectionStore";

/**
 * List, create, update, remove and reorder for one admin table, each checked
 * against the signed-in admin's permissions and written to the activity log.
 * A resource is one line instead of five near-identical functions:
 *
 *   export const colorsCrud = adminCrud(colors, { module: "attributes", noun: "colour", label: (c) => c.name });
 */
export interface CrudOptions<T> {
  /** The permission module, as in src/data/permissions.json. */
  module: string;
  /** One row in a log line: "colour" → "Added colour Teal". */
  noun: string;
  label: (row: T) => string;
  /** Normalise or validate a row before it is saved. */
  prepare?: (data: Partial<T>, existing: T | null, all: T[]) => Partial<T>;
  /** Refuse a delete that would break something, e.g. a category still in use. */
  beforeRemove?: (row: T) => void;
}

export function adminCrud<T extends { id: Id }>(table: Collection<T>, options: CrudOptions<T>) {
  const { module, noun, label, prepare = (d) => d, beforeRemove } = options;

  const find = (id: Id) => {
    const row = table.get(id);
    if (!row) throw new ApiError(`That ${noun} no longer exists.`, 404);
    return row;
  };

  return {
    list: ({ signal }: RequestOptions = {}) => mockApi(() => table.list(), 150, signal),

    create: (data: NewRow<T>) =>
      mockApi(() => {
        assertCan(module, "edit");
        const row = table.create(prepare(data as Partial<T>, null, table.list()) as NewRow<T>);
        logActivity({ module, action: "create", entityId: row.id, summary: `Added ${noun} ${label(row)}` });
        return row;
      }),

    update: (id: Id, patch: Partial<T>) =>
      mockApi(() => {
        assertCan(module, "edit");
        const existing = find(id);
        const row = table.update(id, prepare(patch, existing, table.list()))!;
        logActivity({ module, action: "update", entityId: id, summary: `Updated ${noun} ${label(row)}` });
        return row;
      }),

    remove: (id: Id) =>
      mockApi(() => {
        assertCan(module, "delete");
        const row = find(id);
        beforeRemove?.(row);
        table.remove(id);
        logActivity({ module, action: "delete", entityId: id, summary: `Deleted ${noun} ${label(row)}` });
      }),

    /** Save a new order: ids first to last. Rows not listed keep their place after. */
    reorder: (ids: Id[]) =>
      mockApi(() => {
        assertCan(module, "edit");
        const rows = table.list();
        const byId = new Map(rows.map((r) => [String(r.id), r]));
        const ordered = ids.map((id) => byId.get(String(id))).filter((r): r is T => Boolean(r));
        const rest = rows.filter((r) => !ids.map(String).includes(String(r.id)));
        table.replace([...ordered, ...rest].map((r, position) => ({ ...r, position })));
        logActivity({ module, action: "update", summary: `Reordered ${noun}s` });
      }),
  };
}

export type Crud<T extends { id: Id }> = ReturnType<typeof adminCrud<T>>;

/** Rows in the order the admin set, for any table with a `position`. */
export function byPosition<T extends { position?: number }>(rows: T[]) {
  return [...rows].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}
