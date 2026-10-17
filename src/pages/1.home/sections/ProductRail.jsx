/* Product Rail (New releases, Best sellers) */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import ProductCarousel from "@/components/storefront/ProductCarousel";
import { useProducts, useRails } from "@/store/tanstackStore/queries/site";

/**
 * A centred heading, then the pieces in a carousel with the "See more" link
 * between its arrows. The pieces pick themselves: the newest New arrivals, or the pinned and best
 * selling pieces (getRails). The words come from the Home page editor.
 */
export default function ProductRail({ rail, kind, tight = false }) {
  const { data: products = [] } = useProducts();
  const { data: rails } = useRails();
  if (!rail || !rails) return null;

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
