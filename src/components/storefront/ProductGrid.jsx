/* Product Grid */
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { cn } from "@/utils/cn";
import KitCard from "./KitCard";
import ProductCard from "./ProductCard";

// Cards arrive one after another as the grid scrolls into view. `cols` sets
// how many sit in a row (the shop page's grid size); without it the grid fits
// as many as the width allows. A kit (kind "kit") gets its own card.
export default function ProductGrid({ products, className, cols }) {
  return (
    <RevealGroup className={cn("grid-products", cols && "grid-products--cols", className)} style={cols ? { "--cols": cols } : undefined} stagger={0.06}>
      {products.map((p) => (
        <RevealItem key={p.id}>
          {p.kind === "kit" ? <KitCard kit={p} /> : <ProductCard product={p} />}
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
