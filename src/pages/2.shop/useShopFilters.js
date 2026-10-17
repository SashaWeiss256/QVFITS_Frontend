/* Shop Filter State */
import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useFacets } from "@/store/tanstackStore/queries/site";
import { LABELS, resolveShopPath, targetHref } from "@/utils/shopTargets";

// What the shop shows lives in the URL, so a view can be shared and bookmarked.
// The path holds the part of the shop (/shop/bras, /shop/movement/pilates,
// /shop/bras/movement/running, /shop/new), resolved by utils/shopTargets
// exactly as the menus build it. The query string holds the rest: the Edits
// picked (show=new,sale), size, colour, price, stock, sort and a search.
// Every order the shop knows; the admin picks which show, their names and the default.
export const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "bestselling", label: "Best selling" },
  { id: "new", label: "Newest" },
  { id: "low", label: "Price, low to high" },
  { id: "high", label: "Price, high to low" },
];

const split = (v) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
const LEGACY_BADGE = { New: "new", Bestseller: "bestseller" };
const num = (v) => (v && Number.isFinite(Number(v)) ? Number(v) : null);

/** The address for a filter state: the scope as a path, everything else as the query. */
function shopHref(s, lookup) {
  const query = new URLSearchParams();
  // One Edit on its own reads best as its own page: /shop/new, /shop/kits.
  const alone = !s.cats.length && !s.terms.length && s.labels.length === 1;
  const label = alone ? s.labels[0] : undefined;
  if (!alone && s.labels.length) query.set("show", s.labels.join(","));
  if (s.sizes.length) query.set("size", s.sizes.join(","));
  if (s.colors.length) query.set("color", s.colors.join(","));
  if (s.minPrice) query.set("min", String(s.minPrice));
  if (s.maxPrice) query.set("max", String(s.maxPrice));
  if (s.inStock) query.set("stock", "1");
  if (s.sort && s.sort !== s.defaultSort) query.set("sort", s.sort);
  if (s.query) query.set("q", s.query);
  const path = targetHref({ categories: s.cats, terms: s.terms, label }, lookup);
  return query.size ? `${path}?${query}` : path;
}

export function useShopFilters() {
  const { "*": splat = "" } = useParams();
  const [params] = useSearchParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { data: facets } = useFacets();

  const lookup = useMemo(() => facets && { categories: facets.categoryList, groups: facets.groups, terms: facets.terms }, [facets]);
  // undefined while the facets load, null for an address that shows nothing.
  const resolved = lookup ? resolveShopPath(splat, lookup) : undefined;
  const scope = resolved?.target;

  // The Sort menu as set in the admin (Catalog, Categories, Filter and sort).
  const sortConfig = facets?.filters.sort;
  const sorts = useMemo(() => {
    const set = sortConfig?.options?.filter((o) => o.visible && SORTS.some((s) => s.id === o.id));
    return set?.length ? set.map((o) => ({ id: o.id, label: o.label })) : SORTS;
  }, [sortConfig]);
  const defaultSort = sorts.some((s) => s.id === sortConfig?.default) ? sortConfig.default : sorts[0].id;

  const state = useMemo(() => {
    const sort = params.get("sort");
    // Edits: the page's own label, the show= list, and the old ?badge= and ?sale=1 links.
    const labels = new Set(split(params.get("show")).filter((l) => LABELS[l]));
    if (scope?.label) labels.add(scope.label);
    if (LEGACY_BADGE[params.get("badge")]) labels.add(LEGACY_BADGE[params.get("badge")]);
    if (params.get("sale") === "1") labels.add("sale");
    return {
      cats: scope?.categories ?? [],
      terms: scope?.terms ?? [],
      labels: Object.keys(LABELS).filter((l) => labels.has(l)),
      sizes: split(params.get("size")),
      colors: split(params.get("color")),
      minPrice: num(params.get("min")),
      maxPrice: num(params.get("max")),
      inStock: params.get("stock") === "1",
      sort: sorts.some((s) => s.id === sort) ? sort : defaultSort,
      defaultSort,
      query: (params.get("q") ?? "").trim().slice(0, 80),
    };
  }, [params, scope, sorts, defaultSort]);

  // Old addresses keep working: a renamed slug, ?badge= and ?sale=1, and
  // the ?c=Swim and ?occasion=lounge links from before the shop had paths.
  useEffect(() => {
    if (!lookup || !resolved) return;
    if (resolved.redirect) {
      navigate(`${resolved.redirect}${search}`, { replace: true });
      return;
    }
    const c = split(params.get("c"));
    const occasion = split(params.get("occasion"));
    const legacy = params.has("badge") || params.has("sale");
    if (!c.length && !occasion.length && !legacy) return;
    const cats = lookup.categories.filter((x) => c.includes(x.name) || c.includes(x.slug)).map((x) => x.id);
    const terms = lookup.terms.filter((x) => x.groupId === "movement" && (occasion.includes(x.id) || occasion.includes(x.slug))).map((x) => x.id);
    navigate(shopHref({ ...state, cats: [...state.cats, ...cats], terms: [...state.terms, ...terms] }, lookup), { replace: true });
  }, [lookup, resolved, params, search, state, navigate]);

  const update = useCallback(
    (change) => {
      if (!lookup) return;
      const next = { ...state };
      for (const [key, value] of Object.entries(change)) next[key === "q" ? "query" : key] = value ?? (Array.isArray(state[key]) ? [] : "");
      navigate(shopHref(next, lookup), { replace: true });
    },
    [state, lookup, navigate],
  );

  const toggle = useCallback(
    (key, value) => update({ [key]: state[key].includes(value) ? state[key].filter((v) => v !== value) : [...state[key], value] }),
    [state, update],
  );

  const clear = useCallback(() => navigate("/shop", { replace: true }), [navigate]);

  // What narrows the grid (sort only orders it, so it isn't counted).
  const active =
    state.cats.length + state.terms.length + state.labels.length + state.sizes.length + state.colors.length +
    (state.minPrice || state.maxPrice ? 1 : 0) + (state.inStock ? 1 : 0) + (state.query ? 1 : 0);

  return { state, update, toggle, clear, active, sorts, lookup, notFound: resolved === null };
}
