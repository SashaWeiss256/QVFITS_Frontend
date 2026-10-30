/* Complete The Look */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

import { askVee } from "@/components/assistant/askVee";
import Reveal from "@/components/motion/Reveal";
import { useStyleWith } from "@/store/tanstackStore/queries/site";
import OutfitCard from "./OutfitCard";

/**
 * Under a piece: outfits built around it by the same colour engine Vee uses,
 * in the colours that work with it, kits first. They sit in one row that
 * swipes on a phone and steps with the arrows on a laptop, each card snapping
 * into place. Nothing shows when no combination works or stock is short,
 * rather than a weak suggestion.
 */
export default function StyleWith({ product }) {
  const { data: outfits = [] } = useStyleWith(product.type === "kit" ? undefined : product.id);
  const row = useRef(null);
  // Which ends of the row are reached: the arrows show only when there is more to scroll to.
  const [edge, setEdge] = useState({ start: true, end: true });
  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, outfits.length]);
  if (!outfits.length) return null;

  // One card at a time: the width of the first card plus the gap.
  const step = (dir) => {
    const el = row.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20), behavior: "smooth" });
  };

  return (
    <section className="section section--tight" aria-labelledby="style-with">
      <div className="wrap">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Colours checked</span>
            <h2 id="style-with" className="m-0">Complete the look.</h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn--ghost" onClick={() => askVee(`What goes with the ${product.name}?`)}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask Vee
            </button>
            {!(edge.start && edge.end) && (
              <div className="hidden gap-2 sm:flex">
                <button type="button" className="grid h-11 w-11 place-items-center border border-line transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30" aria-label="Previous looks" disabled={edge.start} onClick={() => step(-1)}>
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button type="button" className="grid h-11 w-11 place-items-center border border-line transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30" aria-label="Next looks" disabled={edge.end} onClick={() => step(1)}>
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* The row bleeds to the screen edge on a phone so it reads as swipeable */}
      <div
        ref={row}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(20px,calc((100vw-1440px)/2+56px))] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "max(20px, calc((100vw - 1440px) / 2 + 56px))" }}
        onScroll={measure}
        tabIndex={0}
        role="region"
        aria-label="Outfits that go with this piece"
      >
        {outfits.slice(0, 6).map((o) => (
          <div key={`${o.kind}-${o.title}-${o.pieces.map((p) => p.colorId).join("")}`} className="flex w-[min(84vw,400px)] shrink-0 snap-start">
            <div className="w-full"><OutfitCard outfit={o} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
