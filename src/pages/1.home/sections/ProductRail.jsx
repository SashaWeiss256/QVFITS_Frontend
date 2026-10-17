/* Product Rail (New releases, Best sellers) */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import ProductCarousel from "@/components/storefront/ProductCarousel";
import { useProducts, useRails } from "@/store/tanstackStore/queries/site";

/**
 * A centred heading, then the pieces in a carousel with the "See more" link
 * between its arrows. The pieces pick themselves: the newest New arrivals, or the pinned and best
 * selling pieces (getRails). The words come from the Home page editor.
 */
export default function ProductRail({ rail, kind, tight = false }) {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: rails, isLoading: loadingRails } = useRails();
  if (!rail) return null;
  // While the pieces load, the section keeps its heading and a row of card-shaped placeholders, so the page below does not jump.
  if (loadingProducts || loadingRails) {
    return (
      <section className={tight ? "section section--tight" : "section"}>
        <div className="wrap">
          <div className="section-head center">
            <span className="kicker">{rail.kicker}</span>
            <h2>{rail.title}</h2>
          </div>
          <SkeletonGrid count={4} className="grid-products--four" />
        </div>
      </section>
    );
  }
  if (!rails) return null;

  const row = rails[kind].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!row.length) return null;

  return (
    <section className={tight ? "section section--tight" : "section"}>
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{rail.kicker}</span>
          <h2>{rail.title}</h2>
        </Reveal>
        {/* The rail's pieces slide sideways; See more goes to the whole list */}
        <ProductCarousel products={row} label={rail.title}>
          <Link className="btn btn--ghost" to={rail.href}>{rail.cta}</Link>
        </ProductCarousel>
      </div>
    </section>
  );
}
