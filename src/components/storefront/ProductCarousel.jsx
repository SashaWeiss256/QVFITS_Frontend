/* Product Carousel */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import ProductCard from "./ProductCard";

/**
 * A row of product cards that slides sideways: four in view on a laptop, two
 * and a bit on a tablet, one and a bit on a phone so the next card peeks
 * out. It scrolls by swipe, trackpad or keyboard (the row is focusable,
 * arrow keys page it), and the two quiet arrows page through it. A thin line
 * under the row shows how far along you are. `head` sits on the left of the
 * control row (a section heading), `children` beside the arrows ("View all").
 */
export default function ProductCarousel({ products, label, head, children }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [progress, setProgress] = useState({ at: 0, size: 1 });

  // Which ends are reached, and how much of the row is in view.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
    setProgress({ at: max > 0 ? el.scrollLeft / max : 0, size: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1 });
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
  const ARROW = "grid h-11 w-11 place-items-center rounded-full border border-line-2 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      {/* Controls: the heading on the left; the link, back and forward on the right */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        {head}
        <div className="flex items-center gap-6">
        {children}
        {many && (
          <div className="hidden gap-2 sm:flex">
            <button type="button" className={ARROW} aria-label={`Previous ${label}`} disabled={edge.start} onClick={() => page(-1)}><ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
            <button type="button" className={ARROW} aria-label={`Next ${label}`} disabled={edge.end} onClick={() => page(1)}><ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /></button>
          </div>
        )}
        </div>
      </div>

      {/* Row */}
      <div
        ref={track}
        className="-mx-[clamp(20px,4vw,56px)] flex snap-x snap-mandatory gap-[clamp(12px,1.6vw,24px)] overflow-x-auto scroll-px-[clamp(20px,4vw,56px)] px-[clamp(20px,4vw,56px)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-3*clamp(12px,1.6vw,24px))/4)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* How far along the row is */}
      {many && progress.size < 1 && (
        <div className="relative mt-8 h-px bg-line-2" aria-hidden="true">
          <span className="absolute inset-y-0 bg-ink transition-[left] duration-300" style={{ width: `${progress.size * 100}%`, left: `${progress.at * (1 - progress.size) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
