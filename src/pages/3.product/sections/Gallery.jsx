/* Gallery */
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import Photo from "@/components/storefront/Photo";
import { cn } from "@/utils/cn";
import Lightbox from "./Lightbox";

// A view is a video when the admin marked it so, or its file is one.
const isVideo = (v) => v?.kind === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(v?.url ?? "");

// The morph between views: the old one dissolves as the new one sharpens in.
const MORPH = {
  initial: { opacity: 0, scale: 1.04, filter: "blur(12px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, filter: "blur(8px)", transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * One large view with a quiet row of small views centred under it. The views
 * follow the colour picked in the buy panel: that colour's own photos and
 * videos first, then any that show no particular colour. Picking a colour
 * morphs the large view to its first photo and the small views re-deal.
 * Clicking a photo opens it large (Lightbox); on a phone the large view
 * swipes. Videos play silently on a loop. No zoom on hover.
 *
 * `colorId` is the colour picked (set by the buy panel).
 */
// The gallery's id, so the buy panel can bring it into view on a phone when the colour changes.
export const VIEWS_ID = "product-views";

export default function Gallery({ product, colorId }) {
  // This colour's views, then the ones for every colour. Never empty: a
  // colour with no photos of its own shows all of them.
  const views = useMemo(() => {
    const all = product.photos ?? [];
    const own = all.filter((v) => colorId && v.colorId === colorId);
    const shared = all.filter((v) => !v.colorId);
    return own.length ? [...own, ...shared] : all;
  }, [product.photos, colorId]);

  // A new colour starts from its first view: the position is kept against the colour it was set for.
  const viewKey = `${colorId}:${product.id}`;
  const [pos, setPos] = useState({ key: viewKey, at: 0 });
  const at = pos.key === viewKey ? pos.at : 0;
  const setAt = (v) => setPos((p) => { const cur = p.key === viewKey ? p.at : 0; return { key: viewKey, at: typeof v === "function" ? v(cur) : v }; });
  const [boxOpen, setBoxOpen] = useState(false);
  const swipe = useRef(null);
  // A swipe is not a tap: after one, the click that follows does not open the lightbox.
  const swiped = useRef(false);

  const view = views[Math.min(at, views.length - 1)];
  const step = (d) => setAt((i) => (i + d + views.length) % views.length);

  // Keyboard: arrows move through the views when the gallery has focus.
  const onKey = (e) => {
    // Keys pressed in the lightbox pass up through its portal: those are the viewer's, not the gallery's.
    if (!e.currentTarget.contains(e.target)) return;
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  // Swipe on a phone; a click or tap opens the photo large.
  const onDown = (e) => { swiped.current = false; swipe.current = e.pointerType === "mouse" ? null : e.clientX; };
  const onUp = (e) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    if (Math.abs(dx) > 40) { swiped.current = true; step(dx < 0 ? 1 : -1); }
    swipe.current = null;
  };
  const open = () => { if (!swiped.current && !isVideo(view)) setBoxOpen(true); };

  if (!view) return <div className="aspect-[4/5] bg-beige" />;

  return (
    <div id={VIEWS_ID} className="flex flex-col gap-4" role="region" aria-label={`${product.name}, views`} tabIndex={0} onKeyDown={onKey}>
      {/* Large view */}
      <div
        className={cn("relative aspect-[4/5] touch-pan-y overflow-hidden bg-beige", !isVideo(view) && "cursor-pointer")}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onClick={open}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <m.div key={`${colorId}-${view.id}`} className="absolute inset-0" {...MORPH}>
            {isVideo(view) ? (
              <video className="h-full w-full object-cover" src={view.url} autoPlay muted loop playsInline aria-label={`${product.name}, video`} />
            ) : (
              <Photo photo={view} label={product.name} eager={at === 0} wide className="absolute inset-0" />
            )}
          </m.div>
        </AnimatePresence>

        {/* Step through: arrows and a count, over the photo */}
        {views.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
              <button type="button" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-cream/85 text-ink backdrop-blur transition-colors hover:bg-cream" aria-label="Previous view" onClick={(e) => { e.stopPropagation(); step(-1); }}>
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button type="button" className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-cream/85 text-ink backdrop-blur transition-colors hover:bg-cream" aria-label="Next view" onClick={(e) => { e.stopPropagation(); step(1); }}>
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <span className="absolute bottom-4 left-4 bg-cream/85 px-2.5 py-1 text-[0.75rem] tabular-nums text-ink backdrop-blur" aria-live="polite">
              {at + 1} / {views.length}
            </span>
          </>
        )}
      </div>

      {/* Small views: one quiet row, centred under the large view */}
      {views.length > 1 && (
        <div className="mx-auto flex w-max max-w-full gap-2.5 overflow-x-auto p-0.5 [scrollbar-width:none] sm:gap-3" aria-label="Choose a view">
          {views.map((v, i) => (
            <button
              key={`${colorId}-${v.id}`}
              type="button"
              aria-label={`View ${i + 1}${isVideo(v) ? ", video" : ""}`}
              aria-current={i === at}
              onClick={() => setAt(i)}
              className={cn(
                "relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-beige transition-opacity sm:w-16 lg:w-[72px]",
                i === at ? "opacity-100 outline outline-1 outline-offset-2 outline-ink" : "opacity-55 hover:opacity-100",
              )}
            >
              {isVideo(v) ? (
                <>
                  <video className="h-full w-full object-cover" src={v.url} muted playsInline preload="metadata" aria-hidden="true" />
                  <span className="absolute inset-0 grid place-items-center bg-ink/20 text-cream"><Play className="h-4 w-4" fill="currentColor" aria-hidden="true" /></span>
                </>
              ) : (
                <Photo photo={v} label="" className="absolute inset-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {boxOpen && <Lightbox views={views} at={Math.min(at, views.length - 1)} name={product.name} onStep={step} onClose={() => setBoxOpen(false)} />}
    </div>
  );
}
