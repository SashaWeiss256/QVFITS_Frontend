/* Shop Page (port of Quivogue shop.html) */
import { useCallback, useMemo, useState } from "react";

import NotFound from "@/pages/not-found";
import ProductGrid from "@/components/storefront/ProductGrid";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { useFacets, useLooks, useOffers, useProducts, useSettings } from "@/store/tanstackStore/queries/site";
import { kitItem } from "@/utils/kits";
import AppliedFilters from "./sections/AppliedFilters";
import Deals from "./sections/Deals";
import FilterDrawer from "./sections/FilterDrawer";
import Kits from "./sections/Kits";
import NoMatches from "./sections/NoMatches";
import ShopHeader from "./sections/ShopHeader";
import ShopToolbar from "./sections/ShopToolbar";
import { filterProducts, priceBounds } from "./filterProducts";
import { useGridSize } from "./useGridSize";
import { useShopFilters } from "./useShopFilters";

/**
 * The shop: everything, or the part an address names (/shop/bras,
 * /shop/movement/pilates, /shop/new, /shop/kits). A plain row holds Filter
 * and Sort side by side, the count and the grid size; the filters open in
 * one drawer, at every width, so the grid keeps the whole page. Kits join the
 * grid as their own cards when Kits is picked. Deals and the kits section
 * show on the plain /shop only.
 */
export default function ShopPage() {
  // Filter selections live in the URL; only the drawer's visibility is local UI state.
  const filters = useShopFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  const { data: products = [], isLoading } = useProducts();
  const { data: looks = [] } = useLooks();
  const { data: facets } = useFacets();
  const { data: offers } = useOffers();
  const { data: settings } = useSettings();
  const grid = useGridSize(settings?.shopGrid);
  const kits = useMemo(() => looks.map((l) => kitItem(l, products)).filter((k) => k.pieces.length), [looks, products]);

  // An address that names no category, group or term is a 404, not an empty shop.
  if (filters.notFound) return <NotFound />;

  const { state } = filters;
  const list = filterProducts(products, state, offers?.sale, filters.lookup, kits);
  // Bounds come from everything for sale, so the price control doesn't shift with filters.
  const bounds = priceBounds([...products, ...kits], offers?.sale);
  // The plain /shop, nothing narrowed: the place for deals and kits.
  const plain = filters.active === 0;
  const total = products.length + (state.labels.includes("kits") ? kits.length : 0);

  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          <ShopHeader state={state} lookup={filters.lookup} />

          {/* Keep the layout stable while the catalogue query is still loading. */}
          {isLoading ? (
            <SkeletonGrid count={8} />
          ) : (
            <>
              <ShopToolbar
                count={list.length}
                total={total}
                active={filters.active}
                onOpenFilters={() => setFiltersOpen(true)}
                sorts={filters.sorts}
                sort={state.sort}
                onSort={(sort) => filters.update({ sort })}
                grid={grid}
              />
              <AppliedFilters filters={filters} facets={facets} />
              {list.length ? (
                <ProductGrid products={list} cols={grid.cols} />
              ) : (
                <NoMatches sale={state.labels.length === 1 && state.labels[0] === "sale"} onClear={filters.clear} />
              )}
            </>
          )}
        </div>
      </section>

      <FilterDrawer open={filtersOpen} onClose={closeFilters} filters={filters} products={products} kits={kits} facets={facets} bounds={bounds} count={list.length} sale={offers?.sale} />

      {plain && <Deals />}
      {plain && <Kits products={products} />}
    </>
  );
}
