/* Admin Tab In The URL */
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * The open tab of a page that holds several (Products: Products, Stock,
 * Reviews), kept in ?tab= so a link can open one directly and the back
 * button returns to it. The first tab is the default and stays off the URL.
 */
export function useTab(tabs) {
  const [params, setParams] = useSearchParams();
  const wanted = params.get("tab");
  const tab = tabs.some((t) => t.id === wanted) ? wanted : tabs[0].id;
  const setTab = useCallback(
    (id) =>
      setParams((prev) => {
        const next = new URLSearchParams();
        if (id !== tabs[0].id) next.set("tab", id);
        // Filters belong to the tab they were set on, so they reset on a switch.
        if (prev.get("tab") === id) return prev;
        return next;
      }),
    [setParams, tabs],
  );
  return [tab, setTab];
}
