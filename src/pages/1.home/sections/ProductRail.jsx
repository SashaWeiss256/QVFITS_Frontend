/* Product Rail (New releases, Best sellers) */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import ProductGrid from "@/components/storefront/ProductGrid";
import { useProducts, useRails } from "@/store/tanstackStore/queries/site";

/**
 * Four products under a centred heading, then the "see more" button. The
 * pieces pick themselves: the newest New arrivals, or the pinned and best
 * selling pieces (getRails). The words come from the Home page editor.
 */
export default function ProductRail({ rail, kind, tight = false }) {
  const { data: products = [] } = useProducts();
  const { data: rails } = useRails();
  if (!rail || !rails) return null;

  const row = rails[kind].map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
  if (!row.length) return null;

  return (
    <section className={tight ? "section section--tight" : "section"}>
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{rail.kicker}</span>
          <h2>{rail.title}</h2>
        </Reveal>
        <ProductGrid products={row} className="grid-products--four" />
        <p className="center mt-[34px]">
          <Link className="btn btn--ghost" to={rail.href}>{rail.cta}</Link>
        </p>
      </div>
    </section>
  );
}
