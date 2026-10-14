/* Best Sellers */
import { useRails } from "@/store/tanstackStore/queries/site";
import ProductRail from "./ProductRail";

export default function BestSellers() {
  const { data: rails } = useRails();
  return <ProductRail kicker="Most loved" title="Best sellers" ids={rails?.bestSellers} badge="Bestseller" cta="See more" to="/shop?badge=Bestseller" tight />;
}
