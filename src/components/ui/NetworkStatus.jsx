/* Network Status */
import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Sparkles, WifiOff, X } from "lucide-react";

import { dismiss, noticeStore } from "@/store/tanstackStore/notices";

const ICONS = { success: CircleCheck, error: CircleAlert, info: Sparkles };

const subscribeOnline = (fn) => onlineManager.subscribe(fn);
const isOnline = () => onlineManager.isOnline();

/**
 * One live region for the whole app, drawn as Quivogue's toasts: an offline
 * line while queries are paused, "couldn't refresh" notices, failed saves,
 * and confirmations ("Added to your bag", "Product deleted").
 */
export default function NetworkStatus() {
  const online = useSyncExternalStore(subscribeOnline, isOnline, () => true);
  const notices = useSyncExternalStore(noticeStore.subscribe, noticeStore.getSnapshot, noticeStore.getSnapshot);

  return (
    <div role="status" aria-live="polite" className="toasts">
      {!online && (
        <p className="toast m-0">
          <WifiOff className="h-[18px] w-[18px]" aria-hidden="true" />
          You&apos;re offline. Showing saved data; it will refresh when you reconnect.
        </p>
      )}
      {notices.map((n) => {
        const Icon = ICONS[n.tone] ?? Sparkles;
        return (
          <p key={n.id} className="toast m-0">
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="flex-1">{n.message}</span>
            <button type="button" onClick={() => dismiss(n.id)} aria-label="Dismiss" className="icon-btn -mr-3 h-9 w-9">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </p>
        );
      })}
    </div>
  );
}
