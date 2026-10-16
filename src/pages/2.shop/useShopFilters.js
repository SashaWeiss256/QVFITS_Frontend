/* Shop Filter State */
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// The URL is the filter state, as on Quivogue, so a filtered view can be
// shared, bookmarked and reached from the nav (?badge=New), the search
// (?q=), the hero (?occasion=lounge) and the sale slide (?sale=1).
const LISTS = { cats: "c", sizes: "size", colors: "color", occs: "occasion" };
export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "new", label: "New in" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
  { id: "az", label: "A to Z" },
];

const split = (v) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);

export function useShopFilters() {
  const [params, setParams] = useSearchParams();

  const state = useMemo(() => {
    const sort = params.get("sort");
    return {
      cats: split(params.get(LISTS.cats)),
      sizes: split(params.get(LISTS.sizes)),
      colors: split(params.get(LISTS.colors)),
      occs: split(params.get(LISTS.occs)),
      maxPrice: params.get("max") ? Number(params.get("max")) : null,
      inStock: params.get("stock") === "1",
      sort: SORTS.some((s) => s.id === sort) ? sort : "featured",
      query: (params.get("q") ?? "").trim().slice(0, 80),
      badge: params.get("badge") ?? "",
      sale: params.get("sale") === "1",
    };
  }, [params]);

  const update = useCallback(
    (change) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(change)) {
            const name = LISTS[key] ?? { maxPrice: "max", inStock: "stock" }[key] ?? key;
            const out = Array.isArray(value) ? value.join(",") : value === true ? "1" : value;
            if (out === "" || out === null || out === undefined || out === false) next.delete(name);
            else next.set(name, String(out));
          }
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  const toggle = useCallback(
    (key, value) => update({ [key]: state[key].includes(value) ? state[key].filter((v) => v !== value) : [...state[key], value] }),
    [state, update],
  );

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const active =
    state.cats.length + state.sizes.length + state.colors.length + state.occs.length +
    (state.maxPrice ? 1 : 0) + (state.inStock ? 1 : 0) + (state.badge ? 1 : 0) + (state.sale ? 1 : 0) + (state.query ? 1 : 0);

  return { state, update, toggle, clear, active };
}
