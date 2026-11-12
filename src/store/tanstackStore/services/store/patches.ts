/* Row And Patch Types */
import type { Id } from "../api/types";

/** A new row may bring its own id; otherwise the API makes one. */
export type NewRow<T extends { id: Id }> = Omit<T, "id"> & { id?: Id };

/** A partial update: nested objects may be sent in part. */
export type DocumentPatch<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> | T[K] : T[K] };
