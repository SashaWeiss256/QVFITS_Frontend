/* Product Rail (New releases, Best sellers) */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import ProductCarousel from "@/components/storefront/ProductCarousel";
import { useProducts, useRails } from "@/store/tanstackStore/queries/site";

/**
 * A heading on the left, then the pieces in a sideways row with "View all"
 * and the arrows on the right. The pieces pick themselves: the newest New
 * arrivals, or the pinned and best selling pieces (getRails). The words come
 * from the Home page editor.
 */
export default function ProductRail({ rail, kind }) {
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: rails, isLoading: loadingRails } = useRails();
  if (!rail) return null;

  const heading = (
    <div className="max-w-xl">
      <p className="kicker">{rail.kicker}</p>
      <h2>{rail.title}</h2>
    </div>
  );

  // While the pieces load, the section keeps its heading and a row of card-shaped placeholders, so the page below does not jump.
  if (loadingProducts || loadingRails) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="mb-12">{heading}</div>
          <SkeletonGrid count={4} />
        </div>
      </section>
    );
  }
  if (!rails) return null;

  const row = rails[kind].map((id) => products.find((p) => p.id === id)).filter(Boolean);
  if (!row.length) return null;

  return (
    <section className="section">
      <div className="wrap">
        {/* Heading, then the pieces with View all and the arrows */}
        <ProductCarousel products={row} label={rail.title} head={<Reveal>{heading}</Reveal>}>
          <Link className="link-arrow" to={rail.href}>View all</Link>
        </ProductCarousel>
      </div>
    </section>
  );
}
