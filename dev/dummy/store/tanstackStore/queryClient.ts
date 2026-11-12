/* Query Client */
import { MutationCache, QueryCache, QueryClient, type QueryKey } from "@tanstack/react-query";

import { ApiError, isServerError } from "./services/api/error";
import { notify } from "./notices";
import { adminRoot } from "./queries/keys";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError | Error;
    queryMeta: {
      /** What to call this data in a "couldn't refresh" notice. */
      label?: string;
    };
    mutationMeta: {
      /** Keys to refresh once the mutation succeeds; see MutationCache below. */
      invalidates?: readonly QueryKey[];
      /**
       * The caller shows its own error (a form's inline message), or the write
       * is a quiet background save; skip the app-wide notice.
       */
      handlesErrors?: boolean;
      /**
       * A confirmation once the write lands and the page has refreshed, e.g.
       * "Product deleted". Opt-in: the admin's writes set it; the storefront's
       * flows (checkout, payments) show their own result instead.
       */
      success?: string | ((data: unknown, variables: unknown) => string | undefined);
    };
  }
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * The one cache for the storefront, the customer account and the admin (docs/03-data-layer.md).
 * Keys are realm-rooted: ["site", …], ["customer", id, …] and ["admin", …].
 */
export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // A failed first load shows in the page. A failed background refresh
    // would otherwise be silent while stale data sits on screen, so say so.
    onError: (error, query) => {
      if (query.state.data === undefined) return;
      const what = query.meta?.label ?? "this page";
      notify(`Couldn't refresh ${what}. Showing what we had.`);
      if (import.meta.env.DEV) console.warn(error);
    },
  }),
  mutationCache: new MutationCache({
    // One place for write failures: unless the caller shows its own message,
    // say what went wrong (ApiError messages are written for people). A form
    // stays open with its values, so trying again costs nothing.
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.handlesErrors) return;
      notify(error instanceof ApiError && error.message ? error.message : "That didn't save. Check your connection and try again.", { tone: "error" });
      if (import.meta.env.DEV) console.warn(error);
    },
    // A mutation names what it changes; refresh those once it lands. Returned
    // so mutateAsync resolves after the refetch, and forms close on fresh data.
    // The confirmation waits for that refresh, so it arrives with the change.
    onSuccess: async (data, variables, _context, mutation) => {
      const keys = mutation.meta?.invalidates ?? [];
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      const success = mutation.meta?.success;
      const message = typeof success === "function" ? success(data, variables) : success;
      if (message) notify(message, { tone: "success" });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // At least the persister's maxAge, or restored data is dropped at once.
      gcTime: DAY,
      refetchOnWindowFocus: false,
      // A 4xx will not fix itself; retry only the server's own failures.
      retry: (count, error) => isServerError(error) && count < 2,
      // Server failures on a first load go to the nearest error boundary;
      // everything else is handled in the page.
      throwOnError: (error, query) =>
        query.state.data === undefined && error instanceof ApiError && error.status >= 500,
    },
  },
});

// Admin data goes stale while an editor works in another tab.
queryClient.setQueryDefaults(adminRoot, { refetchOnWindowFocus: true });

export { DAY };
