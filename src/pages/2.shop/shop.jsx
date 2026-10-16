/* Shop Page (port of Quivogue shop.html) */
import { useCallback, useEffect, useState } from "react";

import { useOverlayFlag } from "@/components/layout/useOverlayFlag";

import ProductGrid from "@/components/storefront/ProductGrid";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { useFacets, useOffers, useProducts } from "@/store/tanstackStore/queries/site";
import AppliedFilters from "./sections/AppliedFilters";
import Deals from "./sections/Deals";
import Kits from "./sections/Kits";
import MobileFilterBar from "./sections/MobileFilterBar";
import SortBar from "./sections/SortBar";
import NoMatches from "./sections/NoMatches";
import ShopHeader from "./sections/ShopHeader";
import FilterSidebar from "./sections/FilterSidebar";
import { filterProducts, priceBounds } from "./filterProducts";
import { useShopFilters } from "./useShopFilters";

export default function ShopPage() {
  // Filter selections live in the URL; only the temporary sheet visibility is local UI state.
  const filters = useShopFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  // The filter sheet is mobile-only. Close it if a resize crosses into the desktop layout.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 881px)");
    const onWide = (e) => e.matches && setFiltersOpen(false);
    wide.addEventListener("change", onWide);
    return () => wide.removeEventListener("change", onWide);
  }, []);
  // Keep page scrolling and floating helpers in sync with the open sheet.
  useOverlayFlag(filtersOpen);

  // The catalogue drives filtering and price bounds; facets populate filter choices.
  const { data: products = [], isLoading } = useProducts();
  const { data: facets } = useFacets();
  const { data: offers } = useOffers();

  // Use the active sale configuration when deriving the visible, sorted product list.
  const list = filterProducts(products, filters.state, offers?.sale);
  // Bounds come from the full catalogue so the price control doesn't shift with filters.
  const bounds = products.length ? priceBounds(products) : { min: 0, max: 0 };

  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          <ShopHeader state={filters.state} />

          {/* Keep the layout stable while the catalogue query is still loading. */}
          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="shop-layout">
              <FilterSidebar filters={filters} products={products} facets={facets} bounds={bounds} open={filtersOpen} onClose={closeFilters} count={list.length} />
              {/* Tapping outside the mobile sheet dismisses it. */}
              {filtersOpen && <div className="sheet-scrim is-on filters__scrim" onClick={closeFilters} />}

              <div className="min-w-0">
                <SortBar
                  count={list.length}
                  total={products.length}
                  sort={filters.state.sort}
                  onSort={(sort) => filters.update({ sort: sort === "featured" ? "" : sort })}
                />
                <AppliedFilters filters={filters} facets={facets} />
                {list.length ? <ProductGrid products={list} /> : <NoMatches sale={filters.state.sale} onClear={filters.clear} />}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile entry point plus supporting shop content below the product listing. */}
      <MobileFilterBar active={filters.active} onOpen={() => setFiltersOpen(true)} />
      <Deals />
      <Kits products={products} />
    </>
  );
}
