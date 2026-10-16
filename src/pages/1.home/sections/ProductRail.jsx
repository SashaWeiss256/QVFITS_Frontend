/* Product Rail (New releases, Best sellers) */
import { Link } from "react-router-dom";

import Reveal from "@/components/motion/Reveal";
import ProductGrid from "@/components/storefront/ProductGrid";
import { useProducts } from "@/store/tanstackStore/queries/site";

/**
 * Four products under a centred heading, then the "see more" button. The
 * admin's picks come first; if the list is short or a piece has gone, the
 * row tops up from the badge so it is never left short (Quivogue's row()).
 */
export default function ProductRail({ rail, badge, tight = false }) {
  const { data: products = [] } = useProducts();
  if (!rail) return null;

  const picked = rail.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const rest = products.filter((p) => p.badge === badge && !picked.includes(p));
  const row = [...picked, ...rest].slice(0, 4);
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
