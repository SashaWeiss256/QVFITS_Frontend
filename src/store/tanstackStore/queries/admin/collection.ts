/* Admin Collections And Documents */
import { useCallback } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

import type { Id, RequestOptions } from "../../services/api/types";
import { adminRoot, siteRoot } from "../keys";

type ListFn<T> = (options: RequestOptions) => Promise<T[]>;

/** A service's crud (services/store/adminCrud) as a resource, in one line. */
export function crudResource<T extends { id: Id }>(
  name: string,
  crud: { list: ListFn<T>; create: (d: never) => Promise<unknown>; update: (id: Id, d: never) => Promise<unknown>; remove: (id: Id) => Promise<unknown>; reorder?: (ids: Id[]) => Promise<unknown> },
  { noun, label, list, alsoInvalidates }: { noun: string; label?: string; list?: ListFn<T>; alsoInvalidates?: readonly QueryKey[] },
): CollectionResource<T, Partial<T>, Partial<T>> {
  return {
    queries: collectionQueries<T>(name, list ?? crud.list, { label: label ?? `${noun.toLowerCase()}s` }),
    create: crud.create as (d: Partial<T>) => Promise<unknown>,
    update: crud.update as (id: Id, d: Partial<T>) => Promise<unknown>,
    remove: crud.remove,
    reorder: crud.reorder,
    alsoInvalidates: alsoInvalidates ?? [siteRoot],
    noun,
  };
}
type GetFn<T> = (options: RequestOptions) => Promise<T>;

/** Keys and the list query for one admin table: ["admin", name, "list"]. */
export function collectionQueries<T>(name: string, list: ListFn<T>, extra: { staleTime?: number; label?: string } = {}) {
  const all = () => [...adminRoot, name] as const;
  return {
    all,
    list: () =>
      queryOptions({
        queryKey: [...all(), "list"] as const,
        queryFn: ({ signal }) => list({ signal }),
        staleTime: extra.staleTime,
        meta: { label: extra.label ?? name },
      }),
  };
}

/** Keys and the query for one settings document: ["admin", name]. */
export function documentQueries<T>(name: string, get: GetFn<T>, label = name) {
  const all = () => [...adminRoot, name] as const;
  return {
    all,
    doc: () => queryOptions({ queryKey: all(), queryFn: ({ signal }) => get({ signal }), meta: { label } }),
  };
}

export type CollectionQueries<T> = ReturnType<typeof collectionQueries<T>>;
export type DocumentQueries<T> = ReturnType<typeof documentQueries<T>>;

/** An admin table: its queries, its writes, and anything else a write changes. */
export interface CollectionResource<T, C = unknown, U = unknown> {
  queries: CollectionQueries<T>;
  create?: (data: C) => Promise<unknown>;
  update?: (id: Id, data: U) => Promise<unknown>;
  remove?: (id: Id) => Promise<unknown>;
  /** Saves a new order, ids first to last. */
  reorder?: (ids: Id[]) => Promise<unknown>;
  /** Other keys a write here makes stale, e.g. the public timetable. */
  alsoInvalidates?: readonly QueryKey[];
  /** The page shows write errors itself (e.g. inline); skip the app-wide notice. */
  handlesErrors?: boolean;
  /** One row, for the confirmations: "Category" → "Category added / updated / deleted". */
  noun: string;
}

export interface DocumentResource<T, P = Partial<T>> {
  queries: DocumentQueries<T>;
  update: (patch: P) => Promise<unknown>;
  /** The confirmation after a save, e.g. "Settings saved". */
  saved: string;
  /** Other keys a save makes stale, e.g. the storefront's copy. */
  alsoInvalidates?: readonly QueryKey[];
}

/**
 * List plus create / update / remove for one admin resource. Every write
 * names what it changes (meta.invalidates) and the query client refetches it,
 * so a module never patches its own copy of the rows, and each write ends in
 * a confirmation ("Category deleted"). The returned functions
 * are stable, so table column definitions can depend on them.
 *
 *   const products = useCollection(productsResource);
 *   products.items; await products.create(values);
 */
export function useCollection<T, C, U>(resource: CollectionResource<T, C, U>) {
  const { queries, create, update, remove, reorder, alsoInvalidates = [], handlesErrors = false, noun } = resource;
  const query = useQuery(queries.list());
  const meta = { invalidates: [queries.all(), ...alsoInvalidates], handlesErrors };

  const createM = useMutation({ mutationFn: (data: C) => create!(data), meta: { ...meta, success: `${noun} added` } });
  const updateM = useMutation({ mutationFn: ({ id, data }: { id: Id; data: U }) => update!(id, data), meta: { ...meta, success: `${noun} updated` } });
  const removeM = useMutation({ mutationFn: (id: Id) => remove!(id), meta: { ...meta, success: `${noun} deleted` } });
  const reorderM = useMutation({ mutationFn: (ids: Id[]) => reorder!(ids), meta: { ...meta, success: "Order saved" } });

  const { mutateAsync: updateAsync } = updateM;
  const updateFn = useCallback((id: Id, data: U) => updateAsync({ id, data }), [updateAsync]);

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: createM.mutateAsync,
    update: updateFn,
    remove: removeM.mutateAsync,
    reorder: reorderM.mutateAsync,
    isSaving: createM.isPending || updateM.isPending || reorderM.isPending,
    isRemoving: removeM.isPending,
  };
}

/**
 * One settings document: read it, and save a patch. Saves run one after
 * another (mutation scope), so two quick saves can never land out of order.
 */
export function useDocument<T, P>(resource: DocumentResource<T, P>) {
  const queryClient = useQueryClient();
  const options = resource.queries.doc();
  const query = useQuery(options);
  const save = useMutation({
    mutationFn: resource.update,
    scope: { id: options.queryKey.join(":") },
    meta: { success: resource.saved, invalidates: [options.queryKey, ...(resource.alsoInvalidates ?? [])] },
    onSuccess: (doc) => queryClient.setQueryData(options.queryKey, doc as T),
  });
  return { data: query.data, isLoading: query.isLoading, save: save.mutateAsync, isSaving: save.isPending };
}
