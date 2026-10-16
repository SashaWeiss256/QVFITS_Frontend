/* Mock Collection Store */
import type { Id } from "../api/types";

/**
 * A small localStorage-backed table per collection, seeded from the JSON in
 * src/data.
 * Admin edits survive a reload, so the dashboard behaves like it will once
 * the API is live. Only services touch this; the UI never does.
 */

// Bump the version when seeds change shape, so stale browser copies are dropped.
const PREFIX = "qvfits:store:v3:";
const memory = new Map<string, unknown>();

function load<T>(key: string, seed: T): T {
  if (memory.has(key)) return memory.get(key) as T;
  let rows = seed;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw) rows = JSON.parse(raw) as T;
  } catch {
    // Unreadable storage falls back to the seed.
  }
  memory.set(key, rows);
  return rows;
}

function save<T>(key: string, rows: T) {
  memory.set(key, rows);
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // Storage full or blocked: the change lasts for this session only.
  }
}

/** A new row may bring its own id; otherwise one is minted. */
export type NewRow<T extends { id: Id }> = Omit<T, "id"> & { id?: Id };

export interface Collection<T extends { id: Id }> {
  list(): T[];
  get(id: Id): T | null;
  create(data: NewRow<T>): T;
  update(id: Id, patch: Partial<T>): T | null;
  remove(id: Id): void;
  /** Replace every row at once: a reorder, a bulk edit or an import. */
  replace(rows: T[]): void;
  reset(): void;
}

export function createCollection<T extends { id: Id }>(
  key: string,
  seed: readonly T[],
  { idPrefix = "id" }: { idPrefix?: string } = {},
): Collection<T> {
  const rows = () => load<T[]>(key, [...seed]);

  return {
    list: () => [...rows()],
    get: (id) => rows().find((r) => String(r.id) === String(id)) ?? null,
    create: (data) => {
      const row = { ...data, id: data.id || `${idPrefix}_${Date.now().toString(36)}` } as T;
      save(key, [row, ...rows()]);
      return row;
    },
    update: (id, patch) => {
      let updated: T | null = null;
      save(key, rows().map((r) => {
        if (String(r.id) !== String(id)) return r;
        updated = { ...r, ...patch, id: r.id };
        return updated;
      }));
      return updated;
    },
    remove: (id) => save(key, rows().filter((r) => String(r.id) !== String(id))),
    replace: (next) => save(key, [...next]),
    reset: () => save(key, [...seed]),
  };
}

/** One level deep: each section of a settings document can be patched alone. */
export type DocumentPatch<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> | T[K] : T[K] };

export interface SettingsDocument<T extends object> {
  get(): T;
  update(patch: DocumentPatch<T>): T;
  reset(): void;
}

/**
 * A single settings document (shop settings, home page, offers) instead of a table. `update`
 * merges one level deep, so saving one section never wipes another.
 */
export function createDocument<T extends object>(key: string, seed: T): SettingsDocument<T> {
  const read = () => load<T>(key, seed);
  return {
    get: () => structuredClone(read()),
    update: (patch) => {
      const current = read() as Record<string, unknown>;
      const next: Record<string, unknown> = { ...current };
      for (const [k, v] of Object.entries(patch)) {
        next[k] = v && typeof v === "object" && !Array.isArray(v) ? { ...(current[k] as object), ...v } : v;
      }
      save(key, next);
      return structuredClone(next) as T;
    },
    reset: () => save(key, seed),
  };
}
