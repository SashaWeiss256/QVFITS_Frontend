/* Wears Well With (from Quivogue renderRelated()) */
import ProductGrid from "@/components/storefront/ProductGrid";
import { useProducts } from "@/store/tanstackStore/queries/site";
import { anyInStock } from "@/utils/stockLevel";

// Shares an activity, prefers a different category so it reads as a kit
// rather than a duplicate, and a shared colour breaks ties. In stock only.
export default function Related({ product }) {
  const { data: products = [] } = useProducts();
  const picks = products
    .filter((p) => p.id !== product.id && anyInStock(p))
    .map((p) => ({
      p,
      score:
        p.occasions.filter((o) => product.occasions.includes(o)).length * 2 +
        (p.category !== product.category ? 2 : 0) +
        (p.colors.some((c) => product.colors.includes(c)) ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.p);
  if (!picks.length) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="section-head section-head--row">
          <div>
            <span className="kicker">Completes the kit</span>
            <h2>Wears well with</h2>
          </div>
        </div>
        <ProductGrid products={picks} />
      </div>
    </section>
  );
}
