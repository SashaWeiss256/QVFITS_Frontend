/* Product Rail */
import { Link } from "react-router-dom";

import ProductGrid from "@/components/storefront/ProductGrid";
import Reveal from "@/components/ui/Reveal";
import { useProducts } from "@/store/tanstackStore/queries/site";

/**
 * Four products under a centred heading. The curated ids come first; if the
 * list is short or an id has gone, the row tops up from the badge so it is
 * never left short (Quivogue's row()).
 */
export default function ProductRail({ kicker, title, ids = [], badge, cta, to, tight = false }) {
  const { data: products = [] } = useProducts();
  const picked = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const rest = products.filter((p) => p.badge === badge && !picked.includes(p));
  const row = [...picked, ...rest].slice(0, 4);
  if (!row.length) return null;

  return (
    <section className={tight ? "section section--tight" : "section"}>
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="kicker">{kicker}</span>
          <h2>{title}</h2>
        </Reveal>
        <ProductGrid products={row} />
        <p className="center mt-[34px]">
          <Link className="btn btn--ghost" to={to}>{cta}</Link>
        </p>
      </div>
    </section>
  );
}
