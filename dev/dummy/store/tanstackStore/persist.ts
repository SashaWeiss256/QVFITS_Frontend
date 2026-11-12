/* Query Cache Persistence */
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientProviderProps } from "@tanstack/react-query-persist-client";

import { DAY } from "./queryClient";

/**
 * Public reads survive a reload and a weak connection: the site opens on what
 * a visitor saw last while it refetches. Only ["site", …] is written.
 * Admin and customer data is personal or privileged and is
 * never put in storage.
 */
const persister = createAsyncStoragePersister({
  storage: typeof window === "undefined" ? undefined : window.localStorage,
  key: "qvfits:query-cache",
  throttleTime: 2000,
});

export const persistOptions: PersistQueryClientProviderProps["persistOptions"] = {
  persister,
  maxAge: DAY,
  buster: __APP_BUILD__,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) && query.queryKey[0] === "site",
  },
};
