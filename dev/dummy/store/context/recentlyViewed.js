/* Recently Viewed */
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { saveRecentlyViewed } from "@/store/tanstackStore/services/customers/customersApi";
import { readStored, writeStored } from "@/utils/storage";
import { useCustomerAuth } from "./CustomerAuthContext";

const KEY = "qvfits:recent";
const MAX = 12;

// One list for the whole tab, so every component sees the same pieces.
const listeners = new Set();
let ids = readStored(KEY, []);

// The list is kept to the newest 12 and saved on this device every time it changes.
function set(next) {
  ids = next.slice(0, MAX);
  writeStored(KEY, ids);
  listeners.forEach((l) => l());
}

// Lets useSyncExternalStore re-render every component that shows the list when it changes.
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => ids;

/**
 * The pieces a shopper looked at lately, newest first. Kept on this device;
 * signed in, it joins the account's list and follows them to other devices.
 */
export function useRecentlyViewed() {
  const { customer } = useCustomerAuth();
  const list = useSyncExternalStore(subscribe, snapshot, snapshot);
  const customerId = customer?.id;

  // At sign-in, the account's pieces join this device's (device first, as newer).
  const account = customer?.recentlyViewed;
  useEffect(() => {
    if (account?.length) set([...new Set([...ids, ...account])]);
  }, [account]);

  const record = useCallback(
    (id) => {
      if (ids[0] === id) return;
      set([id, ...ids.filter((x) => x !== id)]);
      if (customerId) saveRecentlyViewed(customerId, ids).catch(() => {});
    },
    [customerId],
  );

  return { ids: list, record };
}
