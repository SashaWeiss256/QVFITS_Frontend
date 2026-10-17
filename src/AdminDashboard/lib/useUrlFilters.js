/* Admin Filters In The URL */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * A list's filters kept in the address (?type=kit&status=active,draft), so a
 * filtered view can be shared, survives a reload, and a link can open it
 * (after belioras useUrlFilters). Each id holds any number of values; an
 * empty one leaves the address. History is replaced, not pushed.
 */
export function useUrlFilters(ids) {
  const [params, setParams] = useSearchParams();
  const key = ids.join("|");

  const values = useMemo(
    () => Object.fromEntries(key.split("|").map((id) => [id, (params.get(id) ?? "").split(",").filter(Boolean)])),
    [params, key],
  );

  const setValues = useCallback(
    (id, next) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next.length) out.set(id, next.join(","));
          else out.delete(id);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  const clear = useCallback(
    () =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          key.split("|").forEach((id) => out.delete(id));
          return out;
        },
        { replace: true },
      ),
    [setParams, key],
  );

  return { values, setValues, clear };
}
