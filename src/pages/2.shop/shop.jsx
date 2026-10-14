/* Shop Page (port of Quivogue shop.html) */
import { useState } from "react";

import ProductGrid from "@/components/storefront/ProductGrid";
import PageLoader from "@/components/ui/PageLoader";
import { useFacets, useOffers, useProducts } from "@/store/tanstackStore/queries/site";
import Deals from "./sections/Deals";
import Kits from "./sections/Kits";
import ShopBar from "./sections/ShopBar";
import ShopEmpty from "./sections/ShopEmpty";
import ShopHeader from "./sections/ShopHeader";
import FilterSidebar from "./sections/shopFilters/FilterSidebar";
import { filterProducts, priceBounds } from "./sections/shopFilters/filterProducts";
import { useShopFilters } from "./sections/shopFilters/useShopFilters";

export default function ShopPage() {
  const filters = useShopFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = [], isLoading } = useProducts();
  const { data: facets } = useFacets();
  const { data: offers } = useOffers();

  const list = filterProducts(products, filters.state, offers?.sale);
  const bounds = products.length ? priceBounds(products) : { min: 0, max: 0 };

  return (
    <>
      <section className="section section--tight">
        <div className="wrap">
          <ShopHeader state={filters.state} />
          {isLoading ? (
            <PageLoader />
          ) : (
            <div className="shop-layout">
              <FilterSidebar filters={filters} products={products} facets={facets} bounds={bounds} open={filtersOpen} />
              <div className="min-w-0">
                <ShopBar
                  count={list.length}
                  total={products.length}
                  sort={filters.state.sort}
                  onSort={(sort) => filters.update({ sort: sort === "featured" ? "" : sort })}
                  filtersOpen={filtersOpen}
                  onToggleFilters={() => setFiltersOpen((o) => !o)}
                  active={filters.active}
                />
                {list.length ? <ProductGrid products={list} /> : <ShopEmpty sale={filters.state.sale} onClear={filters.clear} />}
              </div>
            </div>
          )}
        </div>
      </section>
      <Deals />
      <Kits products={products} />
    </>
  );
}
