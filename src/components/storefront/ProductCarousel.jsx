/* Product Carousel */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";
import ProductCard from "./ProductCard";

/**
 * A row of product cards that slides sideways: four in view on a laptop, two
 * on a tablet, and one and a bit on a phone so the next card peeks out.
 * It scrolls by swipe, trackpad or keyboard (the row is focusable, arrow
 * keys scroll it), and the round buttons below page through it. The buttons
 * dim at either end. `children` sits between them (the "See more" link).
 */
export default function ProductCarousel({ products, label, children }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // Which ends are reached, so the matching button can dim.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, products.length]);

  // One page at a time: as far as the row is wide, so nothing is skipped.
  const page = (dir) => {
    const el = track.current;
    if (!el) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: still ? "auto" : "smooth" });
  };

  const many = products.length > 1;

  return (
    <div className="carousel">
      <div
        ref={track}
        className="carousel__track"
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onScroll={measure}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
        }}
      >
        {products.map((p) => (
          <div key={p.id} className="carousel__item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Controls: back, the see-more link, forward */}
      <div className="carousel__foot">
        {many && <button type="button" className={cn("carousel__btn", edge.start && "is-off")} aria-label={`Previous ${label}`} disabled={edge.start} onClick={() => page(-1)}><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>}
        {children}
        {many && <button type="button" className={cn("carousel__btn", edge.end && "is-off")} aria-label={`Next ${label}`} disabled={edge.end} onClick={() => page(1)}><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>}
      </div>
    </div>
  );
}
