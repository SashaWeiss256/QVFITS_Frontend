/* Admin Crud Over Http */
import { http } from "../api/client";
import type { Id, RequestOptions } from "../api/types";
import { logActivity } from "../admin/activityApi";

/**
 * List, create, update, remove and reorder for one admin table on the API.
 * The API checks permissions and the rules; each change is written to the
 * activity log here once the API has accepted it.
 *
 *   export const colorsCrud = httpCrud<Color>(routes.adminCatalog.colors, { module: "categories", noun: "colour", label: (c) => c.name });
 */
export function httpCrud<T extends { id: Id }>(path: string, { module, noun, label }: { module: string; noun: string; label: (row: T) => string }) {
  const ADMIN = { realm: "admin" } as const;
  return {
    list: ({ signal }: RequestOptions = {}) => http.get<T[]>(path, { ...ADMIN, signal }),

    async create(data: Partial<T>) {
      const row = await http.post<T>(path, data, ADMIN);
      logActivity({ module, action: "create", entityId: row.id, summary: `Added ${noun} ${label(row)}` });
      return row;
    },

    async update(id: Id, patch: Partial<T>) {
      const row = await http.patch<T>(`${path}/${id}`, patch, ADMIN);
      logActivity({ module, action: "update", entityId: id, summary: `Updated ${noun} ${label(row)}` });
      return row;
    },

    async remove(id: Id) {
      await http.del(`${path}/${id}`, ADMIN);
      logActivity({ module, action: "delete", entityId: id, summary: `Deleted ${noun} ${id}` });
    },

    /** Save a new order: ids first to last. Rows not listed keep their place after. */
    async reorder(ids: Id[]) {
      await http.post(`${path}/reorder`, { ids }, ADMIN);
      logActivity({ module, action: "update", summary: `Reordered ${noun}s` });
    },
  };
}
