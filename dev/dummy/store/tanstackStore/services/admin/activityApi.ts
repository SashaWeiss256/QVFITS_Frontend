/* Activity Log Service (realm: admin) */
import { mockApi } from "../api/mock";
import type { RequestOptions } from "../api/types";
import { assertCan, sessionAdmin } from "../auth/adminSession";
import { createCollection } from "../store/collectionStore";
import type { ActivityEntry } from "../types";
import activitySeed from "@/data/activity.json";

/**
 * Who changed what, and when. Every admin write records one line here
 * through `logActivity`; the API writes the same rows on the server.
 */
const activity = createCollection<ActivityEntry>("activity", activitySeed as unknown as ActivityEntry[], { idPrefix: "act" });

// Enough history to be useful without filling the browser's storage.
const KEEP = 500;

export function logActivity(entry: Pick<ActivityEntry, "module" | "action" | "summary"> & { entityId?: ActivityEntry["entityId"] }) {
  const admin = sessionAdmin();
  activity.create({
    actorId: admin?.id ?? null,
    actorName: admin?.name ?? "The shop",
    entityId: entry.entityId ?? null,
    module: entry.module,
    action: entry.action,
    summary: entry.summary,
    at: new Date().toISOString(),
  });
  const rows = activity.list();
  if (rows.length > KEEP) activity.replace(rows.slice(0, KEEP));
}

export function listActivity({ signal }: RequestOptions = {}) {
  return mockApi(() => {
    assertCan("activity", "view");
    return activity.list();
  }, 150, signal);
}
