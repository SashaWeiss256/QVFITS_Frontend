/* Admin Filters In The URL */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// A value with a comma in it would split into two, so values are encoded in the address.
const encode = (v) => encodeURIComponent(v).replace(/%20/g, "+");
const decode = (v) => {
  try {
    return decodeURIComponent(v.replace(/\+/g, " "));
  } catch {
    return v;
  }
};

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
    () => Object.fromEntries(key.split("|").map((id) => [id, (params.get(id) ?? "").split(",").filter(Boolean).map(decode)])),
    [params, key],
  );

  const setValues = useCallback(
    (id, next) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          if (next.length) out.set(id, next.map(encode).join(","));
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
