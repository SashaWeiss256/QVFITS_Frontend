/* Cache Notices */

/**
 * Short messages for the whole app: the cache's "Couldn't refresh the
 * catalogue" (info), a failed save (error), and an admin write's confirmation,
 * e.g. "Category deleted" (success). A plain external store, read by components/ui/NetworkStatus
 * with useSyncExternalStore, so the query client never imports React UI.
 */

export type NoticeTone = "info" | "success" | "error";

export interface Notice {
  id: number;
  message: string;
  tone: NoticeTone;
}

let notices: Notice[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function notify(message: string, { tone = "info", ttl = tone === "success" ? 3500 : 6000 }: { tone?: NoticeTone; ttl?: number } = {}) {
  // One notice per message: five failed refreshes are one problem, not five.
  if (notices.some((n) => n.message === message)) return;
  const notice = { id: nextId++, message, tone };
  notices = [...notices, notice];
  emit();
  setTimeout(() => dismiss(notice.id), ttl);
}

export function dismiss(id: number) {
  notices = notices.filter((n) => n.id !== id);
  emit();
}

export const noticeStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot: () => notices,
};
