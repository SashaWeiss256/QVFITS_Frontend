/* Recently Viewed Rail */
import { useMemo } from "react";

import { useRecentlyViewed } from "@/store/context/recentlyViewed";
import { useProducts } from "@/store/tanstackStore/queries/site";
import ProductGrid from "./ProductGrid";

/**
 * What the shopper looked at lately, as the shop's 4-card grid. `except`
 * leaves out the piece already on screen. Nothing shows until there is
 * something to show.
 */
export default function RecentlyViewed({ except, title = "Recently viewed", kicker = "Pick up where you left off", bare = false }) {
  const { ids } = useRecentlyViewed();
  const { data: products = [] } = useProducts();
  const picks = useMemo(() => ids.filter((id) => id !== except).map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4), [ids, except, products]);
  if (!picks.length) return null;

  const body = (
    <>
      <div className="section-head section-head--row">
        <div>
          <span className="kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <ProductGrid products={picks} />
    </>
  );
  // Bare: inside a page that already has its own column, such as the account.
  if (bare) return <section className="mt-8">{body}</section>;
  return (
    <section className="section section--tight">
      <div className="wrap">{body}</div>
    </section>
  );
}
