/* Product Grid */
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/utils/cn";
import ProductCard from "./ProductCard";

// Cards arrive one after another as the grid scrolls into view.
export default function ProductGrid({ products, className }) {
  return (
    <RevealGroup className={cn("grid-products", className)} stagger={0.06}>
      {products.map((p) => (
        <RevealItem key={p.id}>
          <ProductCard product={p} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
